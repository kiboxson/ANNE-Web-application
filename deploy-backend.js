#!/usr/bin/env node

/**
 * Backend Deployment Helper Script
 * This script helps deploy the backend to Vercel
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 ANNE Backend Deployment Helper');
console.log('=====================================\n');

// Check if we're in the right directory
const backendPath = path.join(__dirname, 'Backend');
if (!fs.existsSync(backendPath)) {
  console.error('❌ Backend directory not found!');
  console.log('Make sure you run this from the project root directory.');
  process.exit(1);
}

// Check if vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'ignore' });
  console.log('✅ Vercel CLI is installed');
} catch (error) {
  console.log('📦 Installing Vercel CLI...');
  try {
    execSync('npm install -g vercel', { stdio: 'inherit' });
    console.log('✅ Vercel CLI installed successfully');
  } catch (installError) {
    console.error('❌ Failed to install Vercel CLI');
    console.log('Please install manually: npm install -g vercel');
    process.exit(1);
  }
}

console.log('\n🔧 Deployment Instructions:');
console.log('1. Run: cd Backend');
console.log('2. Run: vercel --prod');
console.log('3. Follow the prompts:');
console.log('   - Set up and deploy? Y');
console.log('   - Which scope? Select your account');
console.log('   - Link to existing project? N');
console.log('   - Project name? anne-backend');
console.log('   - In which directory is your code located? ./');
console.log('\n4. After deployment, copy the URL and update Frontend/.env.production');
console.log('\n📋 Alternative: Use Vercel Dashboard');
console.log('   - Go to https://vercel.com/dashboard');
console.log('   - Click "New Project"');
console.log('   - Import your repository');
console.log('   - Set Root Directory to "Backend"');
console.log('   - Deploy');

console.log('\n🎯 Next Steps After Backend Deployment:');
console.log('1. Copy the backend URL (e.g., https://anne-backend-xyz.vercel.app)');
console.log('2. Update Frontend/.env.production with the backend URL');
console.log('3. Commit and push changes');
console.log('4. Redeploy frontend');

console.log('\n✨ Ready to deploy! Choose your preferred method above.');
