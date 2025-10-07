// Quick migration script to transfer JSON data to MongoDB
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB connection
const MONGODB_URI = "mongodb+srv://kiboxsonleena:20040620Kiyu@cluster0.cr1byep.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0";

// Product Schema
const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  category: { type: String, required: true },
  image: { type: String, default: null },
  description: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

async function quickMigrate() {
  try {
    console.log('🔄 Starting quick migration...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, { dbName: "passkey" });
    console.log('✅ Connected to MongoDB');

    // Read products.json
    const productsFile = path.join(__dirname, 'data', 'products.json');
    
    if (fs.existsSync(productsFile)) {
      const jsonProducts = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
      console.log(`📦 Found ${jsonProducts.length} products in JSON file`);
      
      // Clear existing products first (optional)
      await Product.deleteMany({});
      console.log('🗑️  Cleared existing products');
      
      let migrated = 0;
      for (const product of jsonProducts) {
        try {
          const newProduct = new Product({
            id: product.id,
            title: product.title,
            price: product.price,
            stock: product.stock || 0,
            category: product.category || "General",
            image: product.image || null,
            description: product.description || null
          });
          await newProduct.save();
          migrated++;
          console.log(`✅ Migrated: ${product.title}`);
        } catch (err) {
          console.error(`❌ Failed to migrate ${product.title}:`, err.message);
        }
      }
      
      console.log(`\n🎉 Migration completed! ${migrated} products migrated successfully.`);
    } else {
      console.log('❌ No products.json file found');
    }
    
    // Verify migration
    const count = await Product.countDocuments();
    console.log(`📊 Total products in MongoDB: ${count}`);
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

quickMigrate();
