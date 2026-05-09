

interface Repository {
  name: string;
  description: string;
  stargazersCount: number;
  forksCount: number;
  language: string;
  updatedAt: string;
  htmlUrl: string;
}

interface Props {
  repo: Repository;
}

const LANGUAGE_COLORS: Record<string, string> = {
  'JavaScript': '#f1e05a',
  'TypeScript': '#3178c6',
  'Python': '#3572A5',
  'Java': '#b07219',
  'C#': '#178600',
  'C++': '#f34b7d',
  'Go': '#00ADD8',
  'Rust': '#dea584',
  'Ruby': '#701516',
  'PHP': '#4F5D95',
  'Swift': '#F05138',
  'Kotlin': '#A97BFF',
  'Dart': '#00B4AB',
  'HTML': '#e34c26',
  'CSS': '#563d7c',
};

export function RepoCard({ repo }: Props) {
  const languageColor = LANGUAGE_COLORS[repo.language] || '#858585';
  
  const timeAgo = (date: string) => {
    const now = new Date();
    const updated = new Date(date);
    const diff = Math.floor((now.getTime() - updated.getTime()) / 1000);

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
    return `${Math.floor(diff / 31536000)}y ago`;
  };

  return (
    <a
      href={repo.htmlUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-gradient-to-br from-white to-gray-50 p-5 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
          </svg>
          {repo.name}
        </h3>
        
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-1" title="Stars">
            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-medium">{repo.stargazersCount}</span>
          </div>
          
          {repo.forksCount > 0 && (
            <div className="flex items-center gap-1" title="Forks">
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{repo.forksCount}</span>
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
        {repo.description || 'No description provided'}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        {repo.language && (
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: languageColor }}
            />
            <span className="font-medium">{repo.language}</span>
          </div>
        )}
        
        <div className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Updated {timeAgo(repo.updatedAt)}</span>
        </div>
      </div>
    </a>
  );
}
