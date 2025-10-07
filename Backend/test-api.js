const axios = require('axios');

async function testProductCreation() {
  try {
    console.log('🧪 Testing product creation API...');
    
    const testProduct = {
      title: "Test Product",
      price: 99.99,
      stock: 10,
      category: "Electronics",
      description: "A test product"
    };
    
    const response = await axios.post('http://localhost:5000/api/products', testProduct, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Product creation successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Product creation failed:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

testProductCreation();
