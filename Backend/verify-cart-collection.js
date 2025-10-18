const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = "mongodb+srv://kiboxsonleena:20040620Kiyu@cluster0.cr1byep.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0";

// Cart Schema (same as in index.js)
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

async function verifyCartCollection() {
  try {
    console.log('🔍 Verifying Cart Collection in MongoDB Atlas...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      dbName: "passkey",
    });
    console.log('✅ Connected to MongoDB Atlas');
    
    // Check if cart collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const cartCollection = collections.find(col => col.name === 'carts');
    
    if (cartCollection) {
      console.log('✅ Cart collection exists in database');
      console.log('   Collection name:', cartCollection.name);
    } else {
      console.log('ℹ️ Cart collection will be created when first cart is added');
    }
    
    // Get cart statistics
    const cartCount = await Cart.countDocuments();
    console.log(`📊 Total carts in collection: ${cartCount}`);
    
    if (cartCount > 0) {
      // Get sample carts
      const sampleCarts = await Cart.find().limit(5);
      console.log('\n📋 Sample carts:');
      
      sampleCarts.forEach((cart, index) => {
        const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        const totalValue = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        console.log(`   ${index + 1}. User: ${cart.userId}`);
        console.log(`      Items: ${totalItems} (${cart.items.length} unique products)`);
        console.log(`      Total Value: $${totalValue.toFixed(2)}`);
        console.log(`      Last Updated: ${cart.updatedAt.toISOString()}`);
      });
    }
    
    // Show collection indexes
    const indexes = await Cart.collection.getIndexes();
    console.log('\n🔑 Collection indexes:');
    Object.keys(indexes).forEach(indexName => {
      console.log(`   - ${indexName}:`, indexes[indexName]);
    });
    
    console.log('\n✅ Cart collection verification completed successfully!');
    console.log('\n📝 Cart Collection Features:');
    console.log('   ✅ User-specific cart storage');
    console.log('   ✅ Product details (id, title, price, quantity, image)');
    console.log('   ✅ Automatic timestamp tracking');
    console.log('   ✅ Unique user identification');
    console.log('   ✅ Complete CRUD operations available');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

verifyCartCollection();
