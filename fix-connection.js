#!/usr/bin/env node

/**
 * ANNE Web Application - Connection Fix Script
 * This script helps you configure the correct URLs for your deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 ANNE Web Application - Connection Fix Script');
console.log('================================================\n');

// Get command line arguments
const args = process.argv.slice(2);
const backendUrl = args[0];

if (!backendUrl) {
    console.log('❌ Error: Please provide your backend URL as an argument');
    console.log('\n📋 Usage:');
    console.log('   node fix-connection.js https://your-backend-url.vercel.app');
    console.log('\n🔍 To find your backend URL:');
    console.log('   1. Go to your Vercel dashboard');
    console.log('   2. Find your backend deployment');
    console.log('   3. Copy the URL (should end with .vercel.app)');
    console.log('\n💡 Example:');
    console.log('   node fix-connection.js https://anne-backend-abc123.vercel.app');
    process.exit(1);
}

// Validate URL format
if (!backendUrl.startsWith('https://') || !backendUrl.includes('.vercel.app')) {
    console.log('⚠️  Warning: URL should start with https:// and contain .vercel.app');
    console.log('   Provided URL:', backendUrl);
    console.log('   Expected format: https://your-app-name.vercel.app');
}

// Remove trailing slash if present
const cleanBackendUrl = backendUrl.replace(/\/$/, '');

console.log('🎯 Configuring connection with backend URL:', cleanBackendUrl);

// Update .env.production file
const envProductionPath = path.join(__dirname, 'Frontend', '.env.production');
const envProductionContent = `# Production Environment Configuration for ANNE Web Application Frontend
# This file is used when deploying to Vercel or other production environments

# Backend API URL - Updated by fix-connection.js script
REACT_APP_API_URL=${cleanBackendUrl}

# Configuration completed on: ${new Date().toISOString()}
# Backend URL: ${cleanBackendUrl}
`;

try {
    fs.writeFileSync(envProductionPath, envProductionContent);
    console.log('✅ Updated Frontend/.env.production');
} catch (error) {
    console.log('❌ Error updating .env.production:', error.message);
    process.exit(1);
}

// Create a local .env.local for testing
const envLocalPath = path.join(__dirname, 'Frontend', '.env.local');
const envLocalContent = `# Local Development Environment
# This file is for local testing with production backend

# Use production backend for local testing (optional)
# REACT_APP_API_URL=${cleanBackendUrl}

# Use local backend for development (default)
REACT_APP_API_URL=http://localhost:5000
`;

try {
    if (!fs.existsSync(envLocalPath)) {
        fs.writeFileSync(envLocalPath, envLocalContent);
        console.log('✅ Created Frontend/.env.local');
    }
} catch (error) {
    console.log('⚠️  Warning: Could not create .env.local:', error.message);
}

console.log('\n🚀 Configuration Complete!');
console.log('\n📋 Next Steps:');
console.log('   1. Push changes to GitHub:');
console.log('      git add .');
console.log('      git commit -m "Fix frontend-backend connection"');
console.log('      git push origin main');
console.log('\n   2. Redeploy your frontend on Vercel');
console.log('\n   3. Test the connection using test-connection.html');

console.log('\n🔍 Verification:');
console.log('   - Backend URL:', cleanBackendUrl);
console.log('   - Frontend will use this URL in production');
console.log('   - CORS is configured to allow Vercel domains');

console.log('\n✨ Your applications should now connect properly!');
