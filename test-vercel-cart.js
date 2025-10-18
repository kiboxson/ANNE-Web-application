// Test script to diagnose Vercel cart API issues
const https = require('https');
const http = require('http');

const VERCEL_URL = 'https://anne-web-application.vercel.app';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testVercelCart() {
  console.log('🧪 Testing Vercel Cart API Deployment...\n');
  
  try {
    // Test 1: Root endpoint
    console.log('📋 Test 1: Root endpoint');
    const rootResponse = await makeRequest(VERCEL_URL);
    console.log(`Status: ${rootResponse.status}`);
    if (rootResponse.status === 200) {
      console.log('✅ Root endpoint working');
      try {
        const rootData = JSON.parse(rootResponse.data);
        console.log('Available endpoints:', Object.keys(rootData.endpoints || {}));
      } catch (e) {
        console.log('Response:', rootResponse.data.substring(0, 200));
      }
    } else {
      console.log('❌ Root endpoint failed');
      console.log('Response:', rootResponse.data.substring(0, 200));
    }
    console.log('');

    // Test 2: Cart GET endpoint
    console.log('🛒 Test 2: GET Cart endpoint');
    const cartUrl = `${VERCEL_URL}/api/cart/test-user`;
    console.log('URL:', cartUrl);
    
    const cartResponse = await makeRequest(cartUrl);
    console.log(`Status: ${cartResponse.status}`);
    
    if (cartResponse.status === 200) {
      console.log('✅ GET cart endpoint working');
      console.log('Response:', cartResponse.data);
    } else {
      console.log('❌ GET cart endpoint failed');
      console.log('Response:', cartResponse.data);
    }
    console.log('');

    // Test 3: Cart POST endpoint
    console.log('🛒 Test 3: POST Add to cart endpoint');
    const addUrl = `${VERCEL_URL}/api/cart/test-user/add`;
    console.log('URL:', addUrl);
    
    const postData = JSON.stringify({
      product: {
        id: 'test-product-001',
        title: 'Test Product',
        price: 29.99,
        image: 'https://example.com/test.jpg'
      },
      quantity: 1
    });
    
    const addResponse = await makeRequest(addUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      body: postData
    });
    
    console.log(`Status: ${addResponse.status}`);
    
    if (addResponse.status === 200) {
      console.log('✅ POST add to cart endpoint working');
      console.log('Response:', addResponse.data);
    } else {
      console.log('❌ POST add to cart endpoint failed');
      console.log('Response:', addResponse.data);
    }
    console.log('');

    // Test 4: Check if it's a routing issue
    console.log('🔍 Test 4: Testing various cart routes');
    const testRoutes = [
      '/api/cart',
      '/api/cart/',
      '/api/cart/test',
      '/cart/test',
      '/cart',
    ];
    
    for (const route of testRoutes) {
      try {
        const testUrl = `${VERCEL_URL}${route}`;
        const response = await makeRequest(testUrl);
        console.log(`${route}: Status ${response.status}`);
      } catch (error) {
        console.log(`${route}: Error - ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

console.log('🚀 Starting Vercel Cart API Diagnosis...');
testVercelCart();
