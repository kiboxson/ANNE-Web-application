const axios = require('axios');

async function testLocalCart() {
  console.log('🧪 Testing Local Cart API...\n');
  
  const BASE_URL = 'http://localhost:5000';
  const TEST_USER = 'test-user-local';
  
  try {
    // Test 1: Backend health
    console.log('🏥 Testing backend connection...');
    const healthResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ Backend is responding');
    console.log('Available endpoints:', Object.keys(healthResponse.data.endpoints || {}));
    console.log('');

    // Test 2: Get cart (should create empty cart)
    console.log('🛒 Testing GET cart...');
    const cartResponse = await axios.get(`${BASE_URL}/api/cart/${TEST_USER}`);
    console.log('✅ GET cart working:', cartResponse.data);
    console.log('');

    // Test 3: Add item to cart
    console.log('➕ Testing ADD to cart...');
    const addResponse = await axios.post(`${BASE_URL}/api/cart/${TEST_USER}/add`, {
      product: {
        id: 'test-product-001',
        title: 'Test Product',
        price: 29.99,
        image: 'https://example.com/test.jpg'
      },
      quantity: 1
    });
    console.log('✅ ADD to cart working:', addResponse.data);
    console.log('Items in cart:', addResponse.data.items.length);
    console.log('');

    console.log('🎉 All local cart tests passed!');
    console.log('✅ Your backend cart API is working correctly');
    console.log('');
    console.log('🔧 Next steps:');
    console.log('1. Restart your frontend: npm start (in Frontend folder)');
    console.log('2. Test add to cart in your web app');
    console.log('3. Cart should work without errors now!');

  } catch (error) {
    console.error('❌ Local cart test failed:');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Make sure backend is running: npm start (in Backend folder)');
    console.log('2. Check if port 5000 is available');
    console.log('3. Verify MongoDB connection is working');
  }
}

testLocalCart();
