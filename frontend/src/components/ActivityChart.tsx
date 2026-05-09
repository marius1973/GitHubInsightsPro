import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ActivityData {
  date: string;
  count: number;
}

interface Props {
  data: ActivityData[];
}

export function ActivityChart({ data }: Props) {
  // Take last 30 days
  const chartData = data.slice(-30).map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    commits: item.count,
    fullDate: item.date
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{payload[0].payload.fullDate}</p>
          <p className="text-sm text-blue-600">
            {payload[0].value} commit{payload[0].value !== 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  const maxCommits = Math.max(...chartData.map(d => d.commits));

  return (
    <div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
          <Bar
            dataKey="commits"
            fill="url(#colorGradient)"
            radius={[8, 8, 0, 0]}
          />
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary */}
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-xl font-bold text-blue-600">
            {chartData.reduce((sum, d) => sum + d.commits, 0)}
          </div>
          <div className="text-xs text-gray-600">Total Commits</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="text-xl font-bold text-purple-600">
            {(chartData.reduce((sum, d) => sum + d.commits, 0) / chartData.length).toFixed(1)}
          </div>
          <div className="text-xs text-gray-600">Avg per Day</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-xl font-bold text-green-600">
            {maxCommits}
          </div>
          <div className="text-xs text-gray-600">Most in a Day</div>
        </div>
      </div>
    </div>
  );
}
