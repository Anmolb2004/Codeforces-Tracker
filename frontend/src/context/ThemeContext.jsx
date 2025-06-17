// context/ThemeContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initialize with dark mode as default
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first, if nothing found, default to dark mode
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? saved === 'true' : true;
  });

  // Apply the class to <html> and save to localStorage
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};