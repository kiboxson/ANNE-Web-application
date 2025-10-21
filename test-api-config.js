// Test current API configuration
const axios = require('axios');

// Simulate the same configuration as the frontend
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? (process.env.REACT_APP_API_URL || 'https://anne-web-application.vercel.app')
  : 'http://localhost:5000';

console.log('🔧 Testing API Configuration:');
console.log('Environment:', process.env.NODE_ENV);
console.log('API Base URL:', API_BASE_URL);

async function testAPI() {
  try {
    console.log('\n🧪 Testing API connection...');
    
    // Test health endpoint
    const healthResponse = await axios.get(`${API_BASE_URL}/api/health/db`);
    console.log('✅ Health check successful:', healthResponse.data);
    
    // Test products endpoint
    const productsResponse = await axios.get(`${API_BASE_URL}/api/products`);
    console.log('✅ Products endpoint successful:', productsResponse.data.length, 'products');
    
    // Test flash products endpoint
    const flashResponse = await axios.get(`${API_BASE_URL}/api/flash-products`);
    console.log('✅ Flash products endpoint successful:', flashResponse.data.length, 'flash products');
    
    console.log('\n🎉 All API endpoints are working correctly!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testAPI();
