// Test user registration API
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function testUserRegistration() {
  console.log('🧪 Testing User Registration API...');
  
  try {
    // Test user registration
    const testUser = {
      userId: 'test-user-' + Date.now(),
      username: 'testuser',
      email: 'test@example.com'
    };
    
    console.log('📝 Registering user:', testUser);
    
    const response = await axios.post(`${API_BASE_URL}/api/users`, testUser);
    console.log('✅ User registration successful:', response.data);
    
    // Test getting all users
    console.log('\n📋 Getting all users...');
    const usersResponse = await axios.get(`${API_BASE_URL}/api/users`);
    console.log('✅ Users retrieved:', usersResponse.data.length, 'users');
    
    console.log('\n🎉 User registration API is working correctly!');
    
  } catch (error) {
    console.error('❌ User registration test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testUserRegistration();
