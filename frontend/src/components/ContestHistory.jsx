import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { RatingChart } from './Charts';
import { apiCall } from '../hooks/useApi';

const ContestHistory = ({ student }) => {
  const { darkMode } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(365);

  useEffect(() => {
    fetchContestData();
  }, [student, filter]);

  const fetchContestData = async () => {
    try {
      setLoading(true);
      const result = await apiCall(`/students/${student._id}/contests?days=${filter}`);
      setData(result);
    } catch (err) {
      console.error('Error fetching contest data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRatingChangeColor = (change) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Contest History
        </h3>
        <select
          value={filter}
          onChange={(e) => setFilter(Number(e.target.value))}
          className={`p-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
        >
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last 365 days</option>
        </select>
      </div>

      {data?.ratingProgression?.length > 0 && (
        <div className="mb-8">
          <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Rating Progress
          </h4>
          <RatingChart data={data.ratingProgression} />
        </div>
      )}

      <div>
        <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Contest Results
        </h4>
        
        {data?.contests?.length === 0 ? (
          <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            No contest data found for the selected period.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Contest ID</th>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Rank</th>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Rating Change</th>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Problems Solved</th>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date</th>
                </tr>
              </thead>
              <tbody>
                {data?.contests?.map((contest) => (
                  <tr
                    key={contest._id}
                    className={`border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
                  >
                    <td className={`p-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {contest._id}
                    </td>
                    <td className={`p-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {contest.rank || 'N/A'}
                    </td>
                    <td className={`p-3 font-semibold ${getRatingChangeColor(contest.ratingChange)}`}>
                      {contest.ratingChange > 0 ? '+' : ''}{contest.ratingChange || 0}
                    </td>
                    <td className={`p-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {contest.problemsSolved}/{contest.totalProblems}
                    </td>
                    <td className={`p-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {new Date(contest.submissionTime * 1000).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestHistory;