import { forwardRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { OrgOverviewCard } from './OrgOverviewCard';
import { LanguageChart } from './LanguageChart';
import { RepoCard } from './RepoCard';
import { StatsCard } from './StatsCard';
import { MembersList } from './MembersList';

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api';

interface OrgData {
  login: string;
  name: string;
  avatarUrl: string;
  description: string;
  location?: string;
  blog?: string;
  publicRepos: number;
  followers: number;
  following: number;
  totalStars: number;
  totalForks: number;
  totalOpenIssues: number;
  repoCount: number;
  htmlUrl: string;
  repositories: Array<{
    id: number;
    name: string;
    description: string;
    stargazersCount: number;
    forksCount: number;
    language: string;
    updatedAt: string;
    htmlUrl: string;
  }>;
}

interface OrgStats {
  totalRepos: number;
  activeRepos: number;
  archivedRepos: number;
  totalStars: number;
  totalOpenIssues: number;
  avgStarsPerRepo: number;
  languagesCount: number;
  mostStarredRepo: string;
  mostForkedRepo: string;
  reposCreatedLastYear: number;
}

interface Props {
  orgName: string;
}

export const OrgDashboard = forwardRef<HTMLDivElement, Props>(({ orgName }, ref) => {
  const { data: orgData, isLoading, error } = useQuery({
    queryKey: ['org', orgName],
    queryFn: () => axios.get<OrgData>(`${API_BASE}/org/${orgName}`).then((r) => r.data),
    enabled: !!orgName,
    retry: 1,
  });

  const { data: languageData } = useQuery({
    queryKey: ['org-languages', orgName],
    queryFn: () => axios.get(`${API_BASE}/org/${orgName}/languages`).then((r) => r.data),
    enabled: !!orgName,
  });

  const { data: statsData } = useQuery<OrgStats>({
    queryKey: ['org-stats', orgName],
    queryFn: () => axios.get(`${API_BASE}/org/${orgName}/stats`).then((r) => r.data),
    enabled: !!orgName,
  });

  const { data: members } = useQuery({
    queryKey: ['org-members', orgName],
    queryFn: () => axios.get(`${API_BASE}/org/${orgName}/members`).then((r) => r.data),
    enabled: !!orgName,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading organization data…</p>
        </div>
      </div>
    );
  }

  if (error || !orgData) {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow max-w-md mx-auto text-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Organization not found</h2>
        <p className="text-gray-600 dark:text-gray-400">"{orgName}" does not exist or is private.</p>
      </div>
    );
  }

  return (
    <div ref={ref} className="space-y-6 animate-fadeIn">
      <OrgOverviewCard org={orgData} />

      {statsData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Active Repos" value={statsData.activeRepos} icon="archive" color="green" />
          <StatsCard title="Total Stars" value={statsData.totalStars.toLocaleString()} icon="star" color="orange" />
          <StatsCard title="Open Issues" value={statsData.totalOpenIssues.toLocaleString()} icon="bug" color="red" />
          <StatsCard title="Languages" value={statsData.languagesCount} icon="code-branch" color="purple" />
        </div>
      )}

      {statsData && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span> Organization Insights
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <InsightItem label="Avg ⭐ per repo" value={statsData.avgStarsPerRepo.toString()} />
            <InsightItem label="Archived repos" value={statsData.archivedRepos.toString()} />
            <InsightItem label="Repos created last year" value={statsData.reposCreatedLastYear.toString()} />
            <InsightItem label="Most starred" value={statsData.mostStarredRepo || '—'} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {languageData && languageData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <span className="text-2xl">🎨</span> Languages across all repos
            </h2>
            <LanguageChart data={languageData} />
          </div>
        )}

        {members && members.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <span className="text-2xl">👥</span> Top public members
            </h2>
            <MembersList members={members} />
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
          <span className="text-2xl">⭐</span> Top repositories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orgData.repositories.slice(0, 6).map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      </div>
    </div>
  );
});

OrgDashboard.displayName = 'OrgDashboard';

function InsightItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3">
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</div>
      <div className="font-semibold text-gray-800 dark:text-gray-100 truncate">{value}</div>
    </div>
  );
}
