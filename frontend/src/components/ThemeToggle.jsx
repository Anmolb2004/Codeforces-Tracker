import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 p-3 w-10 h-10 text-xl rounded-full transition-all duration-300 bg-gray-800 text-yellow-400 hover:bg-gray-700 dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-300 shadow-lg hover:shadow-xl transform hover:scale-110 flex items-center justify-center"
      aria-label="Toggle theme"
      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? '🌞' : '🌙'}
    </button>
  );
};

export default ThemeToggle;
