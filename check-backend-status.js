const http = require('http');

function checkBackend() {
  console.log('🔍 Checking if backend is running on localhost:5000...\n');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/',
    method: 'GET',
    timeout: 3000
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('✅ Backend is running!');
      console.log('Status:', res.statusCode);
      try {
        const response = JSON.parse(data);
        console.log('Message:', response.message);
        console.log('Available endpoints:', Object.keys(response.endpoints || {}));
        
        // Test cart endpoint specifically
        testCartEndpoint();
      } catch (e) {
        console.log('Response:', data.substring(0, 200));
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Backend is NOT running on localhost:5000');
    console.error('Error:', err.message);
    console.log('\n🔧 To fix:');
    console.log('1. Open terminal in Backend folder');
    console.log('2. Run: npm start');
    console.log('3. Wait for "✅ Backend running on http://localhost:5000"');
  });

  req.on('timeout', () => {
    console.error('❌ Backend connection timeout');
    req.destroy();
  });

  req.end();
}

function testCartEndpoint() {
  console.log('\n🛒 Testing cart endpoint...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/cart/test-user',
    method: 'GET',
    timeout: 3000
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ Cart API is working!');
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
        console.log('\n🎉 Backend is ready for frontend connection!');
      } else {
        console.log('⚠️ Cart API returned status:', res.statusCode);
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Cart API error:', err.message);
  });

  req.end();
}

checkBackend();
