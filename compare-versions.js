// Compare Local vs Vercel versions
const axios = require('axios');

async function compareVersions() {
  console.log('🔍 COMPARING LOCAL vs VERCEL VERSIONS\n');
  
  // Test Local
  try {
    console.log('📍 TESTING LOCAL (localhost:5000)');
    const localResponse = await axios.get('http://localhost:5000/');
    console.log('✅ Local Version:', localResponse.data.version);
    console.log('✅ Local Cart Endpoint:', localResponse.data.endpoints?.cartAdd || 'Not listed');
    console.log('✅ Local MongoDB:', localResponse.data.mongoStatus);
  } catch (error) {
    console.log('❌ Local server not running');
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test Vercel
  try {
    console.log('📍 TESTING VERCEL (anne-web-application.vercel.app)');
    const vercelResponse = await axios.get('https://anne-web-application.vercel.app/');
    console.log('❌ Vercel Version:', vercelResponse.data.version);
    console.log('❌ Vercel Cart Endpoint:', vercelResponse.data.endpoints?.cartAdd || 'Not listed');
    console.log('✅ Vercel MongoDB:', vercelResponse.data.mongoStatus);
  } catch (error) {
    console.log('❌ Vercel error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test Cart Endpoints
  console.log('🛒 TESTING CART ENDPOINTS\n');
  
  // Local Cart
  try {
    console.log('📍 LOCAL CART TEST');
    const localCart = await axios.post('http://localhost:5000/api/cart/add', {
      userId: 'test-local',
      product: { id: '1', title: 'Test', price: 50 },
      quantity: 1
    });
    console.log('✅ Local Cart:', localCart.data.success ? 'WORKS' : 'FAILED');
  } catch (error) {
    console.log('❌ Local Cart: FAILED -', error.response?.status || error.message);
  }
  
  // Vercel Cart
  try {
    console.log('📍 VERCEL CART TEST');
    const vercelCart = await axios.post('https://anne-web-application.vercel.app/api/cart/add', {
      userId: 'test-vercel',
      product: { id: '1', title: 'Test', price: 50 },
      quantity: 1
    });
    console.log('✅ Vercel Cart:', vercelCart.data.success ? 'WORKS' : 'FAILED');
  } catch (error) {
    console.log('❌ Vercel Cart: FAILED -', error.response?.status || error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  console.log('📊 SUMMARY:');
  console.log('- Local server has latest code with cart routes');
  console.log('- Vercel has old code without cart routes');
  console.log('- This is why cart works locally but fails on Vercel');
  console.log('- Solution: Fix Vercel deployment configuration');
}

compareVersions();
