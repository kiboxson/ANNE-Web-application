import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { API_BASE_URL_EXPORT, API_CONFIG } from '../config/api';
import axios from 'axios';

const CartDebugInfo = ({ user }) => {
  const { items, error, loading, isLoggedIn } = useCart();
  const [debugInfo, setDebugInfo] = useState(null);
  const [testing, setTesting] = useState(false);

  const testCartAPI = async () => {
    if (!user?.userId) {
      setDebugInfo({ error: 'No user logged in' });
      return;
    }

    setTesting(true);
    try {
      // Test cart API
      const cartUrl = `${API_BASE_URL_EXPORT}${API_CONFIG.ENDPOINTS.CART(user.userId)}`;
      console.log('Testing cart API:', cartUrl);
      
      const response = await axios.get(cartUrl, { timeout: 10000 });
      
      setDebugInfo({
        success: true,
        cartUrl,
        response: response.data,
        status: response.status
      });
    } catch (err) {
      setDebugInfo({
        success: false,
        error: err.message,
        status: err.response?.status,
        data: err.response?.data,
        cartUrl: `${API_BASE_URL_EXPORT}${API_CONFIG.ENDPOINTS.CART(user.userId)}`
      });
    } finally {
      setTesting(false);
    }
  };

  const testUserAPI = async () => {
    setTesting(true);
    try {
      // Test user registration
      const userUrl = `${API_BASE_URL_EXPORT}${API_CONFIG.ENDPOINTS.USERS}`;
      console.log('Testing user API:', userUrl);
      
      const response = await axios.post(userUrl, {
        userId: user.userId,
        username: user.username,
        email: user.email
      }, { timeout: 10000 });
      
      setDebugInfo({
        success: true,
        userUrl,
        response: response.data,
        status: response.status,
        type: 'user'
      });
    } catch (err) {
      setDebugInfo({
        success: false,
        error: err.message,
        status: err.response?.status,
        data: err.response?.data,
        userUrl: `${API_BASE_URL_EXPORT}${API_CONFIG.ENDPOINTS.USERS}`,
        type: 'user'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg mt-4 text-sm">
      <h3 className="font-bold mb-2">🐛 Cart Debug Information</h3>
      
      <div className="space-y-2">
        <div><strong>User Status:</strong> {isLoggedIn ? '✅ Logged In' : '❌ Guest'}</div>
        <div><strong>Cart Items:</strong> {items.length}</div>
        <div><strong>Loading:</strong> {loading ? '⏳ Yes' : '✅ No'}</div>
        <div><strong>Error:</strong> {error || '✅ None'}</div>
        <div><strong>API URL:</strong> {API_BASE_URL_EXPORT}</div>
        {user && (
          <div><strong>User ID:</strong> {user.userId}</div>
        )}
      </div>

      {user && (
        <div className="mt-4 space-x-2">
          <button
            onClick={testCartAPI}
            disabled={testing}
            className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50"
          >
            {testing ? '⏳ Testing...' : '🧪 Test Cart API'}
          </button>
          <button
            onClick={testUserAPI}
            disabled={testing}
            className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:opacity-50"
          >
            {testing ? '⏳ Testing...' : '🧪 Test User API'}
          </button>
        </div>
      )}

      {debugInfo && (
        <div className="mt-4 p-3 bg-white rounded border">
          <h4 className="font-semibold mb-2">
            {debugInfo.type === 'user' ? '👤 User API Test Result:' : '🛒 Cart API Test Result:'}
          </h4>
          {debugInfo.success ? (
            <div className="text-green-600">
              <div>✅ Success (Status: {debugInfo.status})</div>
              <div className="text-xs mt-1">URL: {debugInfo.cartUrl || debugInfo.userUrl}</div>
              <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(debugInfo.response, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-red-600">
              <div>❌ Failed (Status: {debugInfo.status || 'No Response'})</div>
              <div className="text-xs mt-1">URL: {debugInfo.cartUrl || debugInfo.userUrl}</div>
              <div className="text-xs mt-1">Error: {debugInfo.error}</div>
              {debugInfo.data && (
                <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(debugInfo.data, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartDebugInfo;
