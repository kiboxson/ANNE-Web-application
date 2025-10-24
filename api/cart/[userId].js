// Vercel Serverless Function - Get Cart
const mongoose = require('mongoose');

// MongoDB URI
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
let isConnected = false;

// Connect to MongoDB
async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    try {
      Cart = mongoose.model('Cart');
    } catch {
      Cart = mongoose.model('Cart', cartSchema);
    }
    
    isConnected = true;
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

// Main handler
module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed. Use GET.' 
    });
  }

  try {
    await connectDB();

    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing userId parameter'
      });
    }
    
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = { 
        userId, 
        items: [],
        orderSummary: {
          totalItems: 0,
          totalQuantity: 0,
          subtotal: 0,
          tax: 0,
          shipping: 0,
          total: 0
        }
      };
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
