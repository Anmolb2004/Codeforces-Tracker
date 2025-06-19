import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { apiCall } from '../hooks/useApi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StudentTable = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [newStudent, setNewStudent] = useState({
    name: '',
    cfHandle: '',
    email: '',
    phoneNumber: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/students');
      setStudents(data);
    } catch (err) {
      setError(err.message);
      toast.error(`Failed to fetch students: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
  e.preventDefault();
  try {
    const response = await apiCall('/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newStudent) // Remove the phoneNumber override
    });
    setStudents(prevStudents => [...prevStudents, response]);
    
    setNewStudent({ name: '', cfHandle: '', email: '', phoneNumber: '' });
    setShowAddForm(false);
    toast.success('Student added successfully!');
  } catch (err) {
    toast.error(`Error adding student: ${err.response?.data?.message || err.message}`);
  }
};

  const handleEditStudent = async (e) => {
    e.preventDefault();
    try {
      await apiCall(`/students/${editingStudent._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingStudent)
      });
      setEditingStudent(null);
      await fetchStudents();
      toast.success('Student updated successfully!');
    } catch (err) {
      toast.error(`Error updating student: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await apiCall(`/students/${studentId}`, {
          method: 'DELETE'
        });
        await fetchStudents();
        toast.success('Student deleted successfully!');
      } catch (err) {
        toast.error(`Error deleting student: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const downloadCSV = () => {
    const headers = ['Name', 'Email', 'Phone Number', 'CF Handle', 'Current Rating', 'Max Rating', 'Rank', 'Total Solved'];
    const csvData = students.map(student => [
      student.name,
      student.email,
      student.phoneNumber || '',
      student.cfHandle,
      student.currentRating || 'Unrated',
      student.maxRating || 'Unrated',
      student.rank || 'unrated',
      student.totalSolved || 0
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleViewStudent = (studentId) => {
    navigate(`/students/${studentId}`);
  };

  const formatLastSync = (date) => {
    if (!date) return 'Never';
    const now = new Date();
    const syncDate = new Date(date);
    const diffMinutes = Math.floor((now - syncDate) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  const getRatingColor = (rating) => {
    if (!rating) return 'text-gray-500 dark:text-gray-400';
    if (rating >= 2400) return 'text-red-500 dark:text-red-400';
    if (rating >= 2100) return 'text-orange-500 dark:text-orange-400';
    if (rating >= 1900) return 'text-purple-500 dark:text-purple-400';
    if (rating >= 1600) return 'text-blue-500 dark:text-blue-400';
    if (rating >= 1400) return 'text-cyan-500 dark:text-cyan-400';
    if (rating >= 1200) return 'text-green-500 dark:text-green-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  const getRatingBadge = (rating) => {
    if (!rating) return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300', rank: 'Unrated' };
    if (rating >= 2400) return { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', rank: 'International Grandmaster' };
    if (rating >= 2100) return { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', rank: 'Grandmaster' };
    if (rating >= 1900) return { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', rank: 'Master' };
    if (rating >= 1600) return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', rank: 'Expert' };
    if (rating >= 1400) return { color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300', rank: 'Specialist' };
    if (rating >= 1200) return { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', rank: 'Pupil' };
    return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300', rank: 'Newbie' };
  };

  const startEdit = (student) => {
    setEditingStudent({ ...student });
  };

  const cancelEdit = () => {
    setEditingStudent(null);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // Filter and sort students
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.cfHandle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.phoneNumber && student.phoneNumber.includes(searchTerm))
  );

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'rating':
        comparison = (a.currentRating || 0) - (b.currentRating || 0);
        break;
      case 'maxRating':
        comparison = (a.maxRating || 0) - (b.maxRating || 0);
        break;
      case 'solved':
        comparison = (a.totalSolved || 0) - (b.totalSolved || 0);
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/30 border-t-blue-500"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-4 border-blue-500/20"></div>
        </div>
        <p className="mt-4 text-md font-medium text-gray-700 dark:text-gray-300">Loading students data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800/50 shadow-lg">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">Error Loading Data</h3>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button 
            onClick={fetchStudents}
            className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl shadow-lg backdrop-blur-sm border bg-white/90 dark:bg-gray-800/90 border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
      {/* Header Section */}
      <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Students Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {students.length} students enrolled
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={downloadCSV}
              className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <span>📊</span>
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                showAddForm 
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <span>{showAddForm ? '✕' : '+'}</span>
              <span>{showAddForm ? 'Cancel' : 'Add Student'}</span>
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            >
              <option value="name">Sort by Name</option>
              <option value="rating">Sort by Current Rating</option>
              <option value="maxRating">Sort by Max Rating</option>
              <option value="solved">Sort by Problems Solved</option>
            </select>
            <button
              onClick={toggleSortOrder}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Add New Student
            </h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1234567890"
                    value={newStudent.phoneNumber}
                    onChange={(e) => setNewStudent({ ...newStudent, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Codeforces Handle</label>
                  <input
                    type="text"
                    placeholder="tourist"
                    value={newStudent.cfHandle}
                    onChange={(e) => setNewStudent({ ...newStudent, cfHandle: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Student</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">CF Handle</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Rating</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Max</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Solved</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedStudents.map((student) => {
              const ratingBadge = getRatingBadge(student.currentRating);
              const maxRatingBadge = getRatingBadge(student.maxRating);
              
               return (
                <tr
                  key={student._id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    editingStudent?._id === student._id ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  {editingStudent && editingStudent._id === student._id ? (
                    // Edit Mode
                    <>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editingStudent.name}
                          onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                          className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                          placeholder="Full Name"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="email"
                          value={editingStudent.email}
                          onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                          className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                          placeholder="Email"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="tel"
                          value={editingStudent.phoneNumber || ''}
                          onChange={(e) => setEditingStudent({ ...editingStudent, phoneNumber: e.target.value })}
                          className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                          placeholder="Phone"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editingStudent.cfHandle}
                          onChange={(e) => setEditingStudent({ ...editingStudent, cfHandle: e.target.value })}
                          className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                          placeholder="CF Handle"
                        />
                      </td>
                      <td className={`px-4 py-3 font-medium ${getRatingColor(student.currentRating)}`}>
                        {student.currentRating || '-'}
                      </td>
                      <td className={`px-4 py-3 font-medium ${getRatingColor(student.maxRating)}`}>
                        {student.maxRating || '-'}
                      </td>
                      <td className="px-4 py-3">
                        {student.totalSolved || '-'}
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={handleEditStudent}
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    // View Mode
                    <>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{student.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">ID: {student._id.slice(-6)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {student.email}
                      </td>
                     <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
  {student.phoneNumber || '-'}
</td>
                      <td className="px-4 py-3">
                        <a 
                          href={`https://codeforces.com/profile/${student.cfHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium hover:underline"
                        >
                          {student.cfHandle}
                        </a>
                      </td>
                      <td className={`px-4 py-3 font-medium ${getRatingColor(student.currentRating)}`}>
                        <div className="flex items-center gap-2">
                          <span>{student.currentRating || '-'}</span>
                          {student.currentRating && (
                            <span className={`text-xs px-2 py-1 rounded-full ${ratingBadge.color}`}>
                              {ratingBadge.rank.split(' ')[0]}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={`px-4 py-3 font-medium ${getRatingColor(student.maxRating)}`}>
                        {student.maxRating || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{student.totalSolved || '-'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewStudent(student._id)}
                            className="p-1.5 text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="View"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => startEdit(student)}
                            className="p-1.5 text-gray-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded transition-colors"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student._id)}
                            className="p-1.5 text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {sortedStudents.length === 0 && !loading && (
        <div className="text-center py-12 px-6">
          <div className="mx-auto w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'No matching students found' : 'No students yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {searchTerm 
              ? `No students match "${searchTerm}". Try different search terms.`
              : 'Add your first student to start tracking their progress.'
            }
          </p>
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Clear search
            </button>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Add Student
            </button>
          )}
        </div>
      )}

      {/* Footer Stats */}
      {sortedStudents.length > 0 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-medium">{sortedStudents.length}</span> of <span className="font-medium">{students.length}</span> students
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="text-sm">
                <span className="text-gray-600 dark:text-gray-400">Avg Rating:</span>{' '}
                <span className=" py-3 text-sm text-gray-900 dark:text-white">
                  {Math.round(sortedStudents.reduce((acc, s) => acc + (s.currentRating || 0), 0) / sortedStudents.length) || 0}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600 dark:text-gray-400">Max Rating:</span>{' '}
                <span className="py-3 text-sm text-gray-900 dark:text-white">
                  {Math.max(...sortedStudents.map(s => s.maxRating || 0)) || 0}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total Solved:</span>{' '}
                <span className="py-3 text-sm text-gray-900 dark:text-white">
                  {sortedStudents.reduce((acc, s) => acc + (s.totalSolved || 0), 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTable;