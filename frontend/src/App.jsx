import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';
import StudentProfilePage from './pages/StudentProfilePage';
import HomePage from './pages/HomePage';
import StudentTablePage from './pages/StudentTablePage';
import { ToastContainer } from 'react-toastify';

function App() {
  const { darkMode } = useTheme();

  return (
    <div className="min-h-screen transition-colors duration-300">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<StudentTablePage />} />
        <Route path="/students/:id" element={<StudentProfilePage />} />
      </Routes>
      <ToastContainer position="bottom-right" autoClose={5000} />
    </div>
  );
}

export default App;