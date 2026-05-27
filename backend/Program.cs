using Microsoft.AspNetCore.RateLimiting;
using Octokit;
using StackExchange.Redis;
using System.Text.Json;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configuración de límite de velocidad para proteger contra abuso
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.ContentType = "application/json";
        var retryAfter = context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var ra)
            ? (int)ra.TotalSeconds
            : 60;
        context.HttpContext.Response.Headers["Retry-After"] = retryAfter.ToString();
        await context.HttpContext.Response.WriteAsync(
            JsonSerializer.Serialize(new
            {
                error = "Rate limit exceeded",
                retryAfterSeconds = retryAfter,
                message = "Too many requests. Please try again later."
            }),
            cancellationToken);
    };

    // Límite global: 100 solicitudes por minuto por IP
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
    {
        var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: ip,
            factory: _ => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1)
            });
    });

    // Límite estricto: 10 solicitudes por minuto para endpoints de GitHub
    options.AddPolicy("github-api", httpContext =>
    {
        var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: ip,
            factory: _ => new SlidingWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 10,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 4
            });
    });
});

builder.Services.AddSingleton<GitHubClient>(sp =>
{
    var client = new GitHubClient(new ProductHeaderValue("GitHubInsightsPro"));
    var token = builder.Configuration["GitHub:Token"];
    if (!string.IsNullOrEmpty(token))
        client.Credentials = new Credentials(token);
    return client;
});

builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
{
    var redisConnection = builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379";
    return ConnectionMultiplexer.Connect(redisConnection);
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",
            "http://localhost:3000",
            "https://*.vercel.app")
        .AllowAnyMethod()
        .AllowAnyHeader();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseRateLimiter();

async Task<T?> GetOrFetchAsync<T>(
    IDatabase cache,
    string cacheKey,
    Func<Task<T>> fetchFunc,
    TimeSpan? expiration = null)
{
    var cached = await cache.StringGetAsync(cacheKey);
    if (!cached.IsNullOrEmpty)
        return JsonSerializer.Deserialize<T>(cached!);
    var data = await fetchFunc();
    if (data != null)
        await cache.StringSetAsync(cacheKey, JsonSerializer.Serialize(data), expiration ?? TimeSpan.FromMinutes(5));
    return data;
}

app.MapGet("/health", () => Results.Ok(new
{
    status = "healthy",
    timestamp = DateTime.UtcNow,
    service = "GitHubInsightsPro Backend"
}));

// =============================================================================
// USER ENDPOINTS
// =============================================================================
app.MapGet("/api/user/{username}", async (string username, GitHubClient github, IConnectionMultiplexer redis) =>
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
                        r.Id, r.Name, r.FullName, r.Description,
                        r.StargazersCount, r.ForksCount, r.Language,
                        r.Size, r.OpenIssuesCount, r.UpdatedAt, r.CreatedAt,
                        r.HtmlUrl, r.Homepage, Topics = r.Topics, r.Private, r.Fork
                    })
                    .ToList()
            };
        });
        return Results.Ok(stats);
    }
    catch (NotFoundException) { return Results.NotFound(new { error = $"User '{username}' not found" }); }
    catch (RateLimitExceededException) { return Results.StatusCode(429); }
    catch (Exception ex) { return Results.Problem(detail: ex.Message); }
}).RequireRateLimiting("github-api");

app.MapGet("/api/user/{username}/languages", async (string username, GitHubClient github, IConnectionMultiplexer redis) =>
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
                catch { }
            }
            var total = (double)languageBytes.Values.Sum();
            if (total == 0) return new List<object>();
            return languageBytes
                .Select(l => new { Language = l.Key, Bytes = l.Value, Percentage = Math.Round(l.Value / total * 100, 2) })
                .OrderByDescending(l => l.Bytes)
                .ToList<object>();
        });
        return Results.Ok(languages);
    }
    catch (NotFoundException) { return Results.NotFound(new { error = $"User '{username}' not found" }); }
    catch (Exception ex) { return Results.Problem(detail: ex.Message); }
}).RequireRateLimiting("github-api");

app.MapGet("/api/user/{username}/activity", async (string username, GitHubClient github, IConnectionMultiplexer redis) =>
{
    var cache = redis.GetDatabase();
    var cacheKey = $"activity:{username}";
    try
    {
        var activity = await GetOrFetchAsync(cache, cacheKey, async () =>
        {
            var events = await github.Activity.Events.GetAllUserPerformed(username);
            return events
                .Where(e => e.Type == "PushEvent")
                .GroupBy(e => e.CreatedAt.Date)
                .Select(g => new { Date = g.Key.ToString("yyyy-MM-dd"), Count = g.Count() })
                .OrderBy(x => x.Date)
                .ToList<object>();
        }, TimeSpan.FromMinutes(15));
        return Results.Ok(activity);
    }
    catch (Exception ex) { return Results.Problem(detail: ex.Message); }
}).RequireRateLimiting("github-api");

app.MapGet("/api/user/{username}/stats", async (string username, GitHubClient github, IConnectionMultiplexer redis) =>
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

            var commitDates = pushEvents.Select(e => e.CreatedAt.Date).Distinct().OrderByDescending(d => d).ToList();
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
                TotalStars = repos.Sum(r => r.StargazersCount),
                TotalForks = repos.Sum(r => r.ForksCount),
                MostStarredRepo = repos.OrderByDescending(r => r.StargazersCount).FirstOrDefault()?.Name,
                LanguagesCount = repos.Select(r => r.Language).Where(l => l != null).Distinct().Count()
            };
        });
        return Results.Ok(stats);
    }
    catch (Exception ex) { return Results.Problem(detail: ex.Message); }
}).RequireRateLimiting("github-api");

// =============================================================================
// ORGANIZATION ENDPOINTS
// =============================================================================
app.MapGet("/api/org/{org}", async (string org, GitHubClient github, IConnectionMultiplexer redis) =>
{
    var cache = redis.GetDatabase();
    var cacheKey = $"org:{org}";
    try
    {
        var stats = await GetOrFetchAsync(cache, cacheKey, async () =>
        {
            var organization = await github.Organization.Get(org);
            var repos = await github.Repository.GetAllForOrg(org);
            return new
            {
                Login = organization.Login,
                Name = organization.Name,
                AvatarUrl = organization.AvatarUrl,
                Description = organization.Description,
                Blog = organization.Blog,
                Location = organization.Location,
                Email = organization.Email,
                PublicRepos = organization.PublicRepos,
                Followers = organization.Followers,
                Following = organization.Following,
                CreatedAt = organization.CreatedAt,
                HtmlUrl = organization.HtmlUrl,
                TotalStars = repos.Sum(r => r.StargazersCount),
                TotalForks = repos.Sum(r => r.ForksCount),
                TotalOpenIssues = repos.Sum(r => r.OpenIssuesCount),
                RepoCount = repos.Count,
                Repositories = repos.OrderByDescending(r => r.StargazersCount).Take(20)
                    .Select(r => new
                    {
                        r.Id, r.Name, r.FullName, r.Description,
                        r.StargazersCount, r.ForksCount, r.Language,
                        r.Size, r.OpenIssuesCount, r.UpdatedAt, r.CreatedAt,
                        r.HtmlUrl, r.Homepage, Topics = r.Topics, r.Private, r.Fork, r.Archived
                    }).ToList()
            };
        }, TimeSpan.FromMinutes(10));
        return Results.Ok(stats);
    }
    catch (NotFoundException) { return Results.NotFound(new { error = $"Organization '{org}' not found" }); }
    catch (RateLimitExceededException) { return Results.StatusCode(429); }
    catch (Exception ex) { return Results.Problem(detail: ex.Message); }
}).RequireRateLimiting("github-api");

app.MapGet("/api/org/{org}/languages", async (string org, GitHubClient github, IConnectionMultiplexer redis) =>
{
    var cache = redis.GetDatabase();
    var cacheKey = $"org-languages:{org}";
    try
    {
        var languages = await GetOrFetchAsync(cache, cacheKey, async () =>
        {
            var repos = await github.Repository.GetAllForOrg(org);
            var languageBytes = new Dictionary<string, long>();
            foreach (var repo in repos.Where(r => !r.Fork && !r.Archived))
            {
                try
                {
                    var repoLangs = await github.Repository.GetAllLanguages(repo.Id);
                    foreach (var lang in repoLangs)
                    {
                        if (languageBytes.ContainsKey(lang.Name)) languageBytes[lang.Name] += lang.NumberOfBytes;
                        else languageBytes[lang.Name] = lang.NumberOfBytes;
                    }
                }
                catch { }
            }
            var total = (double)languageBytes.Values.Sum();
            if (total == 0) return new List<object>();
            return languageBytes
                .Select(l => new { Language = l.Key, Bytes = l.Value, Percentage = Math.Round(l.Value / total * 100, 2) })
                .OrderByDescending(l => l.Bytes)
                .ToList<object>();
        }, TimeSpan.FromMinutes(15));
        return Results.Ok(languages);
    }
    catch (NotFoundException) { return Results.NotFound(new { error = $"Organization '{org}' not found" }); }
    catch (Exception ex) { return Results.Problem(detail: ex.Message); }
}).RequireRateLimiting("github-api");

app.MapGet("/api/org/{org}/members", async (string org, GitHubClient github, IConnectionMultiplexer redis) =>
{
    var cache = redis.GetDatabase();
    var cacheKey = $"org-members:{org}";
    try
    {
        var members = await GetOrFetchAsync(cache, cacheKey, async () =>
        {
            var publicMembers = await github.Organization.Member.GetAllPublic(org);
            var detailed = new List<object>();
            foreach (var member in publicMembers.Take(30))
            {
                try
                {
                    var user = await github.User.Get(member.Login);
                    detailed.Add(new
                    {
                        Username = user.Login,
                        Name = user.Name,
                        AvatarUrl = user.AvatarUrl,
                        Bio = user.Bio,
                        PublicRepos = user.PublicRepos,
                        Followers = user.Followers,
                        HtmlUrl = user.HtmlUrl
                    });
                }
                catch { }
            }
            return detailed;
        }, TimeSpan.FromMinutes(30));
        return Results.Ok(members);
    }
    catch (NotFoundException) { return Results.NotFound(new { error = $"Organization '{org}' not found" }); }
    catch (Exception ex) { return Results.Problem(detail: ex.Message); }
}).RequireRateLimiting("github-api");

app.MapGet("/api/org/{org}/stats", async (string org, GitHubClient github, IConnectionMultiplexer redis) =>
{
    var cache = redis.GetDatabase();
    var cacheKey = $"org-stats:{org}";
    try
    {
        var stats = await GetOrFetchAsync(cache, cacheKey, async () =>
        {
            var repos = await github.Repository.GetAllForOrg(org);
            var nonForked = repos.Where(r => !r.Fork).ToList();
            var nonArchived = nonForked.Where(r => !r.Archived).ToList();
            return new
            {
                TotalRepos = repos.Count,
                ActiveRepos = nonArchived.Count,
                ArchivedRepos = nonForked.Count - nonArchived.Count,
                ForkedRepos = repos.Count - nonForked.Count,
                TotalStars = repos.Sum(r => r.StargazersCount),
                TotalForks = repos.Sum(r => r.ForksCount),
                TotalOpenIssues = repos.Sum(r => r.OpenIssuesCount),
                AvgStarsPerRepo = repos.Any() ? Math.Round(repos.Average(r => r.StargazersCount), 1) : 0,
                LanguagesCount = repos.Select(r => r.Language).Where(l => l != null).Distinct().Count(),
                MostStarredRepo = repos.OrderByDescending(r => r.StargazersCount).FirstOrDefault()?.Name,
                MostForkedRepo = repos.OrderByDescending(r => r.ForksCount).FirstOrDefault()?.Name,
                MostRecentRepo = repos.OrderByDescending(r => r.UpdatedAt).FirstOrDefault()?.Name,
                OldestRepo = repos.OrderBy(r => r.CreatedAt).FirstOrDefault()?.Name,
                ReposCreatedLastYear = repos.Count(r => r.CreatedAt > DateTimeOffset.UtcNow.AddYears(-1))
            };
        }, TimeSpan.FromMinutes(10));
        return Results.Ok(stats);
    }
    catch (NotFoundException) { return Results.NotFound(new { error = $"Organization '{org}' not found" }); }
    catch (Exception ex) { return Results.Problem(detail: ex.Message); }
}).RequireRateLimiting("github-api");

app.Run();
