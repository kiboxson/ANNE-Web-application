const axios = require('axios');

// Test cart API endpoints
async function testCartAPI() {
  const API_BASE = 'http://localhost:5000';
  const testUserId = 'test-user-123';
  
  console.log('🧪 Testing Cart API Endpoints\n');
  console.log('API Base:', API_BASE);
  console.log('Test User ID:', testUserId);
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Add item to cart
    console.log('\n📦 Test 1: Add item to cart');
    const addResponse = await axios.post(`${API_BASE}/api/cart/add`, {
      userId: testUserId,
      product: {
        id: 'test-product-1',
        title: 'Test Product',
        price: 29.99,
        image: 'https://via.placeholder.com/150',
        category: 'Electronics',
        description: 'A test product',
        stock: 10
      },
      quantity: 2,
      userDetails: {
        username: 'Test User',
        email: 'test@example.com',
        phone: '1234567890'
      }
    });
    
    console.log('✅ Add Response Status:', addResponse.status);
    console.log('✅ Add Response:', JSON.stringify(addResponse.data, null, 2));
    
    // Test 2: Get cart
    console.log('\n📦 Test 2: Get cart');
    const getResponse = await axios.get(`${API_BASE}/api/cart/${testUserId}`);
    console.log('✅ Get Response Status:', getResponse.status);
    console.log('✅ Cart Items:', getResponse.data.cart?.items?.length || 0);
    
    // Test 3: Check backend health
    console.log('\n📦 Test 3: Backend health check');
    const healthResponse = await axios.get(`${API_BASE}/api/health/db`);
    console.log('✅ Health Status:', healthResponse.data.status);
    console.log('✅ MongoDB Status:', healthResponse.data.mongodb);
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ ALL TESTS PASSED!');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED!');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
    console.error('\nFull Error:', error);
  }
}

testCartAPI();
