// Test if Vercel cart fix worked
const axios = require('axios');

async function testCartFix() {
  console.log('🧪 TESTING VERCEL CART FIX...\n');
  
  try {
    // Test 1: Check version
    console.log('📍 Step 1: Checking Vercel version...');
    const versionResponse = await axios.get('https://anne-web-application.vercel.app/');
    console.log('Version:', versionResponse.data.version);
    
    if (versionResponse.data.version === '1.0.3') {
      console.log('✅ SUCCESS! Vercel is now running updated code\n');
    } else {
      console.log('❌ FAILED! Vercel still running old code\n');
      return;
    }
    
    // Test 2: Test cart endpoint
    console.log('📍 Step 2: Testing cart endpoint...');
    const cartResponse = await axios.post('https://anne-web-application.vercel.app/api/cart/add', {
      userId: 'test-fix-' + Date.now(),
      product: {
        id: 'test-1',
        title: 'Test Product',
        price: 50,
        image: 'test.jpg'
      },
      quantity: 1
    });
    
    if (cartResponse.data.success) {
      console.log('✅ SUCCESS! Cart endpoint is working!');
      console.log('✅ Your cart error is FIXED! 🎉\n');
      
      console.log('🎯 NEXT STEPS:');
      console.log('1. Hard refresh your app: Ctrl + Shift + R');
      console.log('2. Try "Add to Cart" again');
      console.log('3. Should work perfectly now! ✅');
    } else {
      console.log('❌ Cart endpoint exists but returned error');
    }
    
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('❌ STILL 404! Cart routes not deployed yet.');
      console.log('\n🔧 YOU NEED TO:');
      console.log('1. Go to https://vercel.com/dashboard');
      console.log('2. Settings → General → Root Directory → Set to "Backend"');
      console.log('3. Deployments → Redeploy (uncheck cache)');
      console.log('4. Wait 2-3 minutes and run this test again');
    } else {
      console.log('❌ Other error:', error.message);
    }
  }
}

testCartFix();
