// API Configuration for ANNE Web Application
// This file centralizes all API endpoint configurations

// Get the API base URL from environment variables
// Force localhost for development when NODE_ENV is not production
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? (process.env.REACT_APP_API_URL || 'https://anne-web-application.vercel.app')
  : 'http://localhost:5000';

// API Configuration object
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  
  // API Endpoints
  ENDPOINTS: {
    // Health & Status
    HEALTH: '/api/health/db',
    
    // Products
    PRODUCTS: '/api/products',
    FLASH_PRODUCTS: '/api/flash-products',
    
    // Orders
    ORDERS: '/api/orders',
    USER_ORDERS: (userId) => `/api/orders/user/${userId}`,
    ORDER_STATUS: (orderId) => `/api/orders/${orderId}/status`,
    
    // Chat
    CHAT: '/api/chat',
    CHAT_SESSIONS: '/api/chat-sessions',
    CHAT_MESSAGES: (sessionId) => `/api/chat/${sessionId}`,
    CHAT_READ: (sessionId) => `/api/chat/${sessionId}/read`,
    
    // Users
    USERS: '/api/users',
    USER_ROLE: (userId) => `/api/users/${userId}/role`,
    
    // Cart
    CART: (userId) => `/api/cart/${userId}`,
    CART_ADD: (userId) => `/api/cart/${userId}/add`,
    CART_UPDATE: (userId, itemId) => `/api/cart/${userId}/item/${itemId}`,
    CART_REMOVE: (userId, itemId) => `/api/cart/${userId}/item/${itemId}`,
    CART_CLEAR: (userId) => `/api/cart/${userId}`,
    
    // Email
    TEST_EMAIL: '/api/test-email',
    SETUP_EMAIL: '/api/setup-email',
    SEND_CANCELLATION_EMAIL: '/api/send-cancellation-email',
    
    // Payment
    PAYHERE_NOTIFY: '/api/payhere/notify',
    PAYHERE_RETURN: '/api/payhere/return'
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function for common API calls
export const apiCall = {
  get: (endpoint) => fetch(getApiUrl(endpoint)),
  post: (endpoint, data) => fetch(getApiUrl(endpoint), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  put: (endpoint, data) => fetch(getApiUrl(endpoint), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  delete: (endpoint) => fetch(getApiUrl(endpoint), {
    method: 'DELETE'
  })
};

// Export the base URL for axios usage
export const API_BASE_URL_EXPORT = API_BASE_URL;

console.log('🔗 API Configuration loaded:', {
  baseUrl: API_BASE_URL,
  environment: process.env.NODE_ENV,
  isProduction: process.env.NODE_ENV === 'production',
  envApiUrl: process.env.REACT_APP_API_URL
});

// Alert if still using wrong URL
if (API_BASE_URL.includes('vercel.app') && process.env.NODE_ENV !== 'production') {
  console.warn('⚠️ WARNING: Using Vercel URL in development mode!');
  console.warn('Expected: http://localhost:5000');
  console.warn('Actual:', API_BASE_URL);
}
