// Simple cart test
const axios = require('axios');

async function testSimpleCart() {
  try {
    console.log('Testing cart API...');
    
    // Test get cart
    const response = await axios.get('http://localhost:5000/api/cart/test-user-123');
    console.log('Cart response:', response.data);
    
    console.log('Cart API is working!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSimpleCart();
