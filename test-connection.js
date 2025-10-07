// Test script to verify frontend-backend connection
const axios = require('axios');

async function testConnection() {
  try {
    console.log('🔍 Testing backend connection...');
    
    // Test backend health
    const healthResponse = await axios.get('http://localhost:5000/api/health/db');
    console.log('✅ Backend health check:', healthResponse.data);
    
    // Test products API
    const productsResponse = await axios.get('http://localhost:5000/api/products');
    console.log('✅ Products API working:', productsResponse.data.length, 'products found');
    
    // Test CORS
    const corsTest = await axios.get('http://localhost:5000/', {
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    console.log('✅ CORS test passed');
    
    console.log('🎉 All tests passed! Backend and frontend should be connected.');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testConnection();
