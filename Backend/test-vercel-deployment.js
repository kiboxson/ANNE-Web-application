// Test if Vercel backend is working
const axios = require('axios');

const BACKEND_URL = 'https://anne-web-application.vercel.app';

async function testBackend() {
  console.log('🧪 Testing Vercel Backend Deployment...\n');
  
  try {
    // Test 1: Root endpoint
    console.log('1️⃣ Testing root endpoint...');
    const rootResponse = await axios.get(BACKEND_URL);
    console.log('✅ Root endpoint working');
    console.log('   Endpoints listed:', Object.keys(rootResponse.data.endpoints || {}));
    
    // Test 2: Health check
    console.log('\n2️⃣ Testing health endpoint...');
    const healthResponse = await axios.get(`${BACKEND_URL}/api/health/db`);
    console.log('✅ Health endpoint:', healthResponse.data.status);
    
    // Test 3: Cart test endpoint
    console.log('\n3️⃣ Testing cart-test endpoint...');
    const cartTestResponse = await axios.get(`${BACKEND_URL}/api/cart-test`);
    console.log('✅ Cart test endpoint working');
    console.log('   Available endpoints:', cartTestResponse.data.endpoints);
    
    // Test 4: Try to get cart for test user
    console.log('\n4️⃣ Testing GET cart endpoint...');
    try {
      const getCartResponse = await axios.get(`${BACKEND_URL}/api/cart/test-user-123`);
      console.log('✅ GET cart endpoint working');
      console.log('   Response:', getCartResponse.data);
    } catch (err) {
      console.log('❌ GET cart endpoint failed:', err.response?.status, err.response?.statusText);
      console.log('   Error:', err.message);
    }
    
    // Test 5: Try to add to cart
    console.log('\n5️⃣ Testing POST cart/add endpoint...');
    try {
      const addCartResponse = await axios.post(`${BACKEND_URL}/api/cart/add`, {
        userId: 'test-user-123',
        product: {
          id: 'test-product-1',
          title: 'Test Product',
          price: 99.99,
          image: 'test.jpg'
        },
        quantity: 1
      });
      console.log('✅ POST cart/add endpoint working');
      console.log('   Response:', addCartResponse.data);
    } catch (err) {
      console.log('❌ POST cart/add endpoint failed:', err.response?.status, err.response?.statusText);
      console.log('   Error:', err.message);
      if (err.response?.data) {
        console.log('   Response data:', err.response.data);
      }
    }
    
    console.log('\n✅ Backend deployment test completed!');
    
  } catch (err) {
    console.error('❌ Backend test failed:', err.message);
    if (err.response) {
      console.error('   Status:', err.response.status);
      console.error('   Data:', err.response.data);
    }
  }
}

testBackend();
