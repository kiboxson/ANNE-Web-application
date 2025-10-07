// Test script to verify the API fix works
const axios = require('axios');

async function testFixedAPI() {
  try {
    console.log('🧪 Testing fixed API endpoints...');
    
    // Test 1: Products endpoint
    console.log('📦 Testing products endpoint...');
    const productsResponse = await axios.get('http://localhost:5000/api/products');
    console.log(`✅ Products loaded: ${productsResponse.data.length} products`);
    
    // Test 2: Create a test product
    console.log('➕ Testing product creation...');
    const testProduct = {
      title: "API Fix Test Product",
      price: 199.99,
      stock: 15,
      category: "Test",
      description: "Testing the API fix"
    };
    
    const createResponse = await axios.post('http://localhost:5000/api/products', testProduct, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Product created successfully!');
    console.log('Created product ID:', createResponse.data.id);
    
    // Test 3: Flash products endpoint
    console.log('⚡ Testing flash products endpoint...');
    const flashResponse = await axios.get('http://localhost:5000/api/flash-products');
    console.log(`✅ Flash products loaded: ${flashResponse.data.length} products`);
    
    // Test 4: Orders endpoint
    console.log('📋 Testing orders endpoint...');
    const ordersResponse = await axios.get('http://localhost:5000/api/orders');
    console.log(`✅ Orders loaded: ${ordersResponse.data.length} orders`);
    
    console.log('\n🎉 All API endpoints are working correctly!');
    console.log('✅ The 405 Method Not Allowed error has been fixed!');
    
  } catch (error) {
    console.error('❌ API test failed:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

testFixedAPI();
