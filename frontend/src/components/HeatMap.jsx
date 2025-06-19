import React from 'react';
import { useTheme } from '../context/ThemeContext';

const HeatMap = ({ data, days = 90 }) => {
  const { darkMode } = useTheme();

  // Enhanced debugging
  console.log('=== HEATMAP DEBUG ===');
  console.log('HeatMap received data:', data);
  console.log('Data keys:', Object.keys(data || {}));
  console.log('Data entries:', Object.entries(data || {}).slice(0, 10));
  console.log('Days parameter:', days);

  // Helper to format date keys as 'YYYY-MM-DD' consistently
  const formatDateKey = (date) => {
    // Ensure we're working with local dates, not UTC
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}`;
    return formatted;
  };

  const generateDateRange = () => {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  
  // Start from 'days' ago
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - days + 1); // +1 to include today
  
  // Align to start of week for better visualization
  const startOfWeek = new Date(startDate);
  startOfWeek.setDate(startDate.getDate() - startDate.getDay());
  
  // Generate all dates from startOfWeek to today
  let currentDate = new Date(startOfWeek);
  while (currentDate <= today) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  console.log('Generated date range:', {
    startOfWeek: startOfWeek.toISOString().split('T')[0],
    endDate: dates[dates.length - 1]?.toISOString().split('T')[0] || 'none',
    totalDates: dates.length
  });
  
  return dates;
};

  const allDates = generateDateRange();

  const getSubmissionCount = (date) => {
    const dateStr = formatDateKey(date);
    const count = data && data[dateStr] ? parseInt(data[dateStr]) : 0;
    
    // Debug log for first few dates
    if (allDates.indexOf(date) < 5) {
      console.log(`Date: ${dateStr}, Count: ${count}, HasData: ${!!data[dateStr]}`);
    }
    
    return count;
  };

  // Calculate max submissions for better color scaling
  const maxSubmissions = Math.max(...Object.values(data || {}).map(v => parseInt(v) || 0), 1);
  console.log('Max submissions:', maxSubmissions);

  const getIntensityLevel = (count) => {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;
    if (count <= 6) return 3;
    return 4;
  };

  const getColor = (count) => {
    const level = getIntensityLevel(count);

    if (darkMode) {
      switch (level) {
        case 0: return 'bg-gray-700';
        case 1: return 'bg-green-950';
        case 2: return 'bg-green-800';
        case 3: return 'bg-green-600';
        case 4: return 'bg-green-400';
        default: return 'bg-gray-700';
      }
    } else {
      switch (level) {
        case 0: return 'bg-gray-100';
        case 1: return 'bg-green-100';
        case 2: return 'bg-green-300';
        case 3: return 'bg-green-500';
        case 4: return 'bg-green-700';
        default: return 'bg-gray-100';
      }
    }
  };

  // Group dates into weeks
  const weeks = [];
  for (let i = 0; i < allDates.length; i += 7) {
    weeks.push(allDates.slice(i, i + 7));
  }

  const getMonthLabels = () => {
    const labels = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    weeks.forEach((week, index) => {
      const firstDay = week[0];
      if (index === 0 || firstDay.getDate() <= 7) {
        labels.push({
          index,
          label: monthNames[firstDay.getMonth()]
        });
      } else {
        labels.push({ index, label: '' });
      }
    });

    return labels;
  };

  const monthLabels = getMonthLabels();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate total submissions for display
  const totalSubmissions = Object.values(data || {}).reduce((sum, count) => sum + (parseInt(count) || 0), 0);

  console.log('Final stats:', {
    totalSubmissions,
    datesWithData: Object.keys(data || {}).length,
    sampleDataEntries: Object.entries(data || {}).slice(0, 5)
  });
  console.log('=== END HEATMAP DEBUG ===');

  return (
    <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <h3 className={`text-lg font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Submission Activity
      </h3>

      <div className="overflow-x-auto">
        <div className="inline-block">
          {/* Month labels */}
          <div className="flex mb-2 ml-8">
            {monthLabels.map((month, index) => (
              <div
                key={index}
                className="text-xs font-medium text-center"
                style={{ width: '14px', marginRight: '2px' }}
              >
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {month.label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex">
            {/* Weekday labels */}
            <div className="flex flex-col mr-2">
              {weekdays.map((day, index) => (
                <div
                  key={day}
                  className="text-xs font-medium text-right"
                  style={{
                    height: '14px',
                    marginBottom: '2px',
                    lineHeight: '14px',
                    width: '26px'
                  }}
                >
                  {index % 2 === 1 && (
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {day}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-0.5">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-0.5">
                  {week.map((date) => {
                    const count = getSubmissionCount(date);
                    const dateStr = formatDateKey(date);
                    const colorClass = getColor(count);

                    return (
                      <div
                        key={dateStr}
                        className={`w-3.5 h-3.5 rounded-sm ${colorClass} 
                          hover:ring-1 hover:ring-blue-400 cursor-pointer transition-all
                          ${darkMode ? 'hover:ring-blue-400' : 'hover:ring-blue-500'}`}
                        title={`${date.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}: ${count} ${count === 1 ? 'submission' : 'submissions'}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-6 text-xs">
        <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Less
        </span>
        <div className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />
          <div className={`w-3 h-3 rounded-sm ${darkMode ? 'bg-green-950' : 'bg-green-100'}`} />
          <div className={`w-3 h-3 rounded-sm ${darkMode ? 'bg-green-800' : 'bg-green-300'}`} />
          <div className={`w-3 h-3 rounded-sm ${darkMode ? 'bg-green-600' : 'bg-green-500'}`} />
          <div className={`w-3 h-3 rounded-sm ${darkMode ? 'bg-green-400' : 'bg-green-700'}`} />
        </div>
        <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          More
        </span>
      </div>

      {/* Summary stats */}
      <div className={`mt-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <span className="font-medium">
          {totalSubmissions} submissions
        </span>{' '}
        in the last {days} days
      </div>
    </div>
  );
};

export default HeatMap;