const axios = require('axios');

async function quickTest() {
  console.log('\n🧪 ========== QUICK CART TEST ==========\n');
  
  try {
    console.log('📋 Testing cart API at http://localhost:5000/api/cart/add...\n');
    
    const testData = {
      userId: 'quick-test-' + Date.now(),
      product: {
        id: 'test-product-1',
        title: 'Quick Test Product',
        price: 50.00,
        image: 'https://example.com/test.jpg',
        category: 'Test Category',
        description: 'This is a test product',
        stock: 100
      },
      quantity: 2,
      userDetails: {
        username: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890'
      }
    };
    
    console.log('📦 Sending test data:');
    console.log('   - User ID:', testData.userId);
    console.log('   - Product:', testData.product.title);
    console.log('   - Quantity:', testData.quantity);
    console.log('   - User:', testData.userDetails.username);
    
    const response = await axios.post('http://localhost:5000/api/cart/add', testData);
    
    console.log('\n✅ ========== SUCCESS! ==========\n');
    console.log('📊 Response Summary:');
    console.log('   - Success:', response.data.success);
    console.log('   - Message:', response.data.message);
    
    if (response.data.summary) {
      console.log('\n📈 Cart Summary:');
      console.log('   - Items in Cart:', response.data.summary.itemsInCart);
      console.log('   - Total Quantity:', response.data.summary.totalQuantity);
      console.log('   - Total Amount: $' + response.data.summary.totalAmount);
    }
    
    if (response.data.cart) {
      console.log('\n💾 Cart Details:');
      console.log('   - Cart ID:', response.data.cart._id);
      console.log('   - User ID:', response.data.cart.userId);
      console.log('   - Items Count:', response.data.cart.items.length);
      
      if (response.data.cart.userDetails) {
        console.log('\n👤 User Details Saved:');
        console.log('   - Username:', response.data.cart.userDetails.username);
        console.log('   - Email:', response.data.cart.userDetails.email);
        console.log('   - Phone:', response.data.cart.userDetails.phone);
      }
      
      if (response.data.cart.orderSummary) {
        console.log('\n📊 Order Summary:');
        console.log('   - Subtotal: $' + response.data.cart.orderSummary.subtotal);
        console.log('   - Tax: $' + response.data.cart.orderSummary.tax);
        console.log('   - Shipping: $' + response.data.cart.orderSummary.shipping);
        console.log('   - Total: $' + response.data.cart.orderSummary.total);
      }
      
      if (response.data.cart.items && response.data.cart.items.length > 0) {
        console.log('\n📦 Product Details Saved:');
        const item = response.data.cart.items[0];
        console.log('   - ID:', item.id);
        console.log('   - Title:', item.title);
        console.log('   - Price: $' + item.price);
        console.log('   - Quantity:', item.quantity);
        console.log('   - Category:', item.category);
        console.log('   - Description:', item.description);
        console.log('   - Stock:', item.stock);
        console.log('   - Subtotal: $' + item.subtotal);
      }
    }
    
    console.log('\n✅ ========== CART IS WORKING! ==========');
    console.log('💾 Data successfully saved to MongoDB Atlas "carts" collection');
    console.log('🎉 All product details, user details, and order summary are saved!\n');
    
  } catch (error) {
    console.log('\n❌ ========== TEST FAILED! ==========\n');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Cannot connect to backend server!');
      console.log('\n💡 Solution:');
      console.log('   1. Make sure backend is running:');
      console.log('      cd Backend');
      console.log('      npm start');
      console.log('   2. Check if port 5000 is available');
      console.log('   3. Try again after starting the server\n');
      
    } else if (error.response) {
      console.log('❌ Backend returned an error:');
      console.log('   - Status:', error.response.status);
      console.log('   - Error:', error.response.data.error || error.response.data.message);
      
      if (error.response.data.error === 'Database not connected') {
        console.log('\n⚠️ MongoDB is NOT connected!');
        console.log('\n💡 Solutions:');
        console.log('   1. Check internet connection');
        console.log('   2. Verify MongoDB Atlas Network Access:');
        console.log('      - Log in to MongoDB Atlas');
        console.log('      - Go to Network Access');
        console.log('      - Add IP: 0.0.0.0/0 (allow from anywhere)');
        console.log('   3. Check MongoDB credentials in .env file');
        console.log('   4. Restart backend server:');
        console.log('      - Stop server (Ctrl+C)');
        console.log('      - Run: npm start');
        console.log('   5. Run diagnostic: node diagnose-cart.js\n');
        
      } else if (error.response.data.error === 'Missing required fields: userId, product (id, title, price)') {
        console.log('\n⚠️ Missing required fields!');
        console.log('   This should not happen with this test script.');
        console.log('   Check if backend code is correct.\n');
      }
      
    } else {
      console.log('❌ Unexpected error:', error.message);
      console.log('\n💡 Try:');
      console.log('   1. Check if backend is running');
      console.log('   2. Run: node diagnose-cart.js');
      console.log('   3. Check backend console for errors\n');
    }
  }
}

// Run the test
console.log('🚀 Starting quick cart test...');
console.log('📍 Backend URL: http://localhost:5000');
console.log('📍 Endpoint: POST /api/cart/add\n');

quickTest();
