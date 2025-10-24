// Quick test script to check Vercel endpoints
const axios = require('axios');

const VERCEL_BACKEND = 'https://anne-web-application.vercel.app';

async function testVercelEndpoints() {
  console.log('\n🧪 ========== TESTING VERCEL ENDPOINTS ==========\n');
  console.log(`📍 Backend URL: ${VERCEL_BACKEND}\n`);

  // Test 1: Backend Root
  console.log('📋 Test 1: Backend Root Endpoint');
  try {
    const response = await axios.get(`${VERCEL_BACKEND}/`);
    console.log('✅ Backend is accessible!');
    console.log('   - Version:', response.data.version);
    console.log('   - Mongo Status:', response.data.mongoStatus);
    console.log('   - Last Update:', response.data.lastUpdate);
  } catch (error) {
    console.log('❌ Backend root failed!');
    console.log('   - Status:', error.response?.status || 'No response');
    console.log('   - Error:', error.message);
    console.log('   ⚠️  Backend might not be deployed or URL is wrong');
  }

  // Test 2: Health Check
  console.log('\n📋 Test 2: MongoDB Health Check');
  try {
    const response = await axios.get(`${VERCEL_BACKEND}/api/health/db`);
    console.log('✅ Health endpoint accessible!');
    console.log('   - MongoDB Connected:', response.data.mongoConnected);
    console.log('   - Connection State:', response.data.connectionState);
    
    if (!response.data.mongoConnected) {
      console.log('   ⚠️  MongoDB is NOT connected!');
      console.log('   💡 Solution: Set MONGODB_URI in Vercel environment variables');
    }
  } catch (error) {
    console.log('❌ Health check failed!');
    console.log('   - Status:', error.response?.status || 'No response');
    console.log('   - Error:', error.message);
  }

  // Test 3: Cart Diagnostic
  console.log('\n📋 Test 3: Cart Diagnostic Endpoint');
  try {
    const response = await axios.get(`${VERCEL_BACKEND}/api/cart/diagnostic`);
    console.log('✅ Cart diagnostic accessible!');
    console.log('   - MongoDB Connected:', response.data.diagnostic.mongoConnection.isConnected);
    console.log('   - Cart Endpoint Version:', response.data.diagnostic.cartEndpoint.version);
    console.log('   - Message:', response.data.message);
  } catch (error) {
    console.log('❌ Cart diagnostic failed!');
    console.log('   - Status:', error.response?.status || 'No response');
    console.log('   - Error:', error.message);
    if (error.response?.status === 404) {
      console.log('   ⚠️  Cart diagnostic endpoint not found');
      console.log('   💡 Solution: Redeploy backend with updated code');
    }
  }

  // Test 4: Cart Add Endpoint
  console.log('\n📋 Test 4: Cart Add Endpoint (POST)');
  try {
    const testData = {
      userId: 'vercel-test-' + Date.now(),
      product: {
        id: 'test-product-1',
        title: 'Vercel Test Product',
        price: 99.99,
        image: 'https://example.com/test.jpg',
        category: 'Test',
        description: 'Testing Vercel deployment',
        stock: 100
      },
      quantity: 1,
      userDetails: {
        username: 'Vercel Test User',
        email: 'test@vercel.com',
        phone: '+1234567890'
      }
    };

    const response = await axios.post(`${VERCEL_BACKEND}/api/cart/add`, testData);
    console.log('✅ Cart add endpoint works!');
    console.log('   - Success:', response.data.success);
    console.log('   - Message:', response.data.message);
    console.log('   - Cart ID:', response.data.cart?._id);
    console.log('   - Items in Cart:', response.data.summary?.itemsInCart);
    console.log('   - Total Amount: $' + response.data.summary?.totalAmount);
  } catch (error) {
    console.log('❌ Cart add endpoint failed!');
    console.log('   - Status:', error.response?.status || 'No response');
    console.log('   - Error:', error.message);
    
    if (error.response?.status === 404) {
      console.log('   ⚠️  Cart add endpoint not found (404)');
      console.log('   💡 This is the main issue!');
      console.log('   💡 Solutions:');
      console.log('      1. Verify vercel.json has cart routes');
      console.log('      2. Check if Backend/api/cart/add.js exists');
      console.log('      3. Redeploy with fresh build (uncheck cache)');
      console.log('      4. Check Vercel function logs for errors');
    } else if (error.response?.status === 503) {
      console.log('   ⚠️  Service unavailable - MongoDB not connected');
      console.log('   💡 Solution: Set MONGODB_URI environment variable in Vercel');
    } else if (error.response?.data) {
      console.log('   - Response:', error.response.data);
    }
  }

  // Test 5: Cart Get Endpoint
  console.log('\n📋 Test 5: Cart Get Endpoint (GET)');
  try {
    const testUserId = 'test-user-123';
    const response = await axios.get(`${VERCEL_BACKEND}/api/cart/${testUserId}`);
    console.log('✅ Cart get endpoint works!');
    console.log('   - Success:', response.data.success);
    console.log('   - Items Count:', response.data.itemCount);
  } catch (error) {
    console.log('❌ Cart get endpoint failed!');
    console.log('   - Status:', error.response?.status || 'No response');
    console.log('   - Error:', error.message);
    
    if (error.response?.status === 404) {
      console.log('   ⚠️  Cart get endpoint not found (404)');
      console.log('   💡 Solution: Redeploy backend with updated routes');
    }
  }

  // Summary
  console.log('\n📊 ========== TEST SUMMARY ==========\n');
  console.log('Next Steps:');
  console.log('1. If all tests pass: Cart should work in your app! ✅');
  console.log('2. If backend root fails: Check Vercel deployment status');
  console.log('3. If MongoDB not connected: Set MONGODB_URI in Vercel settings');
  console.log('4. If cart endpoints 404: Redeploy with updated vercel.json');
  console.log('5. Check: https://vercel.com/dashboard for deployment status\n');
}

// Run tests
console.log('🚀 Starting Vercel endpoint tests...');
console.log('⏳ This will take a few seconds...\n');

testVercelEndpoints().catch(error => {
  console.error('\n💥 Test script error:', error.message);
});
