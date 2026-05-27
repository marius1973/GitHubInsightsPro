interface Repository {
  name: string;
  description: string;
  stargazersCount: number;
  forksCount: number;
  language: string;
  updatedAt: string;
  htmlUrl: string;
}

interface Props { repo: Repository; }

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', Java: '#b07219',
  'C#': '#178600', 'C++': '#f34b7d', Go: '#00ADD8', Rust: '#dea584', Ruby: '#701516',
  PHP: '#4F5D95', Swift: '#F05138', Kotlin: '#A97BFF', Dart: '#00B4AB',
  HTML: '#e34c26', CSS: '#563d7c',
};

export function RepoCard({ repo }: Props) {
  const languageColor = LANGUAGE_COLORS[repo.language] || '#858585';

  const timeAgo = (date: string) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 2592000) return Math.floor(diff / 86400) + 'd ago';
    if (diff < 31536000) return Math.floor(diff / 2592000) + 'mo ago';
    return Math.floor(diff / 31536000) + 'y ago';
  };

  return (
    <a
      href={repo.htmlUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg dark:hover:shadow-black/40 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition flex items-center gap-2">
          {repo.name}
        </h3>
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1" title="Stars">
            <span className="text-yellow-500">*</span>
            <span className="font-medium">{repo.stargazersCount}</span>
          </div>
          {repo.forksCount > 0 && (
            <div className="flex items-center gap-1" title="Forks">
              <span>fork</span>
              <span className="font-medium">{repo.forksCount}</span>
            </div>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 min-h-[40px]">
        {repo.description || 'No description provided'}
      </p>
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        {repo.language && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: languageColor }} />
            <span className="font-medium">{repo.language}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <span>Updated {timeAgo(repo.updatedAt)}</span>
        </div>
      </div>
    </a>
  );
}
