import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useTheme } from '../context/ThemeContext';

export const RatingChart = ({ data }) => {
  const { darkMode } = useTheme();

  const chartData = data.map(point => ({
    date: new Date(point.time).toLocaleDateString(),
    rating: point.rating
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
        <XAxis 
          dataKey="date" 
          stroke={darkMode ? '#9ca3af' : '#6b7280'}
          fontSize={12}
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
        <Line 
          type="monotone" 
          dataKey="rating" 
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
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