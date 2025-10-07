#!/usr/bin/env node

/**
 * ANNE Web Application - Connection Diagnostics
 * Comprehensive tool to diagnose frontend-backend connection issues
 */

const https = require('https');
const http = require('http');

console.log('🔍 ANNE Web Application - Connection Diagnostics');
console.log('================================================\n');

// Your current URLs (update these with your actual URLs)
const FRONTEND_URL = 'https://anne-web-application-zs5b.vercel.app';
const CURRENT_BACKEND_URL = 'https://web-application-ecru-eight.vercel.app';

// Possible backend URLs to test
const POSSIBLE_BACKEND_URLS = [
    'https://web-application-ecru-eight.vercel.app',
    'https://anne-web-application-backend.vercel.app',
    'https://web-application-backend.vercel.app',
    'https://anne-backend.vercel.app',
    'https://kiboxson-anne-backend.vercel.app',
    'https://backend-anne.vercel.app',
    'https://anne-api.vercel.app'
];

async function testUrl(url, timeout = 10000) {
    return new Promise((resolve) => {
        console.log(`🧪 Testing: ${url}`);
        
        const client = url.startsWith('https') ? https : http;
        const req = client.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    
                    // Check if it's our backend API
                    if (json.message && (json.message.includes('Backend API') || json.message.includes('ANNE'))) {
                        console.log(`✅ BACKEND FOUND: ${url}`);
                        console.log(`   Status: ${res.statusCode}`);
                        console.log(`   Message: ${json.message}`);
                        resolve({ 
                            success: true, 
                            type: 'backend', 
                            url: url,
                            status: res.statusCode,
                            data: json 
                        });
                    } else if (json.message) {
                        console.log(`🔧 API Found: ${url}`);
                        console.log(`   Status: ${res.statusCode}`);
                        console.log(`   Message: ${json.message}`);
                        resolve({ 
                            success: false, 
                            type: 'api', 
                            url: url,
                            status: res.statusCode,
                            data: json 
                        });
                    } else {
                        console.log(`❓ Unknown JSON: ${url}`);
                        resolve({ 
                            success: false, 
                            type: 'unknown_json', 
                            url: url,
                            status: res.statusCode 
                        });
                    }
                } catch (e) {
                    // Not JSON, check if HTML (frontend)
                    if (data.includes('<!DOCTYPE html') || data.includes('<html')) {
                        console.log(`🌐 Frontend App: ${url}`);
                        console.log(`   Status: ${res.statusCode}`);
                        resolve({ 
                            success: false, 
                            type: 'frontend', 
                            url: url,
                            status: res.statusCode 
                        });
                    } else {
                        console.log(`❌ Invalid Response: ${url}`);
                        console.log(`   Status: ${res.statusCode}`);
                        console.log(`   Data: ${data.substring(0, 100)}...`);
                        resolve({ 
                            success: false, 
                            type: 'invalid', 
                            url: url,
                            status: res.statusCode 
                        });
                    }
                }
            });
        });

        req.on('error', (err) => {
            console.log(`❌ Connection Error: ${url}`);
            console.log(`   Error: ${err.message}`);
            resolve({ 
                success: false, 
                type: 'error', 
                url: url,
                error: err.message 
            });
        });

        req.setTimeout(timeout, () => {
            req.destroy();
            console.log(`⏱️  Timeout: ${url}`);
            resolve({ 
                success: false, 
                type: 'timeout', 
                url: url 
            });
        });
    });
}

async function testApiEndpoints(baseUrl) {
    console.log(`\n🔍 Testing API endpoints for: ${baseUrl}`);
    console.log('=' .repeat(50));
    
    const endpoints = [
        { path: '/', name: 'Root' },
        { path: '/api/products', name: 'Products' },
        { path: '/api/flash-products', name: 'Flash Products' },
        { path: '/api/orders', name: 'Orders' },
        { path: '/api/users', name: 'Users' },
        { path: '/api/health/db', name: 'Health Check' }
    ];

    let workingEndpoints = 0;
    
    for (const endpoint of endpoints) {
        const url = baseUrl + endpoint.path;
        try {
            const result = await new Promise((resolve) => {
                const client = url.startsWith('https') ? https : http;
                const req = client.get(url, (res) => {
                    resolve({ status: res.statusCode, success: res.statusCode < 400 });
                });
                req.on('error', () => resolve({ status: 0, success: false }));
                req.setTimeout(5000, () => {
                    req.destroy();
                    resolve({ status: 0, success: false });
                });
            });
            
            if (result.success) {
                console.log(`✅ ${endpoint.name}: ${result.status}`);
                workingEndpoints++;
            } else {
                console.log(`❌ ${endpoint.name}: ${result.status || 'Failed'}`);
            }
        } catch (error) {
            console.log(`❌ ${endpoint.name}: Error`);
        }
    }
    
    console.log(`\n📊 Summary: ${workingEndpoints}/${endpoints.length} endpoints working`);
    return workingEndpoints;
}

async function checkCurrentConfiguration() {
    console.log('📋 STEP 1: Checking Current Configuration');
    console.log('=========================================');
    
    console.log(`Frontend URL: ${FRONTEND_URL}`);
    console.log(`Backend URL (from config): ${CURRENT_BACKEND_URL}\n`);
    
    // Test current backend URL
    const currentResult = await testUrl(CURRENT_BACKEND_URL);
    
    if (currentResult.success) {
        console.log('\n🎉 Current configuration is working!');
        await testApiEndpoints(CURRENT_BACKEND_URL);
        return { backendUrl: CURRENT_BACKEND_URL, working: true };
    } else {
        console.log(`\n❌ Current backend URL is not working`);
        console.log(`   Type: ${currentResult.type}`);
        return { backendUrl: null, working: false };
    }
}

async function searchForBackend() {
    console.log('\n📋 STEP 2: Searching for Backend Deployment');
    console.log('===========================================');
    
    let foundBackend = null;
    
    for (const url of POSSIBLE_BACKEND_URLS) {
        const result = await testUrl(url);
        
        if (result.success) {
            foundBackend = url;
            console.log(`\n🎯 Testing API endpoints for found backend...`);
            const workingEndpoints = await testApiEndpoints(url);
            
            if (workingEndpoints > 0) {
                console.log(`✅ Backend is functional with ${workingEndpoints} working endpoints`);
                break;
            }
        }
        
        console.log(''); // Add spacing between tests
    }
    
    return foundBackend;
}

async function generateSolution(backendUrl) {
    console.log('\n📋 STEP 3: Solution Generation');
    console.log('==============================');
    
    if (backendUrl) {
        console.log(`✅ Backend found at: ${backendUrl}`);
        console.log('\n🔧 To fix the connection:');
        console.log('\n1. Update Frontend/.env.production:');
        console.log(`   REACT_APP_API_URL=${backendUrl}`);
        console.log('\n2. Push changes:');
        console.log('   git add .');
        console.log('   git commit -m "fix backend URL"');
        console.log('   git push origin main');
        console.log('\n3. Redeploy frontend on Vercel');
        console.log('\n4. Test connection');
        
        // Generate the fix command
        console.log(`\n💡 Quick fix command:`);
        console.log(`   node connect-apps.js ${backendUrl}`);
        
    } else {
        console.log('❌ No working backend found');
        console.log('\n🔧 Possible solutions:');
        console.log('\n1. Check your Vercel dashboard for backend deployment');
        console.log('2. Make sure backend is deployed with correct settings:');
        console.log('   - Root Directory: Backend');
        console.log('   - Framework: Node.js');
        console.log('   - Environment variables configured');
        console.log('\n3. If backend is not deployed, deploy it:');
        console.log('   - Go to Vercel dashboard');
        console.log('   - New Project → Import repository');
        console.log('   - Set Root Directory to "Backend"');
        console.log('   - Add environment variables');
        console.log('   - Deploy');
    }
}

async function main() {
    try {
        // Step 1: Check current configuration
        const currentCheck = await checkCurrentConfiguration();
        
        if (currentCheck.working) {
            console.log('\n🎉 SUCCESS: Your configuration is already working!');
            console.log('If you\'re still having issues, check:');
            console.log('- Browser cache (try incognito mode)');
            console.log('- Frontend deployment status');
            console.log('- Network connectivity');
            return;
        }
        
        // Step 2: Search for backend
        const foundBackend = await searchForBackend();
        
        // Step 3: Generate solution
        await generateSolution(foundBackend);
        
        console.log('\n📞 Need more help?');
        console.log('- Check Vercel deployment logs');
        console.log('- Verify environment variables');
        console.log('- Test URLs manually in browser');
        
    } catch (error) {
        console.error('❌ Diagnostic failed:', error.message);
    }
}

main();
