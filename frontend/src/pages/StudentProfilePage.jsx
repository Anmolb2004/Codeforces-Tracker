import React from 'react';
import { useTheme } from '../context/ThemeContext';
import StudentProfile from '../components/StudentProfile';

const StudentProfilePage = () => {
  const { darkMode } = useTheme();

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gray-900">
      <main className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <StudentProfile />
        </div>
      </main>
    </div>
  );
};

export default StudentProfilePage;