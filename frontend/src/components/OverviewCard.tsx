

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
    <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-2xl p-8 text-white">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Avatar */}
        <div className="relative">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
          />
          <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold mb-2">{user.name || user.username}</h1>
          <p className="text-xl text-blue-100 mb-3">@{user.username}</p>
          
          {user.bio && (
            <p className="text-white/90 mb-4 max-w-2xl">{user.bio}</p>
          )}

          <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
            {user.company && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>{user.company}</span>
              </div>
            )}
            {user.location && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{user.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          <StatBox label="Repositories" value={user.publicRepos} />
          <StatBox label="Total Stars" value={user.totalStars} icon="⭐" />
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
