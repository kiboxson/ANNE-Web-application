const https = require('https');

const backendUrl = 'https://anne-web-application.vercel.app';

console.log('🧪 Testing Backend API Connection...');
console.log(`Backend URL: ${backendUrl}`);

// Test 1: Root endpoint
function testRoot() {
    return new Promise((resolve, reject) => {
        https.get(`${backendUrl}/`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    console.log('✅ Root endpoint working:', json.message);
                    resolve(true);
                } catch (e) {
                    console.log('❌ Root endpoint failed:', e.message);
                    resolve(false);
                }
            });
        }).on('error', (err) => {
            console.log('❌ Root endpoint error:', err.message);
            resolve(false);
        });
    });
}

// Test 2: Cart endpoint
function testCart() {
    return new Promise((resolve, reject) => {
        https.get(`${backendUrl}/api/cart/test-user`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    console.log('✅ Cart endpoint working:', json);
                    resolve(true);
                } catch (e) {
                    console.log('❌ Cart endpoint failed:', e.message);
                    console.log('Response:', data);
                    resolve(false);
                }
            });
        }).on('error', (err) => {
            console.log('❌ Cart endpoint error:', err.message);
            resolve(false);
        });
    });
}

// Test 3: Add to cart endpoint
function testAddToCart() {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            product: {
                id: 'test-product-1',
                title: 'Test Product',
                price: 29.99,
                image: 'test.jpg'
            },
            quantity: 1
        });

        const options = {
            hostname: 'anne-web-application.vercel.app',
            port: 443,
            path: '/api/cart/test-user/add',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    console.log('✅ Add to cart working:', json);
                    resolve(true);
                } catch (e) {
                    console.log('❌ Add to cart failed:', e.message);
                    console.log('Response:', data);
                    resolve(false);
                }
            });
        });

        req.on('error', (err) => {
            console.log('❌ Add to cart error:', err.message);
            resolve(false);
        });

        req.write(postData);
        req.end();
    });
}

async function runTests() {
    console.log('\n🧪 Running API Tests...\n');
    
    const rootTest = await testRoot();
    const cartTest = await testCart();
    const addTest = await testAddToCart();
    
    console.log('\n📋 Test Results:');
    console.log(`Root endpoint: ${rootTest ? '✅' : '❌'}`);
    console.log(`Cart endpoint: ${cartTest ? '✅' : '❌'}`);
    console.log(`Add to cart: ${addTest ? '✅' : '❌'}`);
    
    if (rootTest && cartTest && addTest) {
        console.log('\n🎉 All tests passed! Backend is working correctly.');
        console.log('The issue is likely in the frontend configuration.');
    } else {
        console.log('\n❌ Some tests failed. Backend needs attention.');
    }
}

runTests().catch(console.error);
