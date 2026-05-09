using Microsoft.AspNetCore.Mvc;
using Octokit;
using StackExchange.Redis;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// GitHub Client
builder.Services.AddSingleton<GitHubClient>(sp =>
{
    var client = new GitHubClient(new ProductHeaderValue("GitHubInsightsPro"));
    
    // Optional: Add GitHub token for higher rate limits (5000/hour vs 60/hour)
    var token = builder.Configuration["GitHub:Token"];
    if (!string.IsNullOrEmpty(token))
    {
        client.Credentials = new Credentials(token);
    }
    
    return client;
});

// Redis Cache
builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
{
    var redisConnection = builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379";
    return ConnectionMultiplexer.Connect(redisConnection);
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",
            "http://localhost:3000",
            "https://*.vercel.app"
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

// Helper: Get from cache or fetch
async Task<T?> GetOrFetchAsync<T>(
    IDatabase cache,
    string cacheKey,
    Func<Task<T>> fetchFunc,
    TimeSpan? expiration = null)
{
    var cached = await cache.StringGetAsync(cacheKey);
    if (!cached.IsNullOrEmpty)
    {
        return JsonSerializer.Deserialize<T>(cached!);
    }
    
    var data = await fetchFunc();
    if (data != null)
    {
        await cache.StringSetAsync(
            cacheKey,
            JsonSerializer.Serialize(data),
            expiration ?? TimeSpan.FromMinutes(5)
        );
    }
    
    return data;
}

// =============================================================================
// ENDPOINTS
// =============================================================================

// Health check
app.MapGet("/health", () => Results.Ok(new
{
    status = "healthy",
    timestamp = DateTime.UtcNow,
    service = "GitHubInsightsPro Backend"
}));

// Get user profile with stats
app.MapGet("/api/user/{username}", async (
    string username,
    GitHubClient github,
    IConnectionMultiplexer redis) =>
{
    var cache = redis.GetDatabase();
    var cacheKey = $"user:{username}";
    
    try
    {
        var stats = await GetOrFetchAsync(cache, cacheKey, async () =>
        {
            var user = await github.User.Get(username);
            var repos = await github.Repository.GetAllForUser(username);
            
            return new
            {
                Username = user.Login,
                Name = user.Name,
                AvatarUrl = user.AvatarUrl,
                Bio = user.Bio,
                Company = user.Company,
                Location = user.Location,
                Email = user.Email,
                Blog = user.Blog,
                PublicRepos = user.PublicRepos,
                Followers = user.Followers,
                Following = user.Following,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
                TotalStars = repos.Sum(r => r.StargazersCount),
                TotalForks = repos.Sum(r => r.ForksCount),
                TotalSize = repos.Sum(r => r.Size),
                Repositories = repos
                    .OrderByDescending(r => r.StargazersCount)
                    .Take(20)
                    .Select(r => new
                    {
                        r.Id,
                        r.Name,
                        r.FullName,
                        r.Description,
                        r.StargazersCount,
                        r.ForksCount,
                        r.Language,
                        r.Size,
                        r.OpenIssuesCount,
                        r.UpdatedAt,
                        r.CreatedAt,
                        r.HtmlUrl,
                        r.Homepage,
                        Topics = r.Topics,
                        r.Private,
                        r.Fork
                    })
                    .ToList()
            };
        });
        
        return Results.Ok(stats);
    }
    catch (NotFoundException)
    {
        return Results.NotFound(new { error = $"User '{username}' not found" });
    }
    catch (RateLimitExceededException)
    {
        return Results.StatusCode(429);
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message);
    }
});

// Get language distribution
app.MapGet("/api/user/{username}/languages", async (
    string username,
    GitHubClient github,
    IConnectionMultiplexer redis) =>
{
    var cache = redis.GetDatabase();
    var cacheKey = $"languages:{username}";
    
    try
    {
        var languages = await GetOrFetchAsync(cache, cacheKey, async () =>
        {
            var repos = await github.Repository.GetAllForUser(username);
            var languageBytes = new Dictionary<string, long>();
            
            foreach (var repo in repos.Where(r => !r.Fork))
            {
                try
                {
                    var repoLangs = await github.Repository.GetAllLanguages(repo.Id);
                    foreach (var lang in repoLangs)
                    {
                        if (languageBytes.ContainsKey(lang.Name))
                            languageBytes[lang.Name] += lang.NumberOfBytes;
                        else
                            languageBytes[lang.Name] = lang.NumberOfBytes;
                    }
                }
                catch { /* Skip repos without language data */ }
            }
            
            var total = (double)languageBytes.Values.Sum();
            if (total == 0) return new List<object>();
            
            return languageBytes
                .Select(l => new
                {
                    Language = l.Key,
                    Bytes = l.Value,
                    Percentage = Math.Round(l.Value / total * 100, 2)
                })
                .OrderByDescending(l => l.Bytes)
                .ToList<object>();
        });
        
        return Results.Ok(languages);
    }
    catch (NotFoundException)
    {
        return Results.NotFound(new { error = $"User '{username}' not found" });
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message);
    }
});

// Get activity (commits timeline)
app.MapGet("/api/user/{username}/activity", async (
    string username,
    GitHubClient github,
    IConnectionMultiplexer redis) =>
{
    var cache = redis.GetDatabase();
    var cacheKey = $"activity:{username}";
    
    try
    {
        var activity = await GetOrFetchAsync(cache, cacheKey, async () =>
        {
            var events = await github.Activity.Events.GetAllUserPerformed(username);
            
            var commitActivity = events
                .Where(e => e.Type == "PushEvent")
                .GroupBy(e => e.CreatedAt.Date)
                .Select(g => new
                {
                    Date = g.Key.ToString("yyyy-MM-dd"),
                    Count = g.Count()
                })
                .OrderBy(x => x.Date)
                .ToList<object>();
            
            return commitActivity;
        }, TimeSpan.FromMinutes(15));
        
        return Results.Ok(activity);
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message);
    }
});

// Get contribution stats
app.MapGet("/api/user/{username}/stats", async (
    string username,
    GitHubClient github,
    IConnectionMultiplexer redis) =>
{
    var cache = redis.GetDatabase();
    var cacheKey = $"stats:{username}";
    
    try
    {
        var stats = await GetOrFetchAsync(cache, cacheKey, async () =>
        {
            var repos = await github.Repository.GetAllForUser(username);
            var events = await github.Activity.Events.GetAllUserPerformed(username);
            
            var pushEvents = events.Where(e => e.Type == "PushEvent").ToList();
            var prEvents = events.Where(e => e.Type == "PullRequestEvent").ToList();
            var issueEvents = events.Where(e => e.Type == "IssuesEvent").ToList();
            
            // Calculate streak
            var commitDates = pushEvents
                .Select(e => e.CreatedAt.Date)
                .Distinct()
                .OrderByDescending(d => d)
                .ToList();
            
            var currentStreak = 0;
            var expectedDate = DateTime.UtcNow.Date;
            
            foreach (var date in commitDates)
            {
                if (date == expectedDate)
                {
                    currentStreak++;
                    expectedDate = expectedDate.AddDays(-1);
                }
                else break;
            }
            
            return new
            {
                TotalCommits = pushEvents.Count,
                TotalPRs = prEvents.Count,
                TotalIssues = issueEvents.Count,
                CurrentStreak = currentStreak,
                MostActiveDay = commitDates.FirstOrDefault(),
                AvgRepoSize = repos.Any() ? (int)repos.Average(r => r.Size) : 0,
                TotalStars = repos.Sum(r => r.StargazersCount),
                TotalForks = repos.Sum(r => r.ForksCount),
                MostStarredRepo = repos.OrderByDescending(r => r.StargazersCount).FirstOrDefault()?.Name,
                MostForkedRepo = repos.OrderByDescending(r => r.ForksCount).FirstOrDefault()?.Name,
                LanguagesCount = repos.Select(r => r.Language).Where(l => l != null).Distinct().Count()
            };
        });
        
        return Results.Ok(stats);
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message);
    }
});

// Get repo details
app.MapGet("/api/repo/{owner}/{repoName}", async (
    string owner,
    string repoName,
    GitHubClient github) =>
{
    try
    {
        var repo = await github.Repository.Get(owner, repoName);
        var commitsRequest = new ApiOptions { PageSize = 10 };
        var commits = await github.Repository.Commit.GetAll(owner, repoName, commitsRequest);
        var contributors = await github.Repository.GetAllContributors(owner, repoName);
        
        return Results.Ok(new
        {
            Name = repo.Name,
            FullName = repo.FullName,
            Description = repo.Description,
            Stars = repo.StargazersCount,
            Forks = repo.ForksCount,
            Watchers = repo.StargazersCount,
            Language = repo.Language,
            OpenIssues = repo.OpenIssuesCount,
            CreatedAt = repo.CreatedAt,
            UpdatedAt = repo.UpdatedAt,
            Homepage = repo.Homepage,
            Topics = repo.Topics,
            RecentCommits = commits.Take(5).Select(c => new
            {
                Message = c.Commit.Message,
                Author = c.Commit.Author.Name,
                Date = c.Commit.Author.Date
            }),
            TopContributors = contributors.Take(5).Select(c => new
            {
                Username = c.Login,
                Contributions = c.Contributions,
                AvatarUrl = c.AvatarUrl
            })
        });
    }
    catch (NotFoundException)
    {
        return Results.NotFound(new { error = "Repository not found" });
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message);
    }
});

app.Run();
