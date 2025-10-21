// Test cart loading API
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function testCartLoading() {
  console.log('🧪 Testing Cart Loading API...');
  
  try {
    // Test with a test user ID
    const testUserId = 'test-user-cart-loading';
    
    console.log('📦 Testing cart loading for user:', testUserId);
    
    // First, try to get the cart (should create empty cart if doesn't exist)
    const response = await axios.get(`${API_BASE_URL}/api/cart/${testUserId}`);
    console.log('✅ Cart loading successful:', response.data);
    
    // Test with a real Firebase UID format
    const firebaseUid = 'eOWzgdSCQDNXPyrorChBbkvaTrZ2'; // Admin UID from the code
    console.log('\n📦 Testing cart loading for Firebase UID:', firebaseUid);
    
    const response2 = await axios.get(`${API_BASE_URL}/api/cart/${firebaseUid}`);
    console.log('✅ Firebase UID cart loading successful:', response2.data);
    
    console.log('\n🎉 Cart loading API is working correctly!');
    
  } catch (error) {
    console.error('❌ Cart loading test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    if (error.config) {
      console.error('Request URL:', error.config.url);
    }
  }
}

testCartLoading();
