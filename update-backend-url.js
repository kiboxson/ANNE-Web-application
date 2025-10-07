#!/usr/bin/env node

/**
 * Quick script to update backend URL in production config
 * Usage: node update-backend-url.js https://your-backend-url.vercel.app
 */

const fs = require('fs');
const path = require('path');

const backendUrl = process.argv[2];

if (!backendUrl) {
    console.log('❌ Please provide your backend URL');
    console.log('Usage: node update-backend-url.js https://your-backend-url.vercel.app');
    process.exit(1);
}

// Remove trailing slash
const cleanUrl = backendUrl.replace(/\/$/, '');

// Update .env.production
const envPath = path.join(__dirname, 'Frontend', '.env.production');
const envContent = `# Production Environment Configuration for ANNE Web Application Frontend
# This file is used when deploying to Vercel or other production environments

# Backend API URL - Updated automatically
REACT_APP_API_URL=${cleanUrl}

# Last updated: ${new Date().toISOString()}
# Backend URL: ${cleanUrl}
`;

try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Updated Frontend/.env.production');
    console.log('🔗 Backend URL:', cleanUrl);
    console.log('\n📋 Next steps:');
    console.log('1. git add .');
    console.log('2. git commit -m "update backend URL"');
    console.log('3. git push origin main');
    console.log('4. Redeploy frontend on Vercel');
} catch (error) {
    console.log('❌ Error:', error.message);
}
