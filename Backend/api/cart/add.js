// Vercel serverless function for cart add endpoint
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

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed',
      allowedMethods: ['POST']
    });
  }

  try {
    // Connect to database
    await connectToDatabase();

    const { userId, product, quantity = 1, userDetails } = req.body;
    
    console.log(`🛒 VERCEL CART ADD - User: ${userId}, Product: ${product?.title}`);
    
    // Validation
    if (!userId || !product || !product.id || !product.title || !product.price) {
      return res.status(400).json({ 
        success: false,
        error: "Missing required fields: userId, product (id, title, price)" 
      });
    }
    
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ MongoDB not connected');
      return res.status(503).json({ 
        success: false,
        error: "Database not connected",
        message: "Please try again later"
      });
    }
    
    // Find existing cart or create new one
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = new Cart({
        userId,
        userDetails: userDetails || {},
        items: [],
        orderSummary: {
          totalItems: 0,
          totalQuantity: 0,
          subtotal: 0,
          tax: 0,
          shipping: 0,
          total: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`🆕 Creating new cart for user: ${userId}`);
    } else {
      if (userDetails) {
        cart.userDetails = { ...cart.userDetails, ...userDetails };
      }
    }
    
    // Calculate item subtotal
    const itemSubtotal = Number(product.price) * quantity;
    
    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].subtotal = cart.items[existingItemIndex].price * cart.items[existingItemIndex].quantity;
      console.log(`📝 Updated existing item: ${product.title}`);
    } else {
      cart.items.push({
        id: product.id,
        title: product.title,
        price: Number(product.price),
        quantity: quantity,
        image: product.image || null,
        category: product.category || null,
        description: product.description || null,
        stock: product.stock || null,
        addedAt: new Date(),
        subtotal: itemSubtotal
      });
      console.log(`➕ Added new item: ${product.title}`);
    }
    
    // Calculate order summary
    const totalItems = cart.items.length;
    const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1;
    const shipping = subtotal > 100 ? 0 : 10;
    const total = subtotal + tax + shipping;
    
    cart.orderSummary = {
      totalItems,
      totalQuantity,
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      shipping: Number(shipping.toFixed(2)),
      total: Number(total.toFixed(2))
    };
    
    cart.updatedAt = new Date();
    
    // Save to MongoDB
    const savedCart = await cart.save();
    
    console.log(`✅ Cart saved to MongoDB - ID: ${savedCart._id}`);
    
    return res.status(201).json({
      success: true,
      cart: savedCart,
      message: `Added ${product.title} to cart`,
      summary: {
        itemsInCart: totalItems,
        totalQuantity: totalQuantity,
        totalAmount: total
      }
    });
    
  } catch (error) {
    console.error("❌ Cart add error:", error);
    return res.status(500).json({ 
      success: false,
      error: "Failed to add item to cart",
      message: error.message 
    });
  }
};
