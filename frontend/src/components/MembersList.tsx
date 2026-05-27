interface Member {
  username: string;
  name: string;
  avatarUrl: string;
  bio?: string;
  publicRepos: number;
  followers: number;
  htmlUrl: string;
}

interface Props {
  members: Member[];
}

export function MembersList({ members }: Props) {
  if (!members || members.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No public members visible for this organization.</p>
      </div>
    );
  }

  // Sort by followers as a proxy for influence
  const sorted = [...members].sort((a, b) => b.followers - a.followers);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sorted.slice(0, 12).map((m) => (
        <a
          key={m.username}
          href={m.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700
                     bg-white dark:bg-gray-800 hover:border-emerald-400 dark:hover:border-emerald-500
                     hover:shadow-md transition"
        >
          <img src={m.avatarUrl} alt={m.username} className="w-12 h-12 rounded-full" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-800 dark:text-gray-100 truncate">
              {m.name || m.username}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">@{m.username}</div>
            <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              {m.followers.toLocaleString()} followers · {m.publicRepos} repos
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
