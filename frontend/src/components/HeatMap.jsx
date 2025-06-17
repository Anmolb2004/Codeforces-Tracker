import React from 'react';
import { useTheme } from '../context/ThemeContext';

const HeatMap = ({ data, days = 90 }) => {
  const { darkMode } = useTheme();

  // Generate date range
  const generateDateRange = (days) => {
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const dateRange = generateDateRange(days);
  const maxSubmissions = Math.max(...Object.values(data), 1);

  const getIntensity = (count) => {
    if (count === 0) return 0;
    return Math.ceil((count / maxSubmissions) * 4);
  };

  const getColor = (intensity) => {
    if (darkMode) {
      const colors = [
        'bg-gray-700',  // 0
        'bg-green-900', // 1
        'bg-green-700', // 2
        'bg-green-500', // 3
        'bg-green-300'  // 4
      ];
      return colors[intensity];
    } else {
      const colors = [
        'bg-gray-200',  // 0
        'bg-green-200', // 1  
        'bg-green-400', // 2
        'bg-green-600', // 3
        'bg-green-800'  // 4
      ];
      return colors[intensity];
    }
  };

  // Group dates by week
  const weeks = [];
  for (let i = 0; i < dateRange.length; i += 7) {
    weeks.push(dateRange.slice(i, i + 7));
  }

  return (
    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Submission Activity
      </h3>
      
      <div className="overflow-x-auto">
        <div className="flex gap-1 mb-4" style={{ minWidth: '600px' }}>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((date) => {
                const count = data[date] || 0;
                const intensity = getIntensity(count);
                return (
                  <div
                    key={date}
                    className={`w-3 h-3 rounded-sm ${getColor(intensity)} hover:ring-2 hover:ring-blue-500 cursor-pointer transition-all`}
                    title={`${date}: ${count} submissions`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
          Less
        </span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((intensity) => (
            <div
              key={intensity}
              className={`w-3 h-3 rounded-sm ${getColor(intensity)}`}
            />
          ))}
        </div>
        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
          More
        </span>
      </div>
    </div>
  );
};

export default HeatMap;