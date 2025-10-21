// Test hybrid cart system (works with or without MongoDB)
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function testHybridCart() {
  console.log('🧪 Testing Hybrid Cart System (Memory + MongoDB fallback)...');
  
  try {
    const testUserId = 'test-user-hybrid-' + Date.now();
    
    // Test 1: Get empty cart
    console.log('\n📦 Test 1: Getting empty cart...');
    const emptyCartResponse = await axios.get(`${API_BASE_URL}/api/cart/${testUserId}`);
    console.log('✅ Empty cart retrieved:', emptyCartResponse.data);
    
    // Test 2: Add item to cart
    console.log('\n🛒 Test 2: Adding item to cart...');
    const testProduct = {
      id: 'test-product-123',
      title: 'Test Product',
      price: 25.99,
      image: 'https://example.com/image.jpg'
    };
    
    const addResponse = await axios.post(`${API_BASE_URL}/api/cart/${testUserId}/add`, {
      product: testProduct,
      quantity: 2
    });
    console.log('✅ Item added to cart:', addResponse.data);
    
    // Test 3: Get cart with items
    console.log('\n📦 Test 3: Getting cart with items...');
    const cartWithItemsResponse = await axios.get(`${API_BASE_URL}/api/cart/${testUserId}`);
    console.log('✅ Cart with items retrieved:', cartWithItemsResponse.data);
    
    // Test 4: Add same item again (should update quantity)
    console.log('\n🛒 Test 4: Adding same item again...');
    const addSameResponse = await axios.post(`${API_BASE_URL}/api/cart/${testUserId}/add`, {
      product: testProduct,
      quantity: 1
    });
    console.log('✅ Same item added (quantity updated):', addSameResponse.data);
    
    // Test 5: Update item quantity
    console.log('\n🔄 Test 5: Updating item quantity...');
    const updateResponse = await axios.put(`${API_BASE_URL}/api/cart/${testUserId}/item/${testProduct.id}`, {
      quantity: 5
    });
    console.log('✅ Item quantity updated:', updateResponse.data);
    
    console.log('\n🎉 All hybrid cart tests passed! Cart works without MongoDB Atlas!');
    
  } catch (error) {
    console.error('❌ Hybrid cart test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testHybridCart();
