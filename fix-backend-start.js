const { spawn } = require('child_process');
const path = require('path');

console.log('🔧 Fixing backend startup issue...\n');

console.log('Problem: Backend is running in production mode');
console.log('Solution: Starting backend with correct development environment\n');

// Set environment variables and start backend
const backendPath = path.join(__dirname, 'Backend');

console.log('📍 Backend directory:', backendPath);
console.log('🚀 Starting backend in development mode...\n');

// Start backend with development environment
const backend = spawn('npm', ['run', 'dev'], {
  cwd: backendPath,
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'development',
    VERCEL: undefined
  }
});

backend.on('error', (error) => {
  console.error('❌ Failed to start backend:', error.message);
  console.log('\n🔧 Manual fix:');
  console.log('1. cd Backend');
  console.log('2. npm run dev');
});

backend.on('close', (code) => {
  console.log(`\n🔌 Backend process exited with code ${code}`);
});

console.log('💡 Keep this terminal open while using the frontend');
console.log('💡 Press Ctrl+C to stop the backend server');
