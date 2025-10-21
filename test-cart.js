// Test cart functionality
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function testCartAPI() {
  console.log('🧪 Testing Cart API...');
  
  try {
    // Test 1: Health check
    console.log('\n1. Testing health check...');
    const healthResponse = await axios.get(`${API_BASE_URL}/api/health/db`);
    console.log('✅ Health check:', healthResponse.data);
    
    // Test 2: Get empty cart for test user
    const testUserId = 'test-user-123';
    console.log('\n2. Testing get cart...');
    const cartResponse = await axios.get(`${API_BASE_URL}/api/cart/${testUserId}`);
    console.log('✅ Get cart:', cartResponse.data);
    
    // Test 3: Add item to cart
    console.log('\n3. Testing add to cart...');
    const testProduct = {
      id: 'test-product-1',
      title: 'Test Product',
      price: 29.99,
      image: 'https://via.placeholder.com/150'
    };
    
    const addResponse = await axios.post(`${API_BASE_URL}/api/cart/${testUserId}/add`, {
      product: testProduct,
      quantity: 2
    });
    console.log('✅ Add to cart:', addResponse.data);
    
    // Test 4: Get cart again to verify item was added
    console.log('\n4. Testing get cart after adding item...');
    const cartResponse2 = await axios.get(`${API_BASE_URL}/api/cart/${testUserId}`);
    console.log('✅ Cart after adding:', cartResponse2.data);
    
    // Test 5: Update item quantity
    console.log('\n5. Testing update quantity...');
    const updateResponse = await axios.put(`${API_BASE_URL}/api/cart/${testUserId}/item/${testProduct.id}`, {
      quantity: 3
    });
    console.log('✅ Update quantity:', updateResponse.data);
    
    // Test 6: Remove item
    console.log('\n6. Testing remove item...');
    const removeResponse = await axios.delete(`${API_BASE_URL}/api/cart/${testUserId}/item/${testProduct.id}`);
    console.log('✅ Remove item:', removeResponse.data);
    
    // Test 7: Clear cart
    console.log('\n7. Testing clear cart...');
    const clearResponse = await axios.delete(`${API_BASE_URL}/api/cart/${testUserId}`);
    console.log('✅ Clear cart:', clearResponse.data);
    
    console.log('\n🎉 All cart API tests passed!');
    
  } catch (error) {
    console.error('❌ Cart API test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testCartAPI();
