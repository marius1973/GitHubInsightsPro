interface User {
  username: string;
  name: string;
  avatarUrl: string;
  bio: string;
  company?: string;
  location?: string;
  publicRepos: number;
  followers: number;
  following: number;
  totalStars: number;
  totalForks: number;
}

interface Props {
  user: User;
}

export function OverviewCard({ user }: Props) {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-800 rounded-xl shadow-2xl p-8 text-white">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="relative">
          <img src={user.avatarUrl} alt={user.name} className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-200 shadow-lg" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold mb-2">{user.name || user.username}</h1>
          <p className="text-xl text-blue-100 mb-3">@{user.username}</p>
          {user.bio && <p className="text-white/90 mb-4 max-w-2xl">{user.bio}</p>}
          <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
            {user.company && <div className="flex items-center gap-1"><span>{user.company}</span></div>}
            {user.location && <div className="flex items-center gap-1"><span>{user.location}</span></div>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          <StatBox label="Repositories" value={user.publicRepos} />
          <StatBox label="Total Stars" value={user.totalStars} icon="*" />
          <StatBox label="Followers" value={user.followers} />
          <StatBox label="Following" value={user.following} />
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon }: { label: string; value: number; icon?: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/20 transition">
      <div className="text-2xl font-bold mb-1">
        {icon && <span className="mr-1">{icon}</span>}
        {value.toLocaleString()}
      </div>
      <div className="text-xs text-white/80">{label}</div>
    </div>
  );
}
