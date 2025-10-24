// Debug current cart error after Vercel configuration fix
const axios = require('axios');

async function debugCurrentError() {
  console.log('🔍 DEBUGGING CURRENT CART ERROR...\n');
  
  // Test 1: Check main backend version
  try {
    console.log('📍 Testing main backend...');
    const mainResponse = await axios.get('https://anne-web-application.vercel.app/');
    console.log('Main Backend Version:', mainResponse.data.version);
    console.log('Cart endpoints listed:', mainResponse.data.endpoints?.cartAdd ? 'YES' : 'NO');
    
    if (mainResponse.data.version === '1.0.3') {
      console.log('✅ Main backend is updated!\n');
      
      // Test cart endpoint
      try {
        console.log('📍 Testing main backend cart...');
        const cartTest = await axios.post('https://anne-web-application.vercel.app/api/cart/add', {
          userId: 'debug-test',
          product: { id: '1', title: 'Debug Test', price: 10 },
          quantity: 1
        });
        console.log('✅ Main backend cart WORKS!');
        console.log('✅ You can switch back to main backend\n');
        
        console.log('🔧 TO FIX: Update CartContext.js line 10 back to:');
        console.log('const CART_API_BASE = API_BASE_URL_EXPORT;');
        
      } catch (cartError) {
        console.log('❌ Main backend cart failed:', cartError.response?.status, cartError.message);
        console.log('Keep using emergency cart API for now\n');
      }
      
    } else {
      console.log('❌ Main backend still old version\n');
    }
    
  } catch (error) {
    console.log('❌ Main backend error:', error.message);
  }
  
  // Test 2: Check emergency cart API
  try {
    console.log('📍 Testing emergency cart API...');
    const emergencyTest = await axios.post('https://anne-cart-emergency.vercel.app/api/cart', {
      userId: 'debug-emergency',
      product: { id: '1', title: 'Emergency Test', price: 10 },
      quantity: 1
    });
    console.log('✅ Emergency cart API works!');
    console.log('✅ Your app should be using this now\n');
    
  } catch (emergencyError) {
    console.log('❌ Emergency cart API failed:', emergencyError.response?.status, emergencyError.message);
    console.log('Need to create working cart API\n');
  }
  
  // Test 3: Check what frontend is actually using
  console.log('📍 Current frontend configuration:');
  console.log('Frontend should be using: https://anne-cart-emergency.vercel.app');
  console.log('Check CartContext.js line 10 to confirm\n');
  
  console.log('🎯 SUMMARY:');
  console.log('1. If main backend is version 1.0.3 and cart works: Switch back to main');
  console.log('2. If main backend still fails: Keep using emergency API');
  console.log('3. If emergency API fails: Create new working cart API');
  console.log('4. Hard refresh your app after any changes: Ctrl + Shift + R');
}

debugCurrentError();
