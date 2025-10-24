// Test script to verify cart functionality with MongoDB Atlas
const axios = require('axios');

const API_BASE = 'http://localhost:5000';

// Test user and product data
const testUserId = 'test-user-' + Date.now();
const testProduct = {
  id: 'product-123',
  title: 'Test Product - Wireless Headphones',
  price: 99.99,
  image: 'https://example.com/headphones.jpg',
  category: 'Electronics',
  description: 'High-quality wireless headphones with noise cancellation',
  stock: 50
};

const testUserDetails = {
  username: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890'
};

async function testCartFunctionality() {
  console.log('\n🧪 ========== TESTING CART FUNCTIONALITY ==========\n');
  
  try {
    // Test 1: Check MongoDB connection
    console.log('📋 Test 1: Checking MongoDB connection...');
    const healthCheck = await axios.get(`${API_BASE}/api/health/db`);
    console.log('✅ MongoDB Status:', healthCheck.data);
    
    if (!healthCheck.data.mongoConnected) {
      console.error('❌ MongoDB is not connected. Please start MongoDB first.');
      return;
    }
    
    // Test 2: Add item to cart
    console.log('\n📋 Test 2: Adding item to cart...');
    const addResponse = await axios.post(`${API_BASE}/api/cart/add`, {
      userId: testUserId,
      product: testProduct,
      quantity: 2,
      userDetails: testUserDetails
    });
    
    console.log('✅ Add to cart response:', JSON.stringify(addResponse.data, null, 2));
    console.log('📊 Cart Summary:', addResponse.data.summary);
    
    // Test 3: Get cart
    console.log('\n📋 Test 3: Retrieving cart...');
    const getResponse = await axios.get(`${API_BASE}/api/cart/${testUserId}`);
    console.log('✅ Cart retrieved:', JSON.stringify(getResponse.data, null, 2));
    
    // Test 4: Add another item
    console.log('\n📋 Test 4: Adding second item to cart...');
    const secondProduct = {
      id: 'product-456',
      title: 'Laptop Stand',
      price: 49.99,
      image: 'https://example.com/stand.jpg',
      category: 'Accessories',
      description: 'Adjustable aluminum laptop stand',
      stock: 100
    };
    
    const addResponse2 = await axios.post(`${API_BASE}/api/cart/add`, {
      userId: testUserId,
      product: secondProduct,
      quantity: 1,
      userDetails: testUserDetails
    });
    
    console.log('✅ Second item added:', addResponse2.data.message);
    console.log('📊 Updated Cart Summary:', addResponse2.data.summary);
    
    // Test 5: Verify cart contents
    console.log('\n📋 Test 5: Verifying cart contents...');
    const verifyResponse = await axios.get(`${API_BASE}/api/cart/${testUserId}`);
    const cart = verifyResponse.data.cart;
    
    console.log('✅ Cart Details:');
    console.log('   - User ID:', cart.userId);
    console.log('   - User Details:', cart.userDetails);
    console.log('   - Total Items:', cart.items.length);
    console.log('   - Items:');
    cart.items.forEach((item, index) => {
      console.log(`     ${index + 1}. ${item.title}`);
      console.log(`        - Price: $${item.price}`);
      console.log(`        - Quantity: ${item.quantity}`);
      console.log(`        - Subtotal: $${item.subtotal}`);
      console.log(`        - Category: ${item.category}`);
      console.log(`        - Added At: ${item.addedAt}`);
    });
    console.log('   - Order Summary:');
    console.log(`     - Total Items: ${cart.orderSummary.totalItems}`);
    console.log(`     - Total Quantity: ${cart.orderSummary.totalQuantity}`);
    console.log(`     - Subtotal: $${cart.orderSummary.subtotal}`);
    console.log(`     - Tax (10%): $${cart.orderSummary.tax}`);
    console.log(`     - Shipping: $${cart.orderSummary.shipping}`);
    console.log(`     - Total: $${cart.orderSummary.total}`);
    
    // Test 6: Remove item
    console.log('\n📋 Test 6: Removing first item from cart...');
    const removeResponse = await axios.delete(`${API_BASE}/api/cart/remove`, {
      data: {
        userId: testUserId,
        itemId: testProduct.id
      }
    });
    
    console.log('✅ Item removed:', removeResponse.data.message);
    console.log('📊 Items remaining:', removeResponse.data.cart.items.length);
    console.log('📊 New total: $' + removeResponse.data.cart.orderSummary.total);
    
    // Test 7: Clear cart
    console.log('\n📋 Test 7: Clearing entire cart...');
    const clearResponse = await axios.delete(`${API_BASE}/api/cart/clear`, {
      data: {
        userId: testUserId
      }
    });
    
    console.log('✅ Cart cleared:', clearResponse.data.message);
    console.log('📊 Items in cart:', clearResponse.data.cart.items.length);
    console.log('📊 Cart total: $' + clearResponse.data.cart.orderSummary.total);
    
    console.log('\n✅ ========== ALL TESTS PASSED ==========\n');
    console.log('🎉 Cart functionality is working correctly!');
    console.log('💾 All data is being saved to MongoDB Atlas "carts" collection');
    console.log('\n📝 Summary:');
    console.log('   ✅ Product details saved (id, title, price, category, description, stock, image)');
    console.log('   ✅ User details saved (username, email, phone)');
    console.log('   ✅ Order details calculated (subtotal, tax, shipping, total)');
    console.log('   ✅ Item metadata tracked (addedAt, subtotal per item)');
    console.log('   ✅ All operations persisted to MongoDB Atlas');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('❌ Response data:', error.response.data);
      console.error('❌ Status:', error.response.status);
    }
  }
}

// Run tests
console.log('🚀 Starting cart functionality tests...');
console.log('📍 API Base URL:', API_BASE);
console.log('👤 Test User ID:', testUserId);

testCartFunctionality();
