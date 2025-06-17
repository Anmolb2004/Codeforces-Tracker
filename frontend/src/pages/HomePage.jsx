import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

const HomePage = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const handleStartTracking = () => {
    navigate('/dashboard');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-20 px-4 py-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-md flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">CF</span>
            </div>
            <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} font-mono`}>CodeTracker</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className={`text-sm ${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition-colors font-medium`}>Features</a>
            <a href="#about" className={`text-sm ${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition-colors font-medium`}>About</a>
            <a href="#stats" className={`text-sm ${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition-colors font-medium`}>Stats</a>
          </div>
        </div>
      </nav>

      {/* Hero Section - Reduced padding */}
      <section className="relative py-12 px-4 sm:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6 shadow-md">
            <span className="text-2xl">🏆</span>
          </div>
          
          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'} leading-tight`}>
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Codeforces
            </span>
            <br />
            <span className="bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
              Performance Tracker
            </span>
          </h1>
          
          <p className={`text-lg sm:text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-8 font-medium max-w-2xl mx-auto`}>
            Track your competitive programming journey with real-time analytics
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={handleStartTracking}
              className="group px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-bold text-base shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <span className="group-hover:animate-pulse">🚀</span>
              Start Tracking Now
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
            
            <div className={`flex items-center gap-2 px-4 py-2 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-md border ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>Live Codeforces API</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 px-4 sm:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Key Features</span>
            </h2>
            <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
              Everything you need to monitor and improve your performance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: '📊', 
                title: 'Real-time Stats', 
                description: 'Track rating changes and contest performance',
                color: 'from-blue-500 to-cyan-500'
              },
              { 
                icon: '📈', 
                title: 'Progress Tracking', 
                description: 'Monitor your improvement with detailed analytics',
                color: 'from-purple-500 to-pink-500'
              },
              { 
                icon: '⚡', 
                title: 'Live Updates', 
                description: 'Instant notifications about rating changes',
                color: 'from-yellow-500 to-orange-500'
              },
              { 
                icon: '🔍', 
                title: 'Deep Analytics', 
                description: 'Insights into strengths and weaknesses',
                color: 'from-green-500 to-emerald-500'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className={`p-5 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md hover:shadow-lg transition-all duration-300 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-3 shadow-sm`}>
                  <span className="text-xl">{feature.icon}</span>
                </div>
                <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 px-4 sm:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className={`text-3xl font-extrabold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">Why Choose Us?</span>
              </h2>
              <div className="space-y-4">
                {[
                  { icon: '🎯', text: 'Comprehensive tracking of all activities' },
                  { icon: '📊', text: 'Advanced analytics for improvement' },
                  { icon: '🏆', text: 'Contest performance monitoring' },
                  { icon: '⚡', text: 'Always up-to-date with Codeforces API' }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-md flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <span className="text-lg">{item.icon}</span>
                    </div>
                    <p className={`text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className={`w-full h-64 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md border ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-center`}>
                <div className="text-center p-6">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Interactive Dashboard</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Coming soon with beautiful visualizations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-12 px-4 sm:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-4">
              Platform Statistics
            </h2>
            <p className="text-base text-blue-100 max-w-xl mx-auto">
              Join thousands of competitive programmers using our platform
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '👥', label: 'Users', value: '2,500+', color: 'from-yellow-400 to-orange-500' },
              { icon: '📊', label: 'Problems', value: '75K+', color: 'from-green-400 to-emerald-500' },
              { icon: '🏆', label: 'Contests', value: '1,200+', color: 'from-pink-400 to-red-500' },
              { icon: '⚡', label: 'Updates', value: '24/7', color: 'from-cyan-400 to-blue-500' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center mx-auto mb-3 shadow-sm`}>
                  <span className="text-xl">{stat.icon}</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-blue-100">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">CF</span>
              </div>
              <span className="text-xl font-bold text-white font-mono">CodeTracker</span>
            </div>
            
            <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
              Built for competitive programmers to track progress and achieve goals
            </p>
            
            <div className="flex justify-center items-center gap-2 flex-wrap">
              {['React', 'Tailwind', 'Codeforces', 'Node.js'].map((tech, index) => (
                <span key={index} className="px-2 py-1 bg-gray-600 rounded-full text-xs font-medium text-gray-300">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-600 pt-6 text-center">
            <p className="text-gray-500 text-xs">
              © {new Date().getFullYear()} CodeTracker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;