// Diagnostic script to check cart functionality
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://kiboxsonleena:20040620Kiyu@cluster0.cr1byep.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0";

console.log('\n🔍 ========== CART DIAGNOSTICS ==========\n');

async function diagnose() {
  try {
    // Test 1: Check MongoDB URI
    console.log('📋 Test 1: MongoDB URI Configuration');
    console.log('   - Has MONGODB_URI env var:', !!process.env.MONGODB_URI);
    console.log('   - URI length:', MONGODB_URI.length);
    console.log('   - URI start:', MONGODB_URI.substring(0, 50) + '...');
    
    // Test 2: Try to connect
    console.log('\n📋 Test 2: Attempting MongoDB Connection');
    console.log('   - Connecting...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('   ✅ Connected successfully!');
    console.log('   - Connection state:', mongoose.connection.readyState);
    console.log('   - Database name:', mongoose.connection.db.databaseName);
    
    // Test 3: Check collections
    console.log('\n📋 Test 3: Checking Collections');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('   - Total collections:', collections.length);
    console.log('   - Collection names:', collections.map(c => c.name).join(', '));
    
    const hasCartsCollection = collections.some(c => c.name === 'carts');
    console.log('   - Has "carts" collection:', hasCartsCollection ? '✅ YES' : '❌ NO');
    
    // Test 4: Check Cart model
    console.log('\n📋 Test 4: Testing Cart Model');
    
    const cartSchema = new mongoose.Schema({
      userId: { type: String, required: true, unique: true },
      userDetails: {
        username: { type: String, default: null },
        email: { type: String, default: null },
        phone: { type: String, default: null }
      },
      items: [{
        id: { type: String, required: true },
        title: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        image: { type: String, default: null },
        category: { type: String, default: null },
        description: { type: String, default: null },
        stock: { type: Number, default: null },
        addedAt: { type: Date, default: Date.now },
        subtotal: { type: Number, default: 0 }
      }],
      orderSummary: {
        totalItems: { type: Number, default: 0 },
        totalQuantity: { type: Number, default: 0 },
        subtotal: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        shipping: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
      },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });
    
    const Cart = mongoose.model('Cart', cartSchema);
    console.log('   ✅ Cart model created');
    
    // Test 5: Try to create a test cart
    console.log('\n📋 Test 5: Creating Test Cart');
    const testUserId = 'diagnostic-test-' + Date.now();
    
    const testCart = new Cart({
      userId: testUserId,
      userDetails: {
        username: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890'
      },
      items: [{
        id: 'test-product-1',
        title: 'Test Product',
        price: 99.99,
        quantity: 1,
        image: 'https://example.com/image.jpg',
        category: 'Test',
        description: 'Test description',
        stock: 10,
        addedAt: new Date(),
        subtotal: 99.99
      }],
      orderSummary: {
        totalItems: 1,
        totalQuantity: 1,
        subtotal: 99.99,
        tax: 9.99,
        shipping: 10,
        total: 119.98
      }
    });
    
    const savedCart = await testCart.save();
    console.log('   ✅ Test cart saved successfully!');
    console.log('   - Cart ID:', savedCart._id);
    console.log('   - User ID:', savedCart.userId);
    console.log('   - Items count:', savedCart.items.length);
    console.log('   - Total:', '$' + savedCart.orderSummary.total);
    
    // Test 6: Verify cart was saved
    console.log('\n📋 Test 6: Verifying Cart in Database');
    const retrievedCart = await Cart.findOne({ userId: testUserId });
    
    if (retrievedCart) {
      console.log('   ✅ Cart retrieved from database!');
      console.log('   - User Details:', retrievedCart.userDetails);
      console.log('   - Items:', retrievedCart.items.length);
      console.log('   - Order Summary:', retrievedCart.orderSummary);
    } else {
      console.log('   ❌ Cart not found in database!');
    }
    
    // Test 7: Count total carts
    console.log('\n📋 Test 7: Counting All Carts');
    const totalCarts = await Cart.countDocuments();
    console.log('   - Total carts in collection:', totalCarts);
    
    // Clean up test cart
    await Cart.deleteOne({ userId: testUserId });
    console.log('   - Test cart cleaned up');
    
    console.log('\n✅ ========== ALL DIAGNOSTICS PASSED ==========\n');
    console.log('💡 Conclusion: MongoDB connection and Cart model are working correctly!');
    console.log('💡 If carts are not saving from the frontend, check:');
    console.log('   1. Backend server is running (npm start in Backend folder)');
    console.log('   2. Frontend is sending requests to correct URL');
    console.log('   3. User is logged in (userId is required)');
    console.log('   4. Check browser console for errors');
    console.log('   5. Check backend console logs when adding to cart\n');
    
  } catch (error) {
    console.error('\n❌ Diagnostic failed:', error.message);
    console.error('Error details:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

diagnose();
