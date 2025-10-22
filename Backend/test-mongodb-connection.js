// MongoDB Connection Test Script
// Run this to test MongoDB Atlas connection locally

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://kiboxsonleena:20040620Kiyu@cluster0.cr1byep.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0";

console.log('🔗 Testing MongoDB Connection...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Using fallback URI:', !process.env.MONGODB_URI);
console.log('URI length:', MONGODB_URI.length);
console.log('URI start:', MONGODB_URI.substring(0, 30) + '...');

async function testConnection() {
  try {
    console.log('\n📡 Attempting to connect to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      serverSelectionRetryDelayMS: 5000,
      heartbeatFrequencyMS: 10000,
    });
    
    console.log('✅ Connected to MongoDB Atlas successfully!');
    
    // Test database access
    const db = mongoose.connection.db;
    console.log('📊 Database name:', db.databaseName);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections found:', collections.length);
    collections.forEach(col => console.log('  -', col.name));
    
    // Test cart schema
    const Cart = mongoose.model('Cart', new mongoose.Schema({
      userId: { type: String, required: true, unique: true },
      items: [{
        id: { type: String, required: true },
        title: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        image: { type: String, default: null }
      }],
      updatedAt: { type: Date, default: Date.now }
    }));
    
    // Test cart operations
    console.log('\n🛒 Testing cart operations...');
    const cartCount = await Cart.countDocuments();
    console.log('📦 Existing carts:', cartCount);
    
    // Try to create a test cart
    const testUserId = 'test-user-' + Date.now();
    const testCart = new Cart({
      userId: testUserId,
      items: [{
        id: 'test-product',
        title: 'Test Product',
        price: 99.99,
        quantity: 1,
        image: null
      }]
    });
    
    await testCart.save();
    console.log('✅ Test cart created successfully!');
    
    // Clean up test cart
    await Cart.deleteOne({ userId: testUserId });
    console.log('🧹 Test cart cleaned up');
    
    console.log('\n🎉 All tests passed! MongoDB Atlas is working correctly.');
    
  } catch (error) {
    console.error('\n❌ MongoDB connection failed!');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('\n🔧 Possible solutions:');
      console.error('1. Check MongoDB Atlas network access (add 0.0.0.0/0)');
      console.error('2. Verify username/password in connection string');
      console.error('3. Ensure cluster is not paused');
      console.error('4. Check if database name "passkey" exists');
    }
    
    if (error.code === 'ENOTFOUND') {
      console.error('\n🌐 DNS resolution failed - check internet connection');
    }
    
    console.error('\nFull error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

testConnection();
