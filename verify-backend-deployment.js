const axios = require('axios');

async function verifyBackendDeployment() {
  console.log('🔍 Backend Deployment Verification');
  console.log('==================================\n');

  // Get the backend URL from user input
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter your backend Vercel URL (e.g., https://anne-backend-xyz.vercel.app): ', async (backendUrl) => {
    try {
      console.log(`\n🧪 Testing backend at: ${backendUrl}`);
      
      // Test root endpoint
      console.log('1. Testing root endpoint...');
      const rootResponse = await axios.get(backendUrl);
      console.log('✅ Root endpoint working:', rootResponse.data.message);
      
      // Test health endpoint
      console.log('2. Testing health endpoint...');
      const healthResponse = await axios.get(`${backendUrl}/api/health/db`);
      console.log('✅ Health endpoint working:', healthResponse.data);
      
      // Test cart endpoint (should create empty cart)
      console.log('3. Testing cart endpoint...');
      const cartResponse = await axios.get(`${backendUrl}/api/cart/test-user`);
      console.log('✅ Cart endpoint working:', cartResponse.data);
      
      console.log('\n🎉 SUCCESS: Backend is deployed and working!');
      console.log('\n📝 Next steps:');
      console.log(`1. Update Frontend/.env.production with: REACT_APP_API_URL=${backendUrl}`);
      console.log('2. Commit and push changes');
      console.log('3. Frontend will auto-redeploy and connect to backend');
      
    } catch (error) {
      console.log('\n❌ ERROR: Backend deployment issue');
      console.log('Error:', error.response?.data || error.message);
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Make sure you deployed the Backend folder (not the whole project)');
      console.log('2. Check Vercel deployment logs');
      console.log('3. Verify the URL is correct');
    }
    
    rl.close();
  });
}

verifyBackendDeployment();
