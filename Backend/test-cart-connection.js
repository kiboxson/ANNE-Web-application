// Test script to verify cart database connection
const mongoose = require('mongoose');
require('dotenv').config();

// Use the same MongoDB URI as the main application
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://kiboxsonleena:20040620Kiyu@cluster0.cr1byep.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0";

// Cart schema (same as in main app)
const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  items: [{
    id: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: null }
  }],
  updatedAt: { type: Date, default: Date.now }
});

const Cart = mongoose.model('Cart', cartSchema);

async function testCartConnection() {
  try {
    console.log('🔗 Testing Cart Database Connection...');
    console.log('📍 MongoDB URI:', MONGODB_URI.substring(0, 50) + '...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log('✅ Connected to MongoDB Atlas successfully!');
    
    // Test database ping
    await mongoose.connection.db.admin().ping();
    console.log('✅ Database ping successful!');
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections found:', collections.length);
    collections.forEach(col => console.log('  -', col.name));
    
    // Test cart operations
    console.log('\n🛒 Testing cart operations...');
    
    // Create test cart
    const testUserId = 'test-user-' + Date.now();
    const testCart = new Cart({
      userId: testUserId,
      items: [{
        id: 'test-product-1',
        title: 'Test Product',
        price: 99.99,
        quantity: 1,
        image: 'https://example.com/image.jpg'
      }]
    });
    
    await testCart.save();
    console.log('✅ Test cart created successfully!');
    
    // Retrieve cart
    const retrievedCart = await Cart.findOne({ userId: testUserId });
    console.log('✅ Test cart retrieved successfully!');
    console.log('📦 Cart items:', retrievedCart.items.length);
    
    // Update cart
    retrievedCart.items.push({
      id: 'test-product-2',
      title: 'Another Test Product',
      price: 49.99,
      quantity: 2,
      image: null
    });
    await retrievedCart.save();
    console.log('✅ Test cart updated successfully!');
    
    // Clean up
    await Cart.deleteOne({ userId: testUserId });
    console.log('🧹 Test cart cleaned up');
    
    console.log('\n🎉 All cart database tests passed!');
    console.log('✅ Cart collection is properly connected and functional');
    
  } catch (error) {
    console.error('\n❌ Cart database test failed!');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('\n🔧 Possible solutions:');
      console.error('1. Check MongoDB Atlas network access (add 0.0.0.0/0)');
      console.error('2. Verify username/password in connection string');
      console.error('3. Ensure cluster is not paused');
      console.error('4. Check if database name "passkey" exists');
    }
    
    console.error('\nFull error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the test
testCartConnection();
