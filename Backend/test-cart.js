const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const TEST_USER_ID = 'test-user-123';

async function testCartCollection() {
  console.log('🧪 Testing Cart Collection in MongoDB Atlas...\n');
  
  try {
    // Test 1: Get empty cart (should create new cart)
    console.log('📋 Test 1: Getting empty cart...');
    const emptyCartResponse = await axios.get(`${BASE_URL}/api/cart/${TEST_USER_ID}`);
    console.log('✅ Empty cart retrieved:', emptyCartResponse.data);
    console.log(`   Items count: ${emptyCartResponse.data.items.length}\n`);

    // Test 2: Add first product to cart
    console.log('🛒 Test 2: Adding first product to cart...');
    const product1 = {
      id: 'prod-001',
      title: 'Test Product 1',
      price: 29.99,
      image: 'https://example.com/image1.jpg'
    };
    
    const addResponse1 = await axios.post(`${BASE_URL}/api/cart/${TEST_USER_ID}/add`, {
      product: product1,
      quantity: 2
    });
    console.log('✅ Product 1 added:', addResponse1.data);
    console.log(`   Items count: ${addResponse1.data.items.length}\n`);

    // Test 3: Add second product to cart
    console.log('🛒 Test 3: Adding second product to cart...');
    const product2 = {
      id: 'prod-002',
      title: 'Test Product 2',
      price: 49.99,
      image: 'https://example.com/image2.jpg'
    };
    
    const addResponse2 = await axios.post(`${BASE_URL}/api/cart/${TEST_USER_ID}/add`, {
      product: product2,
      quantity: 1
    });
    console.log('✅ Product 2 added:', addResponse2.data);
    console.log(`   Items count: ${addResponse2.data.items.length}\n`);

    // Test 4: Add same product again (should update quantity)
    console.log('🔄 Test 4: Adding same product again (quantity update)...');
    const addResponse3 = await axios.post(`${BASE_URL}/api/cart/${TEST_USER_ID}/add`, {
      product: product1,
      quantity: 1
    });
    console.log('✅ Product 1 quantity updated:', addResponse3.data);
    const updatedItem = addResponse3.data.items.find(item => item.id === 'prod-001');
    console.log(`   Product 1 quantity: ${updatedItem.quantity}\n`);

    // Test 5: Update item quantity
    console.log('📝 Test 5: Updating item quantity...');
    const updateResponse = await axios.put(`${BASE_URL}/api/cart/${TEST_USER_ID}/item/prod-002`, {
      quantity: 3
    });
    console.log('✅ Item quantity updated:', updateResponse.data);
    const updatedItem2 = updateResponse.data.items.find(item => item.id === 'prod-002');
    console.log(`   Product 2 quantity: ${updatedItem2.quantity}\n`);

    // Test 6: Get cart with items
    console.log('📋 Test 6: Getting cart with items...');
    const cartResponse = await axios.get(`${BASE_URL}/api/cart/${TEST_USER_ID}`);
    console.log('✅ Cart retrieved:', cartResponse.data);
    console.log(`   Total items: ${cartResponse.data.items.length}`);
    console.log('   Cart items:', cartResponse.data.items.map(item => 
      `${item.title} (qty: ${item.quantity}, price: $${item.price})`
    ).join(', '));
    console.log('');

    // Test 7: Remove one item
    console.log('🗑️ Test 7: Removing one item...');
    const removeResponse = await axios.delete(`${BASE_URL}/api/cart/${TEST_USER_ID}/item/prod-001`);
    console.log('✅ Item removed:', removeResponse.data);
    console.log(`   Remaining items: ${removeResponse.data.items.length}\n`);

    // Test 8: Clear entire cart
    console.log('🧹 Test 8: Clearing entire cart...');
    const clearResponse = await axios.delete(`${BASE_URL}/api/cart/${TEST_USER_ID}`);
    console.log('✅ Cart cleared:', clearResponse.data);
    console.log(`   Items count: ${clearResponse.data.items.length}\n`);

    console.log('🎉 All cart collection tests passed successfully!');
    console.log('✅ Cart collection is working properly in MongoDB Atlas');
    
  } catch (error) {
    console.error('❌ Cart test failed:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

// Test different user carts
async function testMultipleUsers() {
  console.log('\n🧪 Testing Multiple User Carts...\n');
  
  try {
    const users = ['user-001', 'user-002', 'user-003'];
    
    for (const userId of users) {
      console.log(`👤 Testing cart for user: ${userId}`);
      
      // Add different products for each user
      const product = {
        id: `prod-${userId}`,
        title: `Product for ${userId}`,
        price: Math.floor(Math.random() * 100) + 10,
        image: `https://example.com/${userId}.jpg`
      };
      
      const response = await axios.post(`${BASE_URL}/api/cart/${userId}/add`, {
        product: product,
        quantity: Math.floor(Math.random() * 5) + 1
      });
      
      console.log(`✅ Cart created for ${userId}:`, {
        userId: response.data.userId,
        itemsCount: response.data.items.length,
        totalValue: response.data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)
      });
    }
    
    console.log('\n✅ Multiple user cart test completed successfully!');
    
  } catch (error) {
    console.error('❌ Multiple user test failed:', error.message);
  }
}

// Run tests
async function runAllTests() {
  await testCartCollection();
  await testMultipleUsers();
}

runAllTests();
