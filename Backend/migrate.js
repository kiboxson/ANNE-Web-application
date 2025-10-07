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

// Flash Product Schema
const flashProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  category: { type: String, required: true },
  image: { type: String, default: null },
  description: { type: String, default: null },
  startsAt: { type: Date, default: null },
  endsAt: { type: Date, default: null },
  discount: { type: Number, default: null },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const FlashProduct = mongoose.model('FlashProduct', flashProductSchema);

async function migrateData() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { dbName: "passkey" });
    console.log('✅ Connected to MongoDB Atlas');

    // Read JSON files
    const productsFile = path.join(__dirname, 'data', 'products.json');
    const flashProductsFile = path.join(__dirname, 'data', 'flash_products.json');

    let migratedProducts = 0;
    let skippedProducts = 0;
    let migratedFlashProducts = 0;
    let skippedFlashProducts = 0;

    // Migrate regular products
    if (fs.existsSync(productsFile)) {
      console.log('📦 Migrating regular products...');
      const jsonProducts = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
      
      for (const product of jsonProducts) {
        try {
          const existingProduct = await Product.findOne({ id: product.id });
          if (!existingProduct) {
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
            migratedProducts++;
            console.log(`✅ Migrated product: ${product.title}`);
          } else {
            skippedProducts++;
            console.log(`⏭️  Skipped existing product: ${product.title}`);
          }
        } catch (err) {
          console.error(`❌ Error migrating product ${product.id}:`, err.message);
        }
      }
    }

    // Migrate flash products
    if (fs.existsSync(flashProductsFile)) {
      console.log('⚡ Migrating flash products...');
      const jsonFlashProducts = JSON.parse(fs.readFileSync(flashProductsFile, 'utf8'));
      
      for (const flashProduct of jsonFlashProducts) {
        try {
          const existingFlashProduct = await FlashProduct.findOne({ id: flashProduct.id });
          if (!existingFlashProduct) {
            const newFlashProduct = new FlashProduct({
              id: flashProduct.id,
              title: flashProduct.title,
              price: flashProduct.price,
              stock: flashProduct.stock || 0,
              category: flashProduct.category || "General",
              image: flashProduct.image || null,
              description: flashProduct.description || null,
              startsAt: flashProduct.startsAt ? new Date(flashProduct.startsAt) : null,
              endsAt: flashProduct.endsAt ? new Date(flashProduct.endsAt) : null,
              discount: flashProduct.discount || null
            });
            await newFlashProduct.save();
            migratedFlashProducts++;
            console.log(`✅ Migrated flash product: ${flashProduct.title}`);
          } else {
            skippedFlashProducts++;
            console.log(`⏭️  Skipped existing flash product: ${flashProduct.title}`);
          }
        } catch (err) {
          console.error(`❌ Error migrating flash product ${flashProduct.id}:`, err.message);
        }
      }
    }

    console.log('\n🎉 Migration completed!');
    console.log(`📦 Regular Products: ${migratedProducts} migrated, ${skippedProducts} skipped`);
    console.log(`⚡ Flash Products: ${migratedFlashProducts} migrated, ${skippedFlashProducts} skipped`);
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrateData();
