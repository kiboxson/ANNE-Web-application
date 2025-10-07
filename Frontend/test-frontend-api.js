// Test script to verify frontend can communicate with backend
const axios = require('axios');

async function testFrontendToBackend() {
  try {
    console.log('🧪 Testing frontend to backend connection...');
    
    // Test 1: Check if backend is accessible from frontend context
    console.log('📡 Testing backend health endpoint...');
    const healthResponse = await axios.get('http://localhost:5000/api/health/db');
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test 2: Test product creation
    console.log('📦 Testing product creation...');
    const testProduct = {
      title: "Frontend Test Product",
      price: 149.99,
      stock: 5,
      category: "Test Category",
      description: "Created from frontend test"
    };
    
    const createResponse = await axios.post('http://localhost:5000/api/products', testProduct, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Product creation from frontend context successful!');
    console.log('Response:', createResponse.data);
    
    // Test 3: Test getting products
    console.log('📋 Testing product retrieval...');
    const getResponse = await axios.get('http://localhost:5000/api/products');
    console.log('✅ Product retrieval successful!');
    console.log(`Found ${getResponse.data.length} products`);
    
  } catch (error) {
    console.error('❌ Frontend to backend test failed:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    
    if (error.response?.status === 405) {
      console.error('🚨 HTTP 405 Method Not Allowed - This suggests a routing issue');
      console.error('🔍 Check if the route exists and accepts the HTTP method being used');
    }
  }
}

testFrontendToBackend();
