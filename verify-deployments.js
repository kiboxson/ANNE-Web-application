#!/usr/bin/env node

/**
 * Quick verification of your Vercel deployments
 */

const https = require('https');

console.log('🔍 ANNE Web Application - Deployment Verification');
console.log('=================================================\n');

// Your known URLs
const FRONTEND_URL = 'https://anne-web-application-zs5b.vercel.app';
const SUSPECTED_BACKEND = 'https://web-application-ecru-eight.vercel.app';

async function quickTest(url, name) {
    return new Promise((resolve) => {
        console.log(`Testing ${name}: ${url}`);
        
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (data.includes('<!DOCTYPE html')) {
                    console.log(`  → ${name} is a FRONTEND (React app)`);
                    resolve('frontend');
                } else {
                    try {
                        const json = JSON.parse(data);
                        if (json.message && json.message.includes('Backend')) {
                            console.log(`  → ${name} is a BACKEND API ✅`);
                            console.log(`     Message: ${json.message}`);
                            resolve('backend');
                        } else {
                            console.log(`  → ${name} returns JSON but unclear type`);
                            resolve('unknown');
                        }
                    } catch (e) {
                        console.log(`  → ${name} returns invalid response`);
                        resolve('invalid');
                    }
                }
            });
        }).on('error', (err) => {
            console.log(`  → ${name} failed: ${err.message}`);
            resolve('error');
        });
    });
}

async function main() {
    console.log('🧪 Quick Deployment Check\n');
    
    const frontendResult = await quickTest(FRONTEND_URL, 'Frontend URL');
    const backendResult = await quickTest(SUSPECTED_BACKEND, 'Suspected Backend');
    
    console.log('\n📊 RESULTS:');
    console.log('===========');
    
    if (frontendResult === 'frontend' && backendResult === 'backend') {
        console.log('✅ Both deployments found and correct!');
        console.log('\n🔧 Your issue might be:');
        console.log('1. Frontend .env.production has wrong backend URL');
        console.log('2. CORS configuration in backend');
        console.log('3. Environment variables missing in Vercel');
        
        console.log('\n💡 Quick fix:');
        console.log(`Update Frontend/.env.production:`);
        console.log(`REACT_APP_API_URL=${SUSPECTED_BACKEND}`);
        
    } else if (frontendResult === 'frontend' && backendResult === 'frontend') {
        console.log('❌ PROBLEM FOUND: Both URLs point to frontend!');
        console.log('\n🔧 Solution: You need to deploy your backend separately');
        console.log('1. Go to Vercel dashboard');
        console.log('2. New Project → Import your repo');
        console.log('3. Set Root Directory to "Backend"');
        console.log('4. Deploy backend');
        
    } else if (frontendResult === 'frontend' && backendResult === 'error') {
        console.log('❌ PROBLEM: Backend URL not accessible');
        console.log('\n🔧 Solution: Deploy your backend to Vercel');
        
    } else {
        console.log('❓ Unclear deployment status');
        console.log('\nRun full diagnostics:');
        console.log('node diagnose-connection.js');
    }
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Run: node diagnose-connection.js (for detailed analysis)');
    console.log('2. Check your Vercel dashboard');
    console.log('3. Verify you have TWO separate projects deployed');
}

main();
