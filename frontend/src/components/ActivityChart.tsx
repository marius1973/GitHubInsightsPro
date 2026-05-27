import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ActivityData {
  date: string;
  count: number;
}

interface Props {
  data: ActivityData[];
}

export function ActivityChart({ data }: Props) {
  const chartData = data.slice(-30).map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    commits: item.count,
    fullDate: item.date,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-800 dark:text-gray-100">{payload[0].payload.fullDate}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            {payload[0].value} commit{payload[0].value !== 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  const maxCommits = chartData.length ? Math.max(...chartData.map((d) => d.commits)) : 0;
  const totalCommits = chartData.reduce((sum, d) => sum + d.commits, 0);

  return (
    <div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(156 163 175 / 0.2)" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'currentColor' }} angle={-45} textAnchor="end" height={80} className="text-gray-600 dark:text-gray-400" />
          <YAxis tick={{ fontSize: 12, fill: 'currentColor' }} className="text-gray-600 dark:text-gray-400" />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
          <Bar dataKey="commits" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{totalCommits}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Total Commits</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3">
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
            {chartData.length ? (totalCommits / chartData.length).toFixed(1) : '0'}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Avg per Day</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
          <div className="text-xl font-bold text-green-600 dark:text-green-400">{maxCommits}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Most in a Day</div>
        </div>
      </div>
    </div>
  );
}
