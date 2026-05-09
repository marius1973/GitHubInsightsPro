

interface Props {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'purple' | 'green' | 'orange' | 'red';
}

const colorClasses = {
  blue: {
    bg: 'from-blue-500 to-blue-600',
    light: 'bg-blue-50',
    text: 'text-blue-600'
  },
  purple: {
    bg: 'from-purple-500 to-purple-600',
    light: 'bg-purple-50',
    text: 'text-purple-600'
  },
  green: {
    bg: 'from-green-500 to-green-600',
    light: 'bg-green-50',
    text: 'text-green-600'
  },
  orange: {
    bg: 'from-orange-500 to-orange-600',
    light: 'bg-orange-50',
    text: 'text-orange-600'
  },
  red: {
    bg: 'from-red-500 to-red-600',
    light: 'bg-red-50',
    text: 'text-red-600'
  }
};

const icons = {
  'code': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  'git-pull-request': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  'fire': (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
    </svg>
  ),
  'code-branch': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  ),
  'star': (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
};

export function StatsCard({ title, value, icon, color }: Props) {
  const colors = colorClasses[color];
  const iconComponent = icons[icon as keyof typeof icons];

  return (
    <div className="bg-white rounded-lg p-5 border border-gray-100 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm text-gray-600 font-medium mb-2">
            {title}
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {value}
          </div>
        </div>
        
        <div className={`p-2.5 rounded-lg bg-gradient-to-br ${colors.bg} flex-shrink-0`}>
          <div className="text-white w-5 h-5">
            {iconComponent}
          </div>
        </div>
      </div>
    </div>
  );
}
