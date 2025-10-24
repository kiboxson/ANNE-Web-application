// Direct test of Vercel cart endpoint
const axios = require('axios');

const BACKEND_URL = 'https://anne-web-application.vercel.app';

async function testCartAdd() {
  console.log('🧪 Testing Vercel Cart Add Endpoint...\n');
  
  try {
    const response = await axios.post(`${BACKEND_URL}/api/cart`, {
      userId: 'test-' + Date.now(),
      product: {
        id: 'test-1',
        title: 'Test Product',
        price: 50,
        image: 'test.jpg',
        category: 'Test',
        description: 'Test product',
        stock: 10
      },
      quantity: 1,
      userDetails: {
        username: 'Test User',
        email: 'test@test.com',
        phone: '1234567890'
      }
    });
    
    console.log('✅ SUCCESS! Cart endpoint is working!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ FAILED! Cart endpoint returned error:');
    console.log('Status:', error.response?.status || 'No response');
    console.log('Error:', error.message);
    
    if (error.response?.status === 404) {
      console.log('\n🔍 DIAGNOSIS:');
      console.log('The cart endpoint does NOT exist on Vercel.');
      console.log('This means the backend code is NOT deployed.');
      console.log('\n💡 SOLUTION:');
      console.log('1. Go to Vercel Dashboard: https://vercel.com/dashboard');
      console.log('2. Find your backend project');
      console.log('3. Settings → General → Root Directory → Set to "Backend"');
      console.log('4. Deployments → Redeploy (uncheck cache)');
    } else if (error.response?.status === 500) {
      console.log('\n🔍 DIAGNOSIS:');
      console.log('The endpoint exists but has a server error.');
      console.log('Likely MongoDB connection issue.');
      console.log('\n💡 SOLUTION:');
      console.log('1. Check environment variables in Vercel');
      console.log('2. Make sure MONGODB_URI is set correctly');
    } else {
      console.log('\nResponse data:', error.response?.data);
    }
  }
}

testCartAdd();
