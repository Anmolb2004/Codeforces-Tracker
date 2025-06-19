import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { apiCall } from '../hooks/useApi';
import ContestHistory from './ContestHistory';
import ProblemSolvingData from './ProblemSolvingData';

const StudentProfile = () => {
   const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('contests');

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const data = await apiCall(`/students/${id}`);
        setStudent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  const handleClose = () => {
    navigate('/dashboard');
  };

  const getRatingColor = (rating) => {
    if (rating >= 2400) return 'text-red-500';
    if (rating >= 2100) return 'text-orange-500';
    if (rating >= 1900) return 'text-purple-500';
    if (rating >= 1600) return 'text-blue-500';
    if (rating >= 1400) return 'text-cyan-500';
    if (rating >= 1200) return 'text-green-500';
    return 'text-gray-500';
  };

  const getRankBadgeColor = (rank) => {
    switch (rank?.toLowerCase()) {
      case 'tourist':
      case 'legendary grandmaster':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25';
      case 'international grandmaster':
        return 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-lg shadow-red-400/25';
      case 'grandmaster':
        return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25';
      case 'international master':
        return 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-400/25';
      case 'master':
        return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25';
      case 'candidate master':
        return 'bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-lg shadow-purple-400/25';
      case 'expert':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25';
      case 'specialist':
        return 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/25';
      case 'pupil':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25';
      case 'newbie':
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/25';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-400/25';
    }
  };

 if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'}`}>
        Error: {error}
      </div>
    );
  }

  if (!student) {
    return (
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
        Student not found
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className={`
        w-full max-w-7xl max-h-[95vh] overflow-hidden rounded-2xl shadow-2xl border animate-in slide-in-from-bottom-4 duration-300
        ${darkMode 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-white border-gray-200'
        }
      `}>
        {/* Header */}
        <div className={`sticky top-0 z-10 p-6 border-b backdrop-blur-sm ${
          darkMode 
            ? 'bg-gray-900/95 border-gray-700' 
            : 'bg-white/95 border-gray-200'
        }`}>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className={`
                w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg
                bg-gradient-to-br from-blue-500 to-purple-600 text-white
              `}>
                {student.name.charAt(0).toUpperCase()}
              </div>
              
              {/* Student Info */}
              <div>
                <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {student.name}
                </h1>
                <div className="flex items-center gap-3 mb-2">
                  <a
                    href={`https://codeforces.com/profile/${student.cfHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 hover:underline font-medium text-lg transition-colors"
                  >
                    🔗 {student.cfHandle}
                  </a>
                  <span className={`px-3 py-1 text-sm rounded-full font-medium ${getRankBadgeColor(student.rank)}`}>
                    {student.rank || 'unrated'}
                  </span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span>📧 {student.email}</span>
                  {student.phoneNumber && <span>📱 {student.phoneNumber}</span>}
                </div>
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={handleClose}
              className={`
                p-3 rounded-full transition-all duration-200 transform hover:scale-110 hover:rotate-90
                ${darkMode 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className={`
              text-center p-4 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg
              ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}
            `}>
              <div className={`text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                CURRENT RATING
              </div>
              <div className={`text-2xl font-bold ${getRatingColor(student.currentRating)}`}>
                {student.currentRating || 'Unrated'}
              </div>
            </div>
            
            <div className={`
              text-center p-4 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg
              ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}
            `}>
              <div className={`text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                MAX RATING
              </div>
              <div className={`text-2xl font-bold ${getRatingColor(student.maxRating)}`}>
                {student.maxRating || 'Unrated'}
              </div>
            </div>
            
            <div className={`
              text-center p-4 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg
              ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}
            `}>
              <div className={`text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                PROBLEMS SOLVED
              </div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {student.totalSolved || 0}
              </div>
            </div>
            
            <div className={`
              text-center p-4 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg
              ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}
            `}>
              <div className={`text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                LAST SYNC
              </div>
              <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {student.lastDataSync 
                  ? new Date(student.lastDataSync).toLocaleDateString()
                  : 'Never'
                }
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mt-6">
            <button
              onClick={() => setActiveTab('contests')}
              className={`
                px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105
                ${activeTab === 'contests'
                  ? (darkMode 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                      : 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                    )
                  : (darkMode 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )
                }
              `}
            >
              🏆 Contest History
            </button>
            <button
              onClick={() => setActiveTab('problems')}
              className={`
                px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105
                ${activeTab === 'problems'
                  ? (darkMode 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                      : 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                    )
                  : (darkMode 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )
                }
              `}
            >
              🧩 Problem Solving
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto max-h-[calc(95vh-280px)]">
          <div className="p-6">
            {activeTab === 'contests' && <ContestHistory student={student} />}
            {activeTab === 'problems' && <ProblemSolvingData student={student} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;