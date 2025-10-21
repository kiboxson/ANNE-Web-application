import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG, API_BASE_URL_EXPORT } from '../config/api';

export default function ApiDebug() {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, { 
      message, 
      type, 
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  const testApiConnection = async () => {
    setLoading(true);
    setTestResults([]);
    
    addResult('🧪 Starting API connection tests...', 'info');
    addResult(`Environment: ${process.env.NODE_ENV}`, 'info');
    addResult(`API Base URL: ${API_BASE_URL_EXPORT}`, 'info');
    addResult(`Current Origin: ${window.location.origin}`, 'info');
    
    try {
      // Test health endpoint
      addResult('Testing health endpoint...', 'info');
      const healthResponse = await axios.get(`${API_BASE_URL_EXPORT}/api/health/db`);
      addResult(`✅ Health check successful: ${JSON.stringify(healthResponse.data)}`, 'success');
      
      // Test cart endpoint
      addResult('Testing cart endpoint...', 'info');
      const cartResponse = await axios.get(`${API_BASE_URL_EXPORT}/api/cart/test-user`);
      addResult(`✅ Cart endpoint successful: ${JSON.stringify(cartResponse.data)}`, 'success');
      
    } catch (error) {
      addResult(`❌ API test failed: ${error.message}`, 'error');
      if (error.response) {
        addResult(`Response status: ${error.response.status}`, 'error');
        addResult(`Response data: ${JSON.stringify(error.response.data)}`, 'error');
      }
      if (error.config) {
        addResult(`Request URL: ${error.config.url}`, 'error');
      }
    }
    
    setLoading(false);
  };

  useEffect(() => {
    testApiConnection();
  }, []);

  return (
    <div className="fixed top-4 right-4 w-96 bg-white shadow-lg rounded-lg p-4 z-50 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">API Debug</h3>
        <button 
          onClick={testApiConnection}
          disabled={loading}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Retest'}
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        {testResults.map((result, index) => (
          <div 
            key={index}
            className={`p-2 rounded ${
              result.type === 'success' ? 'bg-green-100 text-green-800' :
              result.type === 'error' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}
          >
            <strong>{result.timestamp}</strong>: {result.message}
          </div>
        ))}
      </div>
    </div>
  );
}
