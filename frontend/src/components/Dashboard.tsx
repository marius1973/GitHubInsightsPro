import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { OverviewCard } from './OverviewCard';
import { LanguageChart } from './LanguageChart';
import { RepoCard } from './RepoCard';
import { ActivityChart } from './ActivityChart';
import { StatsCard } from './StatsCard';

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api';

interface UserData {
  username: string;
  name: string;
  avatarUrl: string;
  bio: string;
  company: string;
  location: string;
  publicRepos: number;
  followers: number;
  following: number;
  totalStars: number;
  totalForks: number;
  repositories: Repository[];
}

interface Repository {
  id: number;
  name: string;
  description: string;
  stargazersCount: number;
  forksCount: number;
  language: string;
  updatedAt: string;
  htmlUrl: string;
}

export function Dashboard() {
  const [username, setUsername] = useState('marius1973');
  const [searchInput, setSearchInput] = useState('');

  const { data: userData, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['user', username],
    queryFn: () => axios.get<UserData>(`${API_BASE}/user/${username}`).then(res => res.data),
    enabled: !!username,
    retry: 1
  });

  const { data: languageData } = useQuery({
    queryKey: ['languages', username],
    queryFn: () => axios.get(`${API_BASE}/user/${username}/languages`).then(res => res.data),
    enabled: !!username
  });

  const { data: activityData } = useQuery({
    queryKey: ['activity', username],
    queryFn: () => axios.get(`${API_BASE}/user/${username}/activity`).then(res => res.data),
    enabled: !!username
  });

  const { data: statsData } = useQuery({
    queryKey: ['stats', username],
    queryFn: () => axios.get(`${API_BASE}/user/${username}/stats`).then(res => res.data),
    enabled: !!username
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setUsername(searchInput.trim());
    }
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading GitHub data...</p>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-center mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 text-center mb-2">User Not Found</h2>
          <p className="text-gray-600 text-center mb-4">The GitHub user "{username}" doesn't exist.</p>
          <button
            onClick={() => setUsername('marius1973')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Example User
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">GitHub Insights Pro</h1>
                <p className="text-sm text-gray-600">Analyze GitHub profiles with beautiful visualizations</p>
              </div>
            </div>
            
            <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Enter GitHub username..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="flex-1 sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-medium"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {userData && (
          <div className="space-y-6 animate-fadeIn">
            {/* Overview */}
            <OverviewCard user={userData} />

            {/* Stats Grid */}
            {statsData && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                  title="Total Commits"
                  value={statsData.totalCommits}
                  icon="code"
                  color="blue"
                />
                <StatsCard
                  title="Pull Requests"
                  value={statsData.totalPRs}
                  icon="git-pull-request"
                  color="purple"
                />
                <StatsCard
                  title="Current Streak"
                  value={`${statsData.currentStreak} days`}
                  icon="fire"
                  color="orange"
                />
                <StatsCard
                  title="Languages"
                  value={statsData.languagesCount}
                  icon="code-branch"
                  color="green"
                />
              </div>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Language Distribution */}
              {languageData && languageData.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🎨</span>
                    Languages Used
                  </h2>
                  <LanguageChart data={languageData} />
                </div>
              )}

              {/* Activity Chart */}
              {activityData && activityData.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-2xl">📈</span>
                    Recent Activity
                  </h2>
                  <ActivityChart data={activityData} />
                </div>
              )}
            </div>

            {/* Top Repositories */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                Top Repositories
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userData.repositories.slice(0, 6).map((repo) => (
                  <RepoCard key={repo.id} repo={repo} />
                ))}
              </div>
              {userData.repositories.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="font-medium">No public repositories</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600 text-sm">
            <p>Built with ❤️ by <a href="https://github.com/marius1973" className="text-blue-600 hover:underline font-medium">Mario Manrique</a></p>
            <p className="mt-1">Powered by GitHub API • Made with React + .NET</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
