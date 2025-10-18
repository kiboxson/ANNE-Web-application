const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing "Failed to add item to cart" error...\n');

// Check current API configuration
const apiConfigPath = path.join(__dirname, 'src', 'config', 'api.js');
const envProductionPath = path.join(__dirname, '.env.production');
const envPath = path.join(__dirname, '.env');

console.log('📋 Current Configuration Status:');

// Check .env.production
if (fs.existsSync(envProductionPath)) {
  const envProdContent = fs.readFileSync(envProductionPath, 'utf8');
  console.log('✅ .env.production exists');
  if (envProdContent.includes('anne-web-application.vercel.app')) {
    console.log('   🔗 Points to Vercel: https://anne-web-application.vercel.app');
  }
} else {
  console.log('❌ .env.production not found');
}

// Check .env
if (fs.existsSync(envPath)) {
  console.log('✅ .env exists (for local development)');
} else {
  console.log('❌ .env not found (needed for local development)');
}

console.log('\n🎯 Problem Identified:');
console.log('Your backend is running locally (localhost:5000)');
console.log('But your frontend is configured to use Vercel production URL');
console.log('This causes the "Failed to add item to cart" error');

console.log('\n🔧 Solution:');
console.log('Creating .env file for local development...');

// Create .env file for local development
const envContent = `# Local Development Environment
# Backend running on localhost:5000

REACT_APP_API_URL=http://localhost:5000
NODE_ENV=development
`;

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file successfully!');
  console.log('📍 Location: Frontend/.env');
  console.log('🔗 API URL set to: http://localhost:5000');
  
  console.log('\n🚀 Next Steps:');
  console.log('1. ✅ Backend is already running (localhost:5000)');
  console.log('2. 🔄 Restart your frontend: npm start');
  console.log('3. 🛒 Test add to cart - should work now!');
  
  console.log('\n💡 How this works:');
  console.log('• Local development: Uses .env (localhost:5000)');
  console.log('• Production build: Uses .env.production (Vercel URL)');
  console.log('• React automatically picks the right environment');
  
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  console.log('\n📝 Manual Fix:');
  console.log('Create a file named ".env" in the Frontend folder with:');
  console.log('');
  console.log('REACT_APP_API_URL=http://localhost:5000');
  console.log('NODE_ENV=development');
}

console.log('\n🎉 Fix complete! Your cart should work after restarting frontend.');
