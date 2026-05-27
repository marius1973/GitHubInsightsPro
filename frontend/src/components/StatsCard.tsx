interface Props {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'purple' | 'green' | 'orange' | 'red';
}

const colorClasses: Record<string, string> = {
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
  green: 'from-green-500 to-green-600',
  orange: 'from-orange-500 to-orange-600',
  red: 'from-red-500 to-red-600',
};

const iconMap: Record<string, string> = {
  code: '<>',
  'git-pull-request': 'PR',
  fire: 'fire',
  'code-branch': 'br',
  star: '*',
  users: 'us',
  archive: 'ar',
  bug: '!',
};

export function StatsCard({ title, value, icon, color }: Props) {
  const grad = colorClasses[color] || colorClasses.blue;
  const iconText = iconMap[icon] || icon;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-black/30 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">{title}</div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</div>
        </div>
        <div className={"p-2.5 rounded-lg bg-gradient-to-br " + grad + " flex-shrink-0"}>
          <div className="text-white w-5 h-5 text-xs flex items-center justify-center font-bold">{iconText}</div>
        </div>
      </div>
    </div>
  );
}
