#!/usr/bin/env node

/**
 * ANNE Web Application - Connect Frontend to Backend
 * Run this after deploying your backend to Vercel
 */

const fs = require('fs');
const path = require('path');

console.log('🔗 ANNE Web Application - Connect Apps');
console.log('=====================================\n');

const backendUrl = process.argv[2];

if (!backendUrl) {
    console.log('❌ Please provide your backend URL');
    console.log('\n📋 Usage:');
    console.log('   node connect-apps.js https://your-backend-url.vercel.app');
    console.log('\n🔍 To get your backend URL:');
    console.log('   1. Deploy backend to Vercel');
    console.log('   2. Copy the deployment URL from Vercel dashboard');
    console.log('   3. Run this script with that URL');
    process.exit(1);
}

// Validate URL
if (!backendUrl.startsWith('https://') || !backendUrl.includes('.vercel.app')) {
    console.log('⚠️  Warning: URL should be a Vercel deployment URL');
    console.log('   Format: https://your-backend-name.vercel.app');
}

const cleanUrl = backendUrl.replace(/\/$/, ''); // Remove trailing slash

console.log('🎯 Connecting frontend to backend:', cleanUrl);

// Update .env.production
const envProdPath = path.join(__dirname, 'Frontend', '.env.production');
const envProdContent = `# Production Environment Configuration for ANNE Web Application Frontend
# This file is used when deploying to Vercel or other production environments

# Backend API URL - Connected to deployed backend
REACT_APP_API_URL=${cleanUrl}

# Cloudinary for frontend image uploads
REACT_APP_CLOUDINARY_CLOUD_NAME=dgpocgkx3
REACT_APP_CLOUDINARY_UPLOAD_PRESET=products

# Environment
REACT_APP_ENVIRONMENT=production

# Last updated: ${new Date().toISOString()}
# Connected to backend: ${cleanUrl}
`;

try {
    fs.writeFileSync(envProdPath, envProdContent);
    console.log('✅ Updated Frontend/.env.production');
} catch (error) {
    console.log('❌ Error updating .env.production:', error.message);
    process.exit(1);
}

console.log('\n🚀 Connection Setup Complete!');
console.log('\n📋 Next Steps:');
console.log('1. git add .');
console.log('2. git commit -m "connect frontend to backend"');
console.log('3. git push origin main');
console.log('4. Redeploy frontend on Vercel');
console.log('\n✨ Your apps should now be connected!');

// Test the backend URL
console.log('\n🧪 Testing backend connection...');
const https = require('https');

https.get(cleanUrl, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.message && json.message.includes('Backend')) {
                console.log('✅ Backend is responding correctly!');
                console.log(`   Message: ${json.message}`);
            } else {
                console.log('⚠️  Backend responds but might not be your API');
            }
        } catch (e) {
            console.log('❌ Backend not responding with expected JSON');
        }
    });
}).on('error', (err) => {
    console.log('❌ Cannot connect to backend:', err.message);
    console.log('   Make sure backend is deployed and accessible');
});
