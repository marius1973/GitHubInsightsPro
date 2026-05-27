import { useState, useRef, forwardRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { OverviewCard } from './OverviewCard';
import { LanguageChart } from './LanguageChart';
import { RepoCard } from './RepoCard';
import { ActivityChart } from './ActivityChart';
import { StatsCard } from './StatsCard';
import { ThemeToggle } from './ThemeToggle';
import { ExportButton } from './ExportButton';
import { OrgDashboard } from './OrgDashboard';

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api';

type Mode = 'user' | 'org';

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

const UserDashboard = forwardRef<HTMLDivElement, { username: string }>(({ username }, ref) => {
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['user', username],
    queryFn: () => axios.get<UserData>(API_BASE + '/user/' + username).then(r => r.data),
    enabled: !!username,
    retry: 1,
  });

  const { data: languageData } = useQuery({
    queryKey: ['languages', username],
    queryFn: () => axios.get(API_BASE + '/user/' + username + '/languages').then(r => r.data),
    enabled: !!username,
  });

  const { data: activityData } = useQuery({
    queryKey: ['activity', username],
    queryFn: () => axios.get(API_BASE + '/user/' + username + '/activity').then(r => r.data),
    enabled: !!username,
  });

  const { data: statsData } = useQuery<any>({
    queryKey: ['stats', username],
    queryFn: () => axios.get(API_BASE + '/user/' + username + '/stats').then(r => r.data),
    enabled: !!username,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading GitHub data...</p>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md mx-auto text-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">User not found</h2>
        <p className="text-gray-600 dark:text-gray-400">The GitHub user "{username}" does not exist.</p>
      </div>
    );
  }

  return (
    <div ref={ref} className="space-y-6 animate-fadeIn">
      <OverviewCard user={userData} />
      {statsData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Commits" value={statsData.totalCommits} icon="code" color="blue" />
          <StatsCard title="Pull Requests" value={statsData.totalPRs} icon="git-pull-request" color="purple" />
          <StatsCard title="Current Streak" value={statsData.currentStreak + ' days'} icon="fire" color="orange" />
          <StatsCard title="Languages" value={statsData.languagesCount} icon="code-branch" color="green" />
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {languageData && languageData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Languages Used</h2>
            <LanguageChart data={languageData} />
          </div>
        )}
        {activityData && activityData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Recent Activity</h2>
            <ActivityChart data={activityData} />
          </div>
        )}
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Top Repositories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userData.repositories.slice(0, 6).map(repo => <RepoCard key={repo.id} repo={repo} />)}
        </div>
      </div>
    </div>
  );
});
UserDashboard.displayName = 'UserDashboard';

export function Dashboard() {
  const [mode, setMode] = useState<Mode>('user');
  const [query, setQuery] = useState('marius1973');
  const [searchInput, setSearchInput] = useState('');
  const exportRef = useRef<HTMLDivElement | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) setQuery(searchInput.trim());
  };

  const exportName = mode === 'user' ? 'github-insights-' + query + '.pdf' : 'github-org-' + query + '.pdf';
  const exportTitle = mode === 'user' ? 'GitHub Insights - @' + query : 'GitHub Organization - ' + query;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100">
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg w-12 h-12" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">GitHub Insights Pro</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Analyze profiles and organizations</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1">
                <button type="button" onClick={() => setMode('user')} className={'px-3 py-1.5 text-sm font-medium rounded-md transition ' + (mode === 'user' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700')}>User</button>
                <button type="button" onClick={() => setMode('org')} className={'px-3 py-1.5 text-sm font-medium rounded-md transition ' + (mode === 'org' ? 'bg-emerald-600 text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700')}>Organization</button>
              </div>
              <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder={mode === 'user' ? 'Enter GitHub username...' : 'Enter organization...'}
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  className="flex-1 sm:w-56 px-4 py-2 rounded-lg outline-none transition border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                />
                <button type="submit" className={'px-6 py-2 rounded-lg font-medium text-white transition ' + (mode === 'user' ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800')}>Search</button>
              </form>
              <div className="flex gap-2">
                <ExportButton getTarget={() => exportRef.current} filename={exportName} title={exportTitle} />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {mode === 'user'
          ? <UserDashboard ref={exportRef} username={query} />
          : <OrgDashboard ref={exportRef} orgName={query} />}
      </main>
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>Built by <a href="https://github.com/marius1973" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Mario Manrique</a></p>
          <p className="mt-1">Powered by GitHub API - React + .NET</p>
        </div>
      </footer>
    </div>
  );
}
