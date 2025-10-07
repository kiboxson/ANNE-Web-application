#!/usr/bin/env node

/**
 * ANNE Web Application - Connection Checker
 * Tests if frontend can connect to backend
 */

const https = require('https');
const http = require('http');

console.log('🔗 ANNE Web Application - Connection Test');
console.log('=========================================\n');

// Your current configuration
const CURRENT_BACKEND_URL = 'https://web-application-ecru-eight.vercel.app';

async function testUrl(url, description) {
    return new Promise((resolve) => {
        console.log(`🧪 Testing ${description}: ${url}`);
        
        const client = url.startsWith('https') ? https : http;
        const req = client.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    // Try to parse as JSON
                    const json = JSON.parse(data);
                    
                    if (json.message && json.message.includes('Backend API')) {
                        console.log(`✅ SUCCESS: Backend API found!`);
                        console.log(`   Message: ${json.message}`);
                        console.log(`   Status: ${res.statusCode}`);
                        resolve({ success: true, type: 'backend', data: json, status: res.statusCode });
                    } else if (json.message) {
                        console.log(`⚠️  WARNING: API responds but might not be your backend`);
                        console.log(`   Message: ${json.message}`);
                        resolve({ success: false, type: 'api', data: json, status: res.statusCode });
                    } else {
                        console.log(`❓ UNKNOWN: Returns JSON but unclear type`);
                        resolve({ success: false, type: 'unknown', data: json, status: res.statusCode });
                    }
                } catch (e) {
                    // Not JSON, probably HTML (frontend)
                    if (data.includes('<!DOCTYPE html') || data.includes('<html')) {
                        console.log(`🌐 FRONTEND: This URL serves HTML (React app)`);
                        console.log(`   Status: ${res.statusCode}`);
                        resolve({ success: false, type: 'frontend', status: res.statusCode });
                    } else {
                        console.log(`❌ ERROR: Invalid response format`);
                        resolve({ success: false, type: 'invalid', status: res.statusCode });
                    }
                }
            });
        });

        req.on('error', (err) => {
            console.log(`❌ ERROR: ${err.message}`);
            resolve({ success: false, type: 'error', error: err.message });
        });

        req.setTimeout(10000, () => {
            req.destroy();
            console.log(`⏱️  TIMEOUT: Request timed out`);
            resolve({ success: false, type: 'timeout' });
        });
    });
}

async function testEndpoint(baseUrl, endpoint) {
    const url = baseUrl + endpoint;
    return new Promise((resolve) => {
        const client = url.startsWith('https') ? https : http;
        const req = client.get(url, (res) => {
            if (res.statusCode === 200) {
                resolve({ success: true, status: res.statusCode });
            } else {
                resolve({ success: false, status: res.statusCode });
            }
        });

        req.on('error', () => resolve({ success: false, status: 0 }));
        req.setTimeout(5000, () => {
            req.destroy();
            resolve({ success: false, status: 0 });
        });
    });
}

async function main() {
    // Test current configuration
    console.log('📋 STEP 1: Testing Current Configuration');
    console.log('======================================');
    const currentResult = await testUrl(CURRENT_BACKEND_URL, 'Current Backend URL');
    
    if (currentResult.success) {
        console.log('\n🎉 SUCCESS: Your current configuration is working!');
        console.log('Your frontend should be able to connect to the backend.');
        
        // Test key endpoints
        console.log('\n📋 STEP 2: Testing Key API Endpoints');
        console.log('===================================');
        const endpoints = ['/api/products', '/api/flash-products', '/api/orders', '/api/users'];
        
        for (const endpoint of endpoints) {
            const result = await testEndpoint(CURRENT_BACKEND_URL, endpoint);
            const status = result.success ? '✅' : '❌';
            console.log(`${status} ${endpoint}: ${result.status}`);
        }
        
        return;
    }

    if (currentResult.type === 'frontend') {
        console.log('\n❌ PROBLEM IDENTIFIED: Wrong URL in Configuration');
        console.log('================================================');
        console.log('Your .env.production file is pointing to your FRONTEND URL, not backend!');
        console.log(`Current URL: ${CURRENT_BACKEND_URL} (This is your React app)`);
        console.log('\nYou need to find your actual backend URL.');
    }

    // Search for backend
    console.log('\n📋 STEP 2: Searching for Backend URL');
    console.log('==================================');
    
    const possibleBackendUrls = [
        'https://anne-web-application-backend.vercel.app',
        'https://web-application-backend.vercel.app',
        'https://anne-backend.vercel.app',
        'https://kiboxson-anne-backend.vercel.app',
        'https://backend-anne.vercel.app',
        'https://web-application-ecru-eight-backend.vercel.app'
    ];

    let foundBackend = null;

    for (const url of possibleBackendUrls) {
        const result = await testUrl(url, 'Possible Backend');
        if (result.success) {
            foundBackend = url;
            break;
        }
    }

    console.log('\n📋 FINAL RESULTS');
    console.log('===============');

    if (foundBackend) {
        console.log(`✅ BACKEND FOUND: ${foundBackend}`);
        console.log('\n🔧 TO FIX THE CONNECTION:');
        console.log('1. Update Frontend/.env.production:');
        console.log(`   REACT_APP_API_URL=${foundBackend}`);
        console.log('2. Push changes: git add . && git commit -m "fix backend url" && git push');
        console.log('3. Redeploy your frontend on Vercel');
    } else {
        console.log('❌ NO BACKEND FOUND');
        console.log('\n🔧 POSSIBLE SOLUTIONS:');
        console.log('1. Check your Vercel dashboard for backend deployment');
        console.log('2. Make sure your backend is deployed separately');
        console.log('3. Verify backend deployment is successful');
        console.log('4. Check if backend URL is different from common patterns');
    }

    console.log('\n💡 NEED HELP?');
    console.log('- Open connection-test.html in browser for interactive testing');
    console.log('- Check your Vercel dashboard for exact deployment URLs');
    console.log('- Make sure you have TWO separate deployments (frontend + backend)');
}

main().catch(console.error);
