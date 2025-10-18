const axios = require('axios');

// Test the deployed Vercel backend
const VERCEL_URL = 'https://anne-web-application.vercel.app';

async function testVercelBackend() {
  console.log('🧪 Testing Vercel Backend Deployment...\n');
  
  try {
    // Test 1: Root endpoint
    console.log('📋 Test 1: Testing root endpoint...');
    const rootResponse = await axios.get(VERCEL_URL);
    console.log('✅ Root endpoint working:', rootResponse.data.message);
    console.log('   Available endpoints:', Object.keys(rootResponse.data.endpoints));
    console.log('');

    // Test 2: Health check
    console.log('🏥 Test 2: Testing health endpoint...');
    try {
      const healthResponse = await axios.get(`${VERCEL_URL}/api/health/db`);
      console.log('✅ Health check passed:', healthResponse.data);
    } catch (healthError) {
      console.log('❌ Health check failed:', healthError.response?.status, healthError.response?.statusText);
    }
    console.log('');

    // Test 3: Products endpoint
    console.log('📦 Test 3: Testing products endpoint...');
    try {
      const productsResponse = await axios.get(`${VERCEL_URL}/api/products`);
      console.log('✅ Products endpoint working:', productsResponse.data.length, 'products found');
    } catch (productsError) {
      console.log('❌ Products endpoint failed:', productsError.response?.status, productsError.response?.statusText);
    }
    console.log('');

    // Test 4: Cart endpoints (the problematic ones)
    console.log('🛒 Test 4: Testing cart endpoints...');
    
    // Test GET cart
    try {
      const cartResponse = await axios.get(`${VERCEL_URL}/api/cart/test-user-vercel`);
      console.log('✅ GET cart endpoint working:', cartResponse.data);
    } catch (cartError) {
      console.log('❌ GET cart endpoint failed:', cartError.response?.status, cartError.response?.statusText);
      console.log('   Error details:', cartError.response?.data);
    }
    
    // Test POST add to cart
    try {
      const addResponse = await axios.post(`${VERCEL_URL}/api/cart/test-user-vercel/add`, {
        product: {
          id: 'test-prod-001',
          title: 'Test Product',
          price: 29.99,
          image: 'https://example.com/test.jpg'
        },
        quantity: 1
      });
      console.log('✅ POST add to cart working:', addResponse.data);
    } catch (addError) {
      console.log('❌ POST add to cart failed:', addError.response?.status, addError.response?.statusText);
      console.log('   Error details:', addError.response?.data);
      console.log('   Request URL:', `${VERCEL_URL}/api/cart/test-user-vercel/add`);
    }
    console.log('');

    // Test 5: Check all available routes
    console.log('🔍 Test 5: Checking route availability...');
    const routes = [
      '/api/health/db',
      '/api/products',
      '/api/flash-products',
      '/api/orders',
      '/api/chat',
      '/api/users',
      '/api/cart/test-user'
    ];

    for (const route of routes) {
      try {
        const response = await axios.get(`${VERCEL_URL}${route}`);
        console.log(`✅ ${route} - Status: ${response.status}`);
      } catch (error) {
        console.log(`❌ ${route} - Status: ${error.response?.status || 'Network Error'}`);
      }
    }

  } catch (error) {
    console.error('❌ General test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testVercelBackend();
