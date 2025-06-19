import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ProblemDistributionChart } from './Charts';
import HeatMap from './HeatMap';
import { apiCall } from '../hooks/useApi';

const ProblemSolvingData = ({ student }) => {
  const { darkMode } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(30);

  useEffect(() => {
    fetchProblemData();
  }, [student, filter]);

  const fetchProblemData = async () => {
    try {
      setLoading(true);
      const result = await apiCall(`/students/${student._id}/problems?days=${filter}`);
      
      // Transform the data if needed
      const transformedData = {
        totalSolved: result.totalSolved || 0,
        averageRating: result.averageRating || 0,
        averagePerDay: result.averagePerDay || 0,
        hardestProblem: result.hardestProblem || null,
        ratingDistribution: transformRatingDistribution(result.ratingDistribution || {}),
        submissionActivity: transformSubmissionActivity(result.submissionActivity || {}),
        recentProblems: result.recentProblems || []
      };
      
      setData(transformedData);
    } catch (err) {
      console.error('Error fetching problem data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to transform rating distribution into buckets
  const transformRatingDistribution = (distribution) => {
    const buckets = {};
    Object.entries(distribution).forEach(([rating, count]) => {
      const bucket = Math.floor(rating / 100) * 100;
      buckets[bucket] = (buckets[bucket] || 0) + count;
    });
    return buckets;
  };

 // Replace the current transformSubmissionActivity with:
const transformSubmissionActivity = (activity) => {
  const result = {};
  
  Object.entries(activity).forEach(([dateStr, count]) => {
    // If the key is already in YYYY-MM-DD format, use it directly
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      result[dateStr] = count;
    } 
    // If it's a timestamp (number or string), convert it
    else {
      const timestamp = parseInt(dateStr);
      if (!isNaN(timestamp)) {
        const date = new Date(timestamp * 1000);
        const formattedDate = date.toISOString().split('T')[0];
        result[formattedDate] = count;
      }
    }
  });
  
  return result;
};

  const getDifficultyColor = (rating) => {
    if (!rating) return darkMode ? 'text-gray-400 bg-gray-800' : 'text-gray-500 bg-gray-100';
    if (rating >= 2400) return 'text-red-500 bg-red-100';
    if (rating >= 2100) return 'text-orange-500 bg-orange-100';
    if (rating >= 1900) return 'text-purple-500 bg-purple-100';
    if (rating >= 1600) return 'text-blue-500 bg-blue-100';
    if (rating >= 1400) return 'text-cyan-500 bg-cyan-100';
    if (rating >= 1200) return 'text-green-500 bg-green-100';
    return darkMode ? 'text-gray-400 bg-gray-800' : 'text-gray-500 bg-gray-100';
  };

  const getDifficultyColorDark = (rating) => {
    if (!rating) return 'text-gray-400 bg-gray-800';
    if (rating >= 2400) return 'text-red-400 bg-red-900';
    if (rating >= 2100) return 'text-orange-400 bg-orange-900';
    if (rating >= 1900) return 'text-purple-400 bg-purple-900';
    if (rating >= 1600) return 'text-blue-400 bg-blue-900';
    if (rating >= 1400) return 'text-cyan-400 bg-cyan-900';
    if (rating >= 1200) return 'text-green-400 bg-green-900';
    return 'text-gray-400 bg-gray-800';
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
          Problem Solving Data
        </h3>
        <select
          value={filter}
          onChange={(e) => setFilter(Number(e.target.value))}
          className={`p-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Total Problems Solved
          </div>
          <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {data?.totalSolved || 0}
          </div>
        </div>

        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Average Rating
          </div>
          <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {data?.averageRating ? Math.round(data.averageRating) : 'N/A'}
          </div>
        </div>

        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Problems per Day
          </div>
          <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {data?.averagePerDay ? data.averagePerDay.toFixed(1) : '0.0'}
          </div>
        </div>

        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Hardest Problem
          </div>
          {data?.hardestProblem ? (
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                darkMode 
                  ? getDifficultyColorDark(data.hardestProblem.rating)
                  : getDifficultyColor(data.hardestProblem.rating)
              }`}>
                {data.hardestProblem.rating || 'N/A'}
              </span>
              <a 
                href={`https://codeforces.com/problemset/problem/${data.hardestProblem.contestId}/${data.hardestProblem.index}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} hover:underline`}
              >
                {data.hardestProblem.name || 'Unknown'}
              </a>
            </div>
          ) : (
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              N/A
            </div>
          )}
        </div>
      </div>

      {/* Problem Distribution Chart */}
      <div className="mb-8">
        <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Problem Distribution by Rating
        </h4>
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          {data?.ratingDistribution && Object.keys(data.ratingDistribution).length > 0 ? (
            <ProblemDistributionChart data={data.ratingDistribution} />
          ) : (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              No rating distribution data available
            </div>
          )}
        </div>
      </div>

     {/* Activity Heatmap */}
<div className="mb-8">
  {/* {console.log('Raw API response:', data)};
{console.log('SubmissionActivity keys:', Object.keys(data?.submissionActivity || {}))};
  {console.log("Submission Activity Data:", data?.submissionActivity)}  */}
  {data?.submissionActivity && Object.keys(data.submissionActivity).length > 0 ? (
    <HeatMap data={data.submissionActivity} days={filter} />
  ) : (
    <div className={`p-4 rounded-lg text-center ${darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-50 text-gray-400'}`}>
      No submission activity data available
    </div>
  )}
</div>

      {/* Recent Problems */}
      <div>
        <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Recent Problems Solved
        </h4>
        {data?.recentProblems && data.recentProblems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Problem</th>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Rating</th>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tags</th>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Solved At</th>
                </tr>
              </thead>
              <tbody>
                {data.recentProblems.map((problem, index) => (
                  <tr
                    key={index}
                    className={`border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
                  >
                    <td className={`p-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      <a
                        href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {problem.name || `Problem ${problem.contestId}${problem.index}`}
                      </a>
                    </td>
                    <td className="p-3">
                      {problem.rating ? (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          darkMode 
                            ? getDifficultyColorDark(problem.rating)
                            : getDifficultyColor(problem.rating)
                        }`}>
                          {problem.rating}
                        </span>
                      ) : (
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>N/A</span>
                      )}
                    </td>
                    <td className={`p-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <div className="flex flex-wrap gap-1">
                        {problem.tags?.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className={`px-2 py-1 text-xs rounded ${
                              darkMode 
                                ? 'bg-gray-600 text-gray-300' 
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                        {problem.tags?.length > 3 && (
                          <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            +{problem.tags.length - 3} more
                          </span>
                        )}
                        {(!problem.tags || problem.tags.length === 0) && (
                          <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            No tags
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={`p-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {problem.solvedAt ? new Date(problem.solvedAt * 1000).toLocaleDateString() : 'Unknown'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={`p-4 rounded-lg text-center ${darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-50 text-gray-400'}`}>
            No recent problems data available
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemSolvingData;