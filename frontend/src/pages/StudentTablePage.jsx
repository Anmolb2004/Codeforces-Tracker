import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentTable from '../components/StudentTable';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

const StudentTablePage = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Navigation Header */}
      <header className={`relative z-20 px-4 py-3 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button 
              onClick={handleGoHome}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-md flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">CF</span>
              </div>
              <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} font-mono`}>CodeTracker</span>
            </button>
            
            <div className="hidden md:flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/80 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-medium text-green-700 dark:text-green-400">Live</span>
            </div>
          </div>
          
          <button 
            onClick={handleGoHome}
            className={`flex items-center gap-1 px-3 py-1 text-sm ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md`}
          >
            <span>←</span> Back
          </button>
        </div>
      </header>

      {/* Page Header */}
      <section className="relative py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-4 shadow-md">
            <span className="text-2xl">📊</span>
          </div>
          
          <h1 className={`text-3xl sm:text-4xl font-extrabold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Performance Dashboard
            </span>
          </h1>
          
          <p className={`text-base sm:text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6 max-w-2xl mx-auto`}>
            Monitor student progress and track competitive programming performance
          </p>
        </div>
      </section>

      {/* Controls Section */}
      {/* <section className="relative py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md border ${darkMode ? 'border-gray-700' : 'border-gray-200'} mb-6`}>
            <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          
              <div className="flex-1 max-w-md w-full">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">🔍</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${darkMode ? 'text-white' : 'text-gray-900'} placeholder-gray-500`}
                  />
                </div>
              </div> */}

              {/* Filters */}
              {/* <div className="flex gap-3 items-center flex-wrap justify-center">
                <div className="flex items-center gap-1">
                  <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Rating:</span>
                  <select
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value)}
                    className={`px-2 py-1 text-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-blue-500 ${darkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    <option value="">All</option>
                    <option value="newbie">Newbie</option>
                    <option value="pupil">Pupil</option>
                    <option value="specialist">Specialist</option>
                    <option value="expert">Expert</option>
                    <option value="master">Master</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`px-2 py-1 text-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-blue-500 ${darkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    <option value="rating">Rating</option>
                    <option value="name">Name</option>
                    <option value="lastActivity">Last Activity</option>
                    <option value="problems">Problems Solved</option>
                  </select>
                </div>

                <button className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm rounded-md hover:from-blue-600 hover:to-purple-700 transition-all shadow-sm hover:shadow-md flex items-center gap-1">
                  <span>🔄</span>
                  Refresh
                </button>
              </div> */}
            {/* </div>
          </div>
        </div>
      </section> */}

      {/* Main Content - Student Table */}
      <main className="px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className={`rounded-lg shadow-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden`}>
            <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-md flex items-center justify-center">
                    <span className="text-white text-xs">📋</span>
                  </div>
                  <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Student Performance
                  </h2>
                </div>
                
                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/80 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">
                    Live
                  </span>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <StudentTable searchQuery={searchQuery} filterRating={filterRating} sortBy={sortBy} />
            </div>
          </div>

          {/* Additional Analytics Section */}
          <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-md flex items-center justify-center">
                <span className="text-white text-sm">📊</span>
              </div>
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Real-time Analytics</h3>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              All statistics are calculated from live Codeforces API data.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`py-8 px-4 border-t ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">CF</span>
            </div>
            <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} font-mono`}>CodeTracker</span>
          </div>
          
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            Competitive programming performance tracking
          </p>
          
          <div className="flex justify-center items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 text-xs rounded-full ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
              Live Data
            </span>
            <span className={`px-2 py-0.5 text-xs rounded-full ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
              Real-time
            </span>
            <span className={`px-2 py-0.5 text-xs rounded-full ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
              Analytics
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StudentTablePage;