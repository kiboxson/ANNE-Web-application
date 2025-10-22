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

  const testMongoDBHealth = async () => {
    setTesting(true);
    try {
      // Test MongoDB cart health
      const healthUrl = `${API_BASE_URL_EXPORT}/api/health/cart`;
      console.log('Testing MongoDB cart health:', healthUrl);
      
      const response = await axios.get(healthUrl, { timeout: 10000 });
      
      setDebugInfo({
        success: true,
        healthUrl,
        response: response.data,
        status: response.status,
        type: 'mongodb'
      });
    } catch (err) {
      setDebugInfo({
        success: false,
        error: err.message,
        status: err.response?.status,
        data: err.response?.data,
        healthUrl: `${API_BASE_URL_EXPORT}/api/health/cart`,
        type: 'mongodb'
      });
    } finally {
      setTesting(false);
    }
  };

  const testEnvironment = async () => {
    setTesting(true);
    try {
      // Test environment configuration
      const envUrl = `${API_BASE_URL_EXPORT}/api/health/env`;
      console.log('Testing environment configuration:', envUrl);
      
      const response = await axios.get(envUrl, { timeout: 10000 });
      
      setDebugInfo({
        success: true,
        envUrl,
        response: response.data,
        status: response.status,
        type: 'environment'
      });
    } catch (err) {
      setDebugInfo({
        success: false,
        error: err.message,
        status: err.response?.status,
        data: err.response?.data,
        envUrl: `${API_BASE_URL_EXPORT}/api/health/env`,
        type: 'environment'
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

      <div className="mt-4 space-y-2">
        <div className="space-x-2">
          <button
            onClick={testEnvironment}
            disabled={testing}
            className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 disabled:opacity-50"
          >
            {testing ? '⏳ Testing...' : '⚙️ Check Environment'}
          </button>
          <button
            onClick={testMongoDBHealth}
            disabled={testing}
            className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 disabled:opacity-50"
          >
            {testing ? '⏳ Testing...' : '🔍 Test MongoDB Health'}
          </button>
        </div>
        {user && (
          <div className="space-x-2">
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
      </div>

      {debugInfo && (
        <div className="mt-4 p-3 bg-white rounded border">
          <h4 className="font-semibold mb-2">
            {debugInfo.type === 'user' ? '👤 User API Test Result:' : 
             debugInfo.type === 'mongodb' ? '🔍 MongoDB Health Test Result:' : 
             debugInfo.type === 'environment' ? '⚙️ Environment Check Result:' :
             '🛒 Cart API Test Result:'}
          </h4>
          {debugInfo.success ? (
            <div className="text-green-600">
              <div>✅ Success (Status: {debugInfo.status})</div>
              <div className="text-xs mt-1">URL: {debugInfo.cartUrl || debugInfo.userUrl || debugInfo.healthUrl || debugInfo.envUrl}</div>
              {debugInfo.type === 'environment' && debugInfo.response && (
                <div className="mt-2 space-y-1 text-xs">
                  <div><strong>Node Environment:</strong> {debugInfo.response.nodeEnv || 'Not set'}</div>
                  <div><strong>Has MONGODB_URI:</strong> {debugInfo.response.hasMongoUri ? '✅ Yes' : '❌ No - SET THIS IN VERCEL!'}</div>
                  <div><strong>Using Fallback URI:</strong> {debugInfo.response.usingFallback ? '⚠️ Yes (Set MONGODB_URI in Vercel)' : '✅ No'}</div>
                  <div><strong>Connection State:</strong> {debugInfo.response.connectionStates[debugInfo.response.connectionState]} ({debugInfo.response.connectionState})</div>
                  {debugInfo.response.mongoUriStart && (
                    <div><strong>MongoDB URI:</strong> {debugInfo.response.mongoUriStart}</div>
                  )}
                </div>
              )}
              {debugInfo.type === 'mongodb' && debugInfo.response && (
                <div className="mt-2 space-y-1 text-xs">
                  <div><strong>MongoDB Connected:</strong> {debugInfo.response.mongoConnected ? '✅ Yes' : '❌ No'}</div>
                  <div><strong>Cart Collection:</strong> {debugInfo.response.cartCollectionAccessible ? '✅ Accessible' : '❌ Not Accessible'}</div>
                  <div><strong>Using Fallback URI:</strong> {debugInfo.response.usingFallbackUri ? '⚠️ Yes (Set MONGODB_URI in Vercel)' : '✅ No'}</div>
                  {debugInfo.response.cartCount !== undefined && (
                    <div><strong>Cart Count:</strong> {debugInfo.response.cartCount}</div>
                  )}
                  {debugInfo.response.databaseName && (
                    <div><strong>Database:</strong> {debugInfo.response.databaseName}</div>
                  )}
                </div>
              )}
              <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(debugInfo.response, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-red-600">
              <div>❌ Failed (Status: {debugInfo.status || 'No Response'})</div>
              <div className="text-xs mt-1">URL: {debugInfo.cartUrl || debugInfo.userUrl || debugInfo.healthUrl}</div>
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
