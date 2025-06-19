import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const useApi = (url, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('=== API HOOK DEBUG ===');
        console.log('Fetching URL:', `${API_BASE}${url}`);
        console.log('Dependencies:', dependencies);
        
        const response = await fetch(`${API_BASE}${url}`, {
          credentials: 'include'
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Get raw text first to see exactly what we're receiving
        const rawText = await response.text();
        console.log('Raw response text:', rawText);
        console.log('Raw response length:', rawText.length);
        
        // Parse JSON
        const result = JSON.parse(rawText);
        console.log('Parsed result:', result);
        console.log('Result type:', typeof result);
        
        // Specifically check submissionActivity if it exists
        if (result && result.submissionActivity) {
          console.log('submissionActivity found:', result.submissionActivity);
          console.log('submissionActivity type:', typeof result.submissionActivity);
          console.log('submissionActivity is array:', Array.isArray(result.submissionActivity));
          console.log('submissionActivity keys:', Object.keys(result.submissionActivity));
          console.log('submissionActivity entries:', Object.entries(result.submissionActivity));
        }
        
        console.log('=== END API HOOK DEBUG ===');
        
        setData(result);
      } catch (err) {
        console.error('API Hook Error:', err);
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};

export const apiCall = async (url, options = {}) => {
  console.log('=== API CALL DEBUG ===');
  console.log('Calling URL:', `${API_BASE}${url}`);
  console.log('Options:', options);
  
  const response = await fetch(`${API_BASE}${url}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  console.log('API Call Response status:', response.status);
  console.log('API Call Response ok:', response.ok);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error('API Call Error:', error);
    throw new Error(error.error || 'API call failed');
  }

  const result = await response.json();
  console.log('API Call Result:', result);
  console.log('=== END API CALL DEBUG ===');
  
  return result;
};