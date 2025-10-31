import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { API_BASE_URL_EXPORT } from '../config/api';
import axios from 'axios';

export default function CartTest() {
  const { addItem, items, loading, error, isLoggedIn } = useCart();
  const [testResult, setTestResult] = useState('');
  const [apiStatus, setApiStatus] = useState('');

  const testProduct = {
    id: 'test-123',
    title: 'Test Product',
    price: 29.99,
    image: 'https://via.placeholder.com/150',
    category: 'Electronics',
    description: 'A test product for debugging',
    stock: 10
  };

  const testBackendConnection = async () => {
    setApiStatus('Testing backend connection...');
    try {
      const response = await axios.get(`${API_BASE_URL_EXPORT}/`);
      setApiStatus(`✅ Backend connected: ${response.data.message}`);
    } catch (err) {
      setApiStatus(`❌ Backend connection failed: ${err.message}`);
    }
  };

  const handleAddToCart = async () => {
    setTestResult('Adding item to cart...');
    const success = await addItem(testProduct, 1);
    if (success) {
      setTestResult('✅ Item added successfully!');
    } else {
      setTestResult(`❌ Failed to add item: ${error}`);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-2xl rounded-lg p-6 w-96 z-50 border-2 border-blue-500">
      <h2 className="text-xl font-bold mb-4 text-blue-600">🧪 Cart Test Panel</h2>
      
      <div className="space-y-3">
        {/* API Configuration */}
        <div className="bg-gray-100 p-3 rounded">
          <h3 className="font-semibold text-sm mb-2">API Configuration:</h3>
          <p className="text-xs break-all">
            <strong>URL:</strong> {API_BASE_URL_EXPORT}
          </p>
          <p className="text-xs">
            <strong>Environment:</strong> {process.env.NODE_ENV}
          </p>
        </div>

        {/* User Status */}
        <div className="bg-gray-100 p-3 rounded">
          <h3 className="font-semibold text-sm mb-2">User Status:</h3>
          <p className="text-xs">
            <strong>Logged In:</strong> {isLoggedIn ? '✅ Yes' : '❌ No'}
          </p>
          {!isLoggedIn && (
            <p className="text-red-600 text-xs mt-1">
              ⚠️ You must be logged in to add items to cart
            </p>
          )}
        </div>

        {/* Cart Status */}
        <div className="bg-gray-100 p-3 rounded">
          <h3 className="font-semibold text-sm mb-2">Cart Status:</h3>
          <p className="text-xs">
            <strong>Items:</strong> {items.length}
          </p>
          <p className="text-xs">
            <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
          </p>
          {error && (
            <p className="text-red-600 text-xs mt-1">
              <strong>Error:</strong> {error}
            </p>
          )}
        </div>

        {/* Test Buttons */}
        <div className="space-y-2">
          <button
            onClick={testBackendConnection}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-sm"
          >
            Test Backend Connection
          </button>
          
          <button
            onClick={handleAddToCart}
            disabled={!isLoggedIn || loading}
            className={`w-full py-2 px-4 rounded text-sm ${
              isLoggedIn && !loading
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? 'Adding...' : 'Add Test Product to Cart'}
          </button>
        </div>

        {/* Test Results */}
        {apiStatus && (
          <div className={`p-3 rounded text-xs ${
            apiStatus.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {apiStatus}
          </div>
        )}
        
        {testResult && (
          <div className={`p-3 rounded text-xs ${
            testResult.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {testResult}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
          <h3 className="font-semibold text-sm mb-1 text-yellow-800">Instructions:</h3>
          <ol className="text-xs text-yellow-700 space-y-1 list-decimal list-inside">
            <li>Make sure you're logged in</li>
            <li>Click "Test Backend Connection"</li>
            <li>If backend is connected, click "Add Test Product"</li>
            <li>Check browser console (F12) for detailed logs</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
