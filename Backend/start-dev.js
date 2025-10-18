// Development startup script to ensure backend runs locally
console.log('🔧 Starting backend in development mode...\n');

// Force development environment
process.env.NODE_ENV = 'development';
delete process.env.VERCEL;

console.log('Environment variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- VERCEL:', process.env.VERCEL || 'undefined');
console.log('- PORT:', process.env.PORT || '5000');
console.log('');

// Start the server
require('./index.js');
