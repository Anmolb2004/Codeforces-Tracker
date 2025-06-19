import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Scatter } from 'recharts';
import { useTheme } from '../context/ThemeContext';

export const RatingChart = ({ data }) => {
  const { darkMode } = useTheme();

const chartData = data.map(point => ({
    date: new Date(point.time).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    fullDate: new Date(point.time).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    timestamp: point.time,
    rating: point.rating,
    contestId: point.contestId,
    contestName: point.contestName,
    ratingChange: point.ratingChange,
    rank: point.rank
  }));

  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={payload.ratingChange >= 0 ? '#10B981' : '#EF4444'}
        stroke={darkMode ? '#1f2937' : '#ffffff'}
        strokeWidth={2}
      />
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
        <XAxis 
          dataKey="date" 
          stroke={darkMode ? '#9ca3af' : '#6b7280'}
          fontSize={12}
          tickMargin={10}
        />
        <YAxis 
          stroke={darkMode ? '#9ca3af' : '#6b7280'}
          fontSize={12}
          domain={['dataMin - 100', 'dataMax + 100']}
        />
        <Line 
          type="monotone" 
          dataKey="rating" 
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={false}
          activeDot={<CustomDot />}
        />
        <Scatter 
          data={chartData} 
          dataKey="rating" 
          shape={<CustomDot />}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const ProblemDistributionChart = ({ data }) => {
  const { darkMode } = useTheme();

  const chartData = Object.entries(data).map(([range, count]) => ({
    range,
    count
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
        <XAxis 
          dataKey="range" 
          stroke={darkMode ? '#9ca3af' : '#6b7280'}
          fontSize={12}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          stroke={darkMode ? '#9ca3af' : '#6b7280'}
          fontSize={12}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: darkMode ? '#1f2937' : '#ffffff',
            border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
            borderRadius: '6px',
            color: darkMode ? '#ffffff' : '#000000'
          }}
        />
        <Bar 
          dataKey="count" 
          fill="#10b981"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};