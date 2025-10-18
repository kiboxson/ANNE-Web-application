const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up local development environment...\n');

// Create .env file for local development
const envContent = `# Development Environment Configuration
# This file is used when running the frontend locally with backend on localhost:5000

# Backend API URL - for local development
REACT_APP_API_URL=http://localhost:5000

# Environment
NODE_ENV=development
`;

const envPath = path.join(__dirname, '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file for local development');
  console.log('📍 Location:', envPath);
  console.log('🔗 API URL set to: http://localhost:5000');
  console.log('');
  console.log('🚀 Next steps:');
  console.log('1. Make sure your backend is running: npm start (in Backend folder)');
  console.log('2. Start your frontend: npm start (in Frontend folder)');
  console.log('3. Test add to cart functionality');
  console.log('');
  console.log('💡 Note: This .env file is for local development only.');
  console.log('   For production, the .env.production file will be used automatically.');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  console.log('');
  console.log('📝 Manual setup:');
  console.log('Create a file named ".env" in the Frontend folder with this content:');
  console.log('');
  console.log(envContent);
}
