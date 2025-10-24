// Vercel serverless function for cart GET endpoint
const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://kiboxsonleena:20040620Kiyu@cluster0.cr1byep.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0";

// Cart Schema
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

let Cart;
try {
  Cart = mongoose.model('Cart');
} catch {
  Cart = mongoose.model('Cart', cartSchema);
}

// Connect to MongoDB
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    cachedDb = mongoose.connection;
    console.log('✅ Connected to MongoDB');
    return cachedDb;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

// Main handler
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed',
      allowedMethods: ['GET']
    });
  }

  try {
    // Connect to database
    await connectToDatabase();

    const { userId } = req.query;
    
    console.log(`📦 VERCEL GET CART - User: ${userId}`);
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing userId parameter'
      });
    }
    
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ MongoDB not connected');
      return res.status(503).json({ 
        success: false,
        error: "Database not connected"
      });
    }
    
    // Try to find cart in MongoDB
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      // Create empty cart
      cart = { 
        userId, 
        items: [], 
        createdAt: new Date(),
        updatedAt: new Date()
      };
      console.log(`🆕 No cart found, returning empty cart`);
    } else {
      console.log(`📦 Found cart with ${cart.items.length} items`);
    }
    
    return res.json({
      success: true,
      cart: cart,
      itemCount: cart.items?.length || 0
    });
    
  } catch (error) {
    console.error("❌ Get cart error:", error);
    return res.status(500).json({ 
      success: false,
      error: "Failed to get cart",
      message: error.message
    });
  }
};
