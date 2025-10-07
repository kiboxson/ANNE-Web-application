#!/usr/bin/env node

/**
 * ANNE Web Application - Deployment Checker
 * This script helps you identify your correct backend and frontend URLs
 */

const https = require('https');
const http = require('http');

console.log('🔍 ANNE Web Application - Deployment Checker');
console.log('==============================================\n');

// Common URL patterns based on your repository name
const possibleUrls = [
    'https://web-application-ecru-eight.vercel.app',
    'https://anne-web-application.vercel.app',
    'https://anne-web-application-backend.vercel.app',
    'https://anne-web-application-frontend.vercel.app',
    'https://kiboxson-anne-backend.vercel.app',
    'https://kiboxson-anne-frontend.vercel.app',
    'https://backend-anne.vercel.app',
    'https://frontend-anne.vercel.app'
];

async function checkUrl(url) {
    return new Promise((resolve) => {
        const client = url.startsWith('https') ? https : http;
        
        const req = client.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    // Check if it's a backend API response
                    if (json.message && json.message.includes('Backend API')) {
                        resolve({ type: 'backend', status: res.statusCode, data: json });
                    } else if (json.message) {
                        resolve({ type: 'api', status: res.statusCode, data: json });
                    } else {
                        resolve({ type: 'unknown', status: res.statusCode, data: json });
                    }
                } catch (e) {
                    // If it's not JSON, it might be HTML (frontend)
                    if (data.includes('<html') || data.includes('<!DOCTYPE')) {
                        resolve({ type: 'frontend', status: res.statusCode, data: 'HTML page' });
                    } else {
                        resolve({ type: 'unknown', status: res.statusCode, data: data.substring(0, 200) });
                    }
                }
            });
        });

        req.on('error', (err) => {
            resolve({ type: 'error', status: 0, data: err.message });
        });

        req.setTimeout(10000, () => {
            req.destroy();
            resolve({ type: 'timeout', status: 0, data: 'Request timeout' });
        });
    });
}

async function checkAllUrls() {
    console.log('🔍 Checking possible deployment URLs...\n');
    
    let backendUrl = null;
    let frontendUrl = null;

    for (const url of possibleUrls) {
        console.log(`Testing: ${url}`);
        const result = await checkUrl(url);
        
        if (result.type === 'backend') {
            console.log(`✅ BACKEND FOUND: ${url}`);
            console.log(`   Response: ${result.data.message}\n`);
            backendUrl = url;
        } else if (result.type === 'frontend') {
            console.log(`🌐 Frontend found: ${url}\n`);
            frontendUrl = url;
        } else if (result.type === 'api') {
            console.log(`🔧 API endpoint: ${url}`);
            console.log(`   Response: ${result.data.message}\n`);
        } else if (result.type === 'error') {
            console.log(`❌ Not accessible: ${result.data}\n`);
        } else {
            console.log(`❓ Unknown response type\n`);
        }
    }

    return { backendUrl, frontendUrl };
}

async function main() {
    const { backendUrl, frontendUrl } = await checkAllUrls();
    
    console.log('📋 SUMMARY:');
    console.log('===========');
    
    if (backendUrl) {
        console.log(`✅ Backend URL: ${backendUrl}`);
        console.log(`\n🔧 Action Required:`);
        console.log(`   1. Update Frontend/.env.production with:`);
        console.log(`      REACT_APP_API_URL=${backendUrl}`);
        console.log(`   2. Push changes and redeploy frontend`);
    } else {
        console.log(`❌ Backend not found!`);
        console.log(`\n🔧 Action Required:`);
        console.log(`   1. Deploy your Backend folder to Vercel`);
        console.log(`   2. Make sure the backend deployment is successful`);
        console.log(`   3. Then update the frontend configuration`);
    }
    
    if (frontendUrl) {
        console.log(`\n🌐 Frontend URL: ${frontendUrl}`);
    }
    
    if (!backendUrl) {
        console.log(`\n💡 To deploy your backend:`);
        console.log(`   1. Go to Vercel dashboard`);
        console.log(`   2. Import your GitHub repository`);
        console.log(`   3. Set the root directory to "Backend"`);
        console.log(`   4. Deploy the backend first`);
    }
}

main().catch(console.error);
