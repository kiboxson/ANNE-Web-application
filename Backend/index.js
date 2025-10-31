// backend/server.js
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
require("dotenv").config();
const mongoose = require("mongoose");

const app = express();

// CORS configuration for production
const corsOptions = {
  origin: [
    'http://localhost:3000', // Local development
    'https://localhost:3000', // Local development HTTPS
    'http://127.0.0.1:3000', // Alternative localhost
    'http://127.0.0.1:49326', // Browser preview proxy
    'http://127.0.0.1:63293', // Current browser preview proxy
    /^http:\/\/127\.0\.0\.1:\d+$/, // Any localhost port
    /\.vercel\.app$/, // All Vercel domains
    /\.netlify\.app$/, // All Netlify domains (if needed)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with', 'Access-Control-Allow-Origin']
};

app.use(cors(corsOptions));
app.use(express.json());
// Removed static file serving to prevent API route conflicts
// app.use(express.static(__dirname)); // Serve static files for testing

// Root route handler
app.get("/", (req, res) => {
  res.json({
    message: "🚀 ANNE Web Application Backend API",
    status: "✅ Server is running successfully",
    version: "1.0.4",
    lastUpdate: "2025-10-25 - Cart API Endpoints Deployed",
    mongoStatus: mongoose.connection.readyState === 1 ? "✅ Connected" : "❌ Disconnected",
    endpoints: {
      health: "/api/health/db",
      cartDiagnostic: "/api/cart/diagnostic",
      products: "/api/products",
      flashProducts: "/api/flash-products",
      orders: "/api/orders",
      chat: "/api/chat",
      users: "/api/users",
      cart: "/api/cart/:userId",
      cartAdd: "/api/cart/add",
      cartUpdate: "/api/cart/update",
      cartRemove: "/api/cart/remove",
      cartClear: "/api/cart/clear",
      email: "/api/test-email"
    },
    documentation: "Visit the API endpoints above for functionality"
  });
});

// --- MongoDB Atlas connection ---
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://kiboxsonleena:20040620Kiyu@cluster0.cr1byep.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0";

console.log('🔗 MongoDB Configuration:', {
  hasMongoUri: !!process.env.MONGODB_URI,
  environment: process.env.NODE_ENV,
  uriLength: MONGODB_URI.length,
  uriStart: MONGODB_URI.substring(0, 20) + '...',
  usingFallback: !process.env.MONGODB_URI
});

if (!process.env.MONGODB_URI) {
  console.warn('⚠️ WARNING: Using fallback MongoDB URI. Set MONGODB_URI environment variable in Vercel dashboard.');
}

// Enhanced MongoDB connection with automatic reconnection
async function connectToMongoDB() {
  let retryCount = 0;
  const maxRetries = 3;
  
  while (retryCount < maxRetries) {
    try {
      console.log(`🔄 Attempting MongoDB connection (attempt ${retryCount + 1}/${maxRetries})...`);
      console.log(`🔗 Using MongoDB URI: ${MONGODB_URI.substring(0, 50)}...`);
      
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        retryWrites: true,
        w: 'majority'
      });
      
      console.log("✅ Connected to MongoDB Atlas successfully!");
      
      // Test the connection with a ping
      await mongoose.connection.db.admin().ping();
      console.log("✅ MongoDB ping successful!");
      
      // Test database access
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log("✅ Database collections accessible:", collections.length, "collections found");
      
      // Ensure cart collection exists
      const cartCollectionExists = collections.some(col => col.name === 'carts');
      if (!cartCollectionExists) {
        console.log("🆕 Creating carts collection...");
        await mongoose.connection.db.createCollection('carts');
        console.log("✅ Carts collection created");
      } else {
        console.log("✅ Carts collection already exists");
      }
      
      return; // Success, exit retry loop
      
    } catch (err) {
      retryCount++;
      console.error(`❌ MongoDB connection attempt ${retryCount} failed:`, err.message);
      
      if (retryCount >= maxRetries) {
        console.error("❌ All MongoDB connection attempts failed!");
        console.error("❌ Connection details:", {
          name: err.name,
          code: err.code,
          codeName: err.codeName,
          message: err.message
        });
        
        // In production, continue but log the issue
        console.error("🚨 WARNING: Running without database connection!");
        console.error("⚠️ Cart functionality will be limited until database is connected.");
        break;
      } else {
        console.log(`⏳ Retrying in 2 seconds... (${maxRetries - retryCount} attempts remaining)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
}

// Automatic reconnection handler
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected. Attempting to reconnect...');
  setTimeout(connectToMongoDB, 5000);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Connect to MongoDB
connectToMongoDB();

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected from MongoDB');
});

// Chat Message Schema
const chatMessageSchema = new mongoose.Schema({
  message: { type: String, required: true },
  sender: { type: String, required: true }, // 'user' or 'admin'
  senderName: { type: String, default: 'Anonymous' },
  userId: { type: String, default: null }, // Firebase UID for registered users
  timestamp: { type: Date, default: Date.now },
  sessionId: { type: String, required: true }, // to group conversations
  isRead: { type: Boolean, default: false }
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

// User Schema for storing registered users
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // Firebase UID
  username: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, default: 'user' }, // 'user' or 'admin'
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: String, required: true }, // Firebase UID
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  items: [{
    productId: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, default: null }
  }],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'Sri Lanka' }
  },
  paymentMethod: { type: String, default: 'Cash on Delivery' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  paymentDetails: {
    status_code: String,
    status_message: String,
    card_holder_name: String,
    card_no: String,
    transaction_id: String
  },
  orderDate: { type: Date, default: Date.now },
  estimatedDelivery: { type: Date },
  trackingNumber: { type: String, default: null }
});

const Order = mongoose.model('Order', orderSchema);

// Email Credentials Schema (for sending confirmation emails)
const credentialSchema = new mongoose.Schema({
  user: String,
  pass: String
});

const Credential = mongoose.model("Credential", credentialSchema, "bulkmail");

// Product Schema for MongoDB
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

// Flash Product Schema for MongoDB
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

// Cart Schema for user-specific cart storage with complete details
const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // Firebase UID
  userDetails: {
    username: { type: String, default: null },
    email: { type: String, default: null },
    phone: { type: String, default: null }
  },
  items: [{
    // Product Details
    id: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: null },
    category: { type: String, default: null },
    description: { type: String, default: null },
    stock: { type: Number, default: null },
    // Order Details for this item
    addedAt: { type: Date, default: Date.now },
    subtotal: { type: Number, default: 0 } // price * quantity
  }],
  // Order Summary
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

// Feedback Schema for customer feedback
const feedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  feedback: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, default: 'pending', enum: ['pending', 'reviewed', 'published'] }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

// In-memory cart storage for fast access and fallback
const simpleCart = new Map();

// Persistent JSON storage for products
const DATA_DIR = path.join(__dirname, "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const FLASH_FILE = path.join(DATA_DIR, "flash_products.json");

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(PRODUCTS_FILE)) fs.writeFileSync(PRODUCTS_FILE, "[]", "utf8");
  if (!fs.existsSync(FLASH_FILE)) fs.writeFileSync(FLASH_FILE, "[]", "utf8");
}

function readProducts() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(PRODUCTS_FILE, "utf8");
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function writeProducts(list) {
  ensureDataFile();
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(list, null, 2), "utf8");
}

function readFlash() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(FLASH_FILE, "utf8");
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function writeFlash(list) {
  ensureDataFile();
  fs.writeFileSync(FLASH_FILE, JSON.stringify(list, null, 2), "utf8");
}

// Email sending function
async function sendOrderConfirmationEmail(orderDetails) {
  try {
    console.log("🔍 Attempting to send order confirmation email...");
    
    const credentials = await Credential.find();
    console.log("📧 Email credentials found:", credentials.length > 0 ? "Yes" : "No");
    
    if (!credentials || credentials.length === 0) {
      console.log("❌ No email credentials found in database");
      return false;
    }

    console.log("📧 Using email:", credentials[0].user);
    console.log("🔑 Password length:", credentials[0].pass ? credentials[0].pass.length : 0);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: credentials[0].user,
        pass: credentials[0].pass,
      },
    });

    // Test the connection
    console.log("🔗 Testing email connection...");
    await transporter.verify();
    console.log("✅ Email connection verified successfully");

    const emailContent = `
Dear ${orderDetails.customerName},

Thank you for your order! Here are your order details:

Order ID: ${orderDetails.orderId}
Order Date: ${new Date(orderDetails.orderDate).toLocaleDateString()}
Total Amount: $${orderDetails.totalAmount.toFixed(2)}
Payment Method: ${orderDetails.paymentMethod}
Tracking Number: ${orderDetails.trackingNumber}

Items Ordered:
${orderDetails.items.map(item => `- ${item.title} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join('\n')}

Shipping Address:
${orderDetails.shippingAddress.street}
${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state}
${orderDetails.shippingAddress.zipCode}
${orderDetails.shippingAddress.country}

Estimated Delivery: ${new Date(orderDetails.estimatedDelivery).toLocaleDateString()}

Thank you for shopping with us!

Best regards,
Your E-commerce Team
    `;

    console.log("📤 Sending email to:", orderDetails.customerEmail);
    
    const mailOptions = {
      from: credentials[0].user,
      to: orderDetails.customerEmail,
      subject: `Order Confirmation - ${orderDetails.orderId}`,
      text: emailContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully!");
    console.log("📧 Message ID:", result.messageId);
    console.log("📧 Response:", result.response);
    
    return true;
  } catch (error) {
    console.error("❌ Error sending order confirmation email:");
    console.error("Error type:", error.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    if (error.response) {
      console.error("SMTP Response:", error.response);
    }
    return false;
  }
}

// DB health check
app.get("/api/health/db", (req, res) => {
  const state = mongoose.connection?.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  res.json({
    mongoConnected: state === 1,
    state,
  });
});

// Environment check endpoint
app.get("/api/health/env", (req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    hasMongoUri: !!process.env.MONGODB_URI,
    mongoUriLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
    mongoUriStart: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 30) + '...' : 'Not set',
    usingFallback: !process.env.MONGODB_URI,
    connectionState: mongoose.connection.readyState,
    connectionStates: {
      0: 'disconnected',
      1: 'connected', 
      2: 'connecting',
      3: 'disconnecting'
    },
    timestamp: new Date().toISOString(),
    vercelRegion: process.env.VERCEL_REGION || 'unknown'
  });
});

// Simple test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend is working!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongoConnected: mongoose.connection.readyState === 1
  });
});

// SIMPLE CART TEST - Always works
app.get("/api/cart-test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Cart API is working!",
    timestamp: new Date().toISOString(),
    endpoints: [
      "GET /api/cart/:userId",
      "POST /api/cart/add", 
      "DELETE /api/cart/remove",
      "DELETE /api/cart/clear"
    ]
  });
});

// Cart Diagnostic Endpoint - Check if enhanced cart is working
app.get("/api/cart/diagnostic", async (req, res) => {
  try {
    const diagnostic = {
      timestamp: new Date().toISOString(),
      mongoConnection: {
        state: mongoose.connection.readyState,
        stateText: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState],
        isConnected: mongoose.connection.readyState === 1,
        database: mongoose.connection.readyState === 1 ? mongoose.connection.db.databaseName : 'N/A'
      },
      cartEndpoint: {
        path: '/api/cart/add',
        method: 'POST',
        enhanced: true,
        version: '2.0 - Complete Details'
      },
      features: {
        productDetails: true,
        userDetails: true,
        orderSummary: true,
        taxCalculation: true,
        shippingCalculation: true
      }
    };
    
    // Try to count carts if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      try {
        const cartCount = await Cart.countDocuments();
        diagnostic.cartsInDatabase = cartCount;
        
        // Get a sample cart if any exist
        if (cartCount > 0) {
          const sampleCart = await Cart.findOne().limit(1);
          diagnostic.sampleCartStructure = {
            hasUserId: !!sampleCart.userId,
            hasUserDetails: !!sampleCart.userDetails,
            hasItems: !!sampleCart.items,
            itemsCount: sampleCart.items.length,
            hasOrderSummary: !!sampleCart.orderSummary,
            hasTimestamps: !!(sampleCart.createdAt && sampleCart.updatedAt)
          };
        }
      } catch (err) {
        diagnostic.cartCollectionError = err.message;
      }
    }
    
    res.json({
      success: true,
      diagnostic,
      message: diagnostic.mongoConnection.isConnected 
        ? "✅ Cart system is ready to save to MongoDB" 
        : "❌ MongoDB not connected - carts will not be saved"
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Cart collection health check
app.get("/api/health/cart", async (req, res) => {
  try {
    console.log('🏥 Cart health check requested');
    console.log(`🔗 MongoDB connection state: ${mongoose.connection.readyState}`);
    
    if (mongoose.connection.readyState !== 1) {
      console.log('❌ MongoDB not connected for cart health check');
      return res.status(503).json({
        mongoConnected: false,
        cartCollectionAccessible: false,
        connectionState: mongoose.connection.readyState,
        error: "MongoDB not connected"
      });
    }
    
    // Test cart collection access
    const cartCount = await Cart.countDocuments();
    console.log(`📊 Cart collection accessible, ${cartCount} documents found`);
    
    res.json({
      mongoConnected: true,
      cartCollectionAccessible: true,
      usingFallbackUri: !process.env.MONGODB_URI,
      message: `Cart collection is accessible. Found ${cartCount} carts in database '${dbName}'.`
    });
    
  } catch (err) {
    console.error("❌ Cart health check error:", err);
    res.json({
      cartCollectionAccessible: false,
      mongoConnected: mongoose.connection.readyState === 1,
      error: err.message,
      connectionState: mongoose.connection.readyState,
      usingFallbackUri: !process.env.MONGODB_URI,
      message: "Cart collection test failed"
    });
  }
});

// Test email credentials endpoint
app.get("/api/test-email", async (req, res) => {
  try {
    console.log("🔍 Testing email credentials...");
    
    const credentials = await Credential.find();
    console.log("📧 Credentials in database:", credentials.length);
    
    if (!credentials || credentials.length === 0) {
      return res.json({
        success: false,
        error: "No email credentials found in database",
        collection: "bulkmail",
        message: "Please add email credentials to MongoDB bulkmail collection"
      });
    }

    const testTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: credentials[0].user,
        pass: credentials[0].pass,
      },
    });

    // Test connection
    await testTransporter.verify();
    
    res.json({
      success: true,
      message: "Email credentials are valid",
      email: credentials[0].user,
      passwordLength: credentials[0].pass ? credentials[0].pass.length : 0
    });
    
  } catch (error) {
    console.error("❌ Email test failed:", error);
    res.json({
      success: false,
      error: error.message,
      code: error.code,
      message: "Email credentials test failed"
    });
  }
});

// Add email credentials endpoint (for setup)
app.post("/api/setup-email", async (req, res) => {
  try {
    const { user, pass } = req.body;
    
    if (!user || !pass) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required"
      });
    }

    // Delete existing credentials
    await Credential.deleteMany({});
    
    // Add new credentials
    const newCredential = new Credential({ user, pass });
    await newCredential.save();
    
    console.log("✅ Email credentials saved successfully");
    
    res.json({
      success: true,
      message: "Email credentials saved successfully",
      email: user
    });
    
  } catch (error) {
    console.error("❌ Failed to save email credentials:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Chat API endpoints
// Get all messages for a session
app.get("/api/chat/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = await ChatMessage.find({ sessionId })
      .sort({ timestamp: 1 })
      .limit(100); // Limit to last 100 messages
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send a new message
app.post("/api/chat", async (req, res) => {
  try {
    const { message, sender, senderName, sessionId, userId } = req.body;
    
    if (!message || !sender || !sessionId) {
      return res.status(400).json({ error: "Missing required fields: message, sender, sessionId" });
    }

    const newMessage = new ChatMessage({
      message,
      sender, // 'user' or 'admin'
      senderName: senderName || (sender === 'admin' ? 'Admin' : 'Customer'),
      userId: userId || null, // Firebase UID for registered users
      sessionId,
      timestamp: new Date()
    });

    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all active chat sessions (for admin panel)
app.get("/api/chat-sessions", async (req, res) => {
  try {
    const sessions = await ChatMessage.aggregate([
      {
        $group: {
          _id: "$sessionId",
          lastMessage: { $last: "$message" },
          lastTimestamp: { $last: "$timestamp" },
          messageCount: { $sum: 1 },
          userId: { $last: "$userId" },
          senderName: { $last: "$senderName" },
          unreadCount: { 
            $sum: { 
              $cond: [{ $and: [{ $eq: ["$sender", "user"] }, { $eq: ["$isRead", false] }] }, 1, 0] 
            } 
          }
        }
      },
      { $sort: { lastTimestamp: -1 } }
    ]);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark messages as read
app.put("/api/chat/:sessionId/read", async (req, res) => {
  try {
    await ChatMessage.updateMany(
      { sessionId: req.params.sessionId, sender: 'user', isRead: false },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User Management Endpoints

// Register or update user (called when user signs up or logs in)
app.post("/api/users", async (req, res) => {
  try {
    const { userId, username, email } = req.body;
    
    if (!userId || !username || !email) {
      return res.status(400).json({ error: "Missing required fields: userId, username, email" });
    }

    const user = await User.findOneAndUpdate(
      { userId },
      { 
        username, 
        email, 
        lastActive: new Date() 
      },
      { 
        upsert: true, 
        new: true, 
        setDefaultsOnInsert: true 
      }
    );

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users (for admin panel)
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user role
app.put("/api/users/:userId/role", async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: "Role must be 'user' or 'admin'" });
    }

    const user = await User.findOneAndUpdate(
      { userId: req.params.userId },
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Order Management Endpoints

// Create a new order
app.post("/api/orders", async (req, res) => {
  try {
    const { userId, customerName, customerEmail, items, totalAmount, shippingAddress, paymentMethod } = req.body;
    
    if (!userId || !customerName || !customerEmail || !items || !totalAmount || !shippingAddress) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Calculate estimated delivery (7 days from now)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

    const newOrder = new Order({
      orderId,
      userId,
      customerName,
      customerEmail,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      estimatedDelivery,
      trackingNumber: `TRK${Date.now()}`
    });

    const savedOrder = await newOrder.save();
    
    // Send order confirmation email
    await sendOrderConfirmationEmail(savedOrder);
    
    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get orders for a specific user
app.get("/api/orders/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).sort({ orderDate: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all orders (for admin)
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ orderDate: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get specific order by orderId
app.get("/api/orders/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId });
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status (for admin)
app.put("/api/orders/:orderId/status", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order = await Order.findOneAndUpdate(
      { orderId },
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk email endpoint (from your mail project)
app.post("/sendmail", async (req, res) => {
  const { message, recipients } = req.body;

  if (!recipients || recipients.length === 0) {
    return res.json(false);
  }

  try {
    const data = await Credential.find();
    if (!data || data.length === 0) {
      return res.json(false);
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: data[0].user,
        pass: data[0].pass, // Gmail app password
      },
    });

    // Send emails one by one
    for (let i = 0; i < recipients.length; i++) {
      await transporter.sendMail({
        from: data[0].user,
        to: recipients[i],
        subject: "Message from Bulk Mail",
        text: message,
      });
    }

    console.log("All mails sent successfully ✅");
    res.json(true);

  } catch (error) {
    console.error("Error sending mail:", error);
    res.json(false);
  }
});

// Send order cancellation email endpoint
app.post("/api/send-cancellation-email", async (req, res) => {
  try {
    const { orderId, customerName, customerEmail, totalAmount, items, orderDate } = req.body;
    
    console.log("📧 Sending order cancellation email...");
    
    const credentials = await Credential.find();
    if (!credentials || credentials.length === 0) {
      console.log("❌ No email credentials found for cancellation email");
      return res.json({ success: false, error: "No email credentials configured" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: credentials[0].user,
        pass: credentials[0].pass,
      },
    });

    const cancellationEmailContent = `
Dear ${customerName},

We regret to inform you that your order has been cancelled.

Order Details:
Order ID: ${orderId}
Order Date: ${new Date(orderDate).toLocaleDateString()}
Total Amount: $${totalAmount.toFixed(2)}

Cancelled Items:
${items.map(item => `- ${item.title} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join('\n')}

Reason for Cancellation:
Your order has been cancelled by our admin team. This could be due to:
- Product unavailability
- Payment processing issues
- Inventory constraints
- Other operational reasons

What happens next:
- If you have already made a payment, a full refund will be processed within 3-5 business days
- You will receive a separate email confirmation once the refund is initiated
- You can place a new order anytime on our website

We sincerely apologize for any inconvenience caused. If you have any questions or concerns, please don't hesitate to contact our customer support team.

Thank you for your understanding.

Best regards,
Customer Service Team
Your E-commerce Store
    `;

    console.log("📤 Sending cancellation email to:", customerEmail);
    
    const result = await transporter.sendMail({
      from: credentials[0].user,
      to: customerEmail,
      subject: `Order Cancellation - ${orderId}`,
      text: cancellationEmailContent,
    });

    console.log("✅ Cancellation email sent successfully!");
    console.log("📧 Message ID:", result.messageId);
    
    res.json({ success: true, message: "Cancellation email sent successfully" });
    
  } catch (error) {
    console.error("❌ Error sending cancellation email:");
    console.error("Error type:", error.name);
    console.error("Error message:", error.message);
    res.json({ success: false, error: error.message });
  }
});

// PayHere payment notification endpoint
app.post("/api/payhere/notify", async (req, res) => {
  try {
    const {
      merchant_id,
      order_id,
      amount,
      currency,
      status_code,
      md5sig,
      custom_1, // userId
      custom_2, // domain
      method,
      status_message,
      card_holder_name,
      card_no,
      card_expiry
    } = req.body;

    console.log('PayHere notification received:', req.body);

    // Verify the hash for security
    const merchantSecret = "MTczMjUyMTQ3ODE0MTI5Njg5MzkyMTEyMjA2MDI2NDU3NDUw";
    const appId = "4OVyIPRBDwu4JFnJsiyj4a3D3";
    const appSecret = "4E1BAvC5UIL4ZCbWDIfItK49Z4CkZCF0N8W3jZn6NXjp";
    const crypto = require('crypto');
    
    const localMd5sig = crypto.createHash('md5')
      .update(merchant_id + order_id + amount + currency + status_code + crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase())
      .digest('hex')
      .toUpperCase();

    if (localMd5sig !== md5sig) {
      console.log('Invalid hash signature');
      return res.status(400).send('Invalid signature');
    }

    // Update order status based on payment status
    let orderStatus = 'pending';
    if (status_code === '2') {
      orderStatus = 'processing'; // Payment successful
    } else if (status_code === '-1' || status_code === '-2' || status_code === '-3') {
      orderStatus = 'cancelled'; // Payment failed/cancelled
    }

    // Update order in database
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: order_id },
      { 
        status: orderStatus,
        paymentStatus: status_code === '2' ? 'paid' : 'failed',
        paymentMethod: `PayHere - ${method}`,
        paymentDetails: {
          status_code,
          status_message,
          card_holder_name,
          card_no: card_no ? `****${card_no.slice(-4)}` : null,
          transaction_id: req.body.payment_id
        }
      },
      { new: true }
    );

    if (updatedOrder) {
      console.log(`Order ${order_id} updated with payment status: ${orderStatus}`);
      
      // Send status update email if payment successful
      if (status_code === '2') {
        const statusEmailContent = `
Dear ${updatedOrder.customerName},

Great news! Your payment has been successfully processed.

Order ID: ${updatedOrder.orderId}
Payment Status: Successful
Amount Paid: LKR ${amount}
Payment Method: ${method}

Your order is now being processed and will be shipped soon.

Thank you for your business!

Best regards,
Your E-commerce Team
        `;

        // Send status update email (optional)
        try {
          const credentials = await Credential.find();
          if (credentials && credentials.length > 0) {
            const nodemailer = require('nodemailer');
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: credentials[0].user,
                pass: credentials[0].pass,
              },
            });

            await transporter.sendMail({
              from: credentials[0].user,
              to: updatedOrder.customerEmail,
              subject: `Payment Confirmation - ${updatedOrder.orderId}`,
              text: statusEmailContent,
            });
          }
        } catch (emailError) {
          console.error('Failed to send payment confirmation email:', emailError);
        }
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('PayHere notification error:', error);
    res.status(500).send('Error processing notification');
  }
});

// PayHere return URL handler
app.get("/api/payhere/return", (req, res) => {
  const { order_id, status } = req.query;
  
  // Redirect to frontend with payment result
  if (status === 'success') {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-success?order=${order_id}`);
  } else {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-failed?order=${order_id}`);
  }
});

// SIMPLE PRODUCTS API - Always works
app.get("/api/products", async (req, res) => {
  try {
    console.log('📦 SIMPLE PRODUCTS API - Request received');
    
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.log("⚠️ MongoDB not connected, returning empty products array");
      return res.status(200).json({
        success: true,
        products: [],
        message: "MongoDB not connected, returning empty array"
      });
    }
    
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    console.log(`📦 API: Returning ${products.length} products`);
    
    res.status(200).json({
      success: true,
      products: products,
      count: products.length
    });
  } catch (err) {
    console.error('❌ Products API Error:', err);
    // Always return 200 with empty array to prevent frontend errors
    res.status(200).json({
      success: false,
      products: [],
      error: "Failed to load products",
      message: err.message
    });
  }
});

// Create a new product in MongoDB
app.post("/api/products", async (req, res) => {
  try {
    const { id, title, price, stock, category, image, description } = req.body || {};
    if (!title || typeof price !== "number") {
      return res.status(400).json({ error: "Missing required fields: title, price" });
    }
    
    const pid = String(id || `${title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`);
    
    const product = new Product({
      id: pid,
      title,
      price,
      stock: Number(stock || 0),
      category: category || (title ? title.split(" ")[0] : "General"),
      image: image || null,
      description: description || null,
      updatedAt: new Date()
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Product with this ID already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

// Update a product in MongoDB
app.put("/api/products/:id", async (req, res) => {
  try {
    const { title, price, stock, category, image, description } = req.body;
    const productId = String(req.params.id);
    
    const updatedProduct = await Product.findOneAndUpdate(
      { id: productId },
      { 
        title, 
        price, 
        stock: Number(stock || 0), 
        category, 
        image, 
        description,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Soft delete a product (set isActive to false)
app.delete("/api/products/:id", async (req, res) => {
  try {
    const productId = String(req.params.id);
    
    const deletedProduct = await Product.findOneAndUpdate(
      { id: productId },
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SIMPLE FLASH PRODUCTS API - Always works
app.get("/api/flash-products", async (req, res) => {
  try {
    console.log('⚡ SIMPLE FLASH PRODUCTS API - Request received');
    
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.log("⚠️ MongoDB not connected, returning empty flash products array");
      return res.status(200).json({
        success: true,
        flashProducts: [],
        message: "MongoDB not connected, returning empty array"
      });
    }
    
    const flashProducts = await FlashProduct.find({ isActive: true }).sort({ createdAt: -1 });
    console.log(`⚡ API: Returning ${flashProducts.length} flash products`);
    
    res.status(200).json({
      success: true,
      flashProducts: flashProducts,
      count: flashProducts.length
    });
  } catch (err) {
    console.error('❌ Flash Products API Error:', err);
    // Always return 200 with empty array to prevent frontend errors
    res.status(200).json({
      success: false,
      flashProducts: [],
      error: "Failed to load flash products",
      message: err.message
    });
  }
});

// Create a new flash product in MongoDB
app.post("/api/flash-products", async (req, res) => {
  try {
    const { id, title, price, stock, category, image, description, startsAt, endsAt, discount } = req.body || {};
    if (!title || typeof price !== "number") {
      return res.status(400).json({ error: "Missing required fields: title, price" });
    }
    
    const pid = String(id || `${title.replace(/\s+/g, '-').toLowerCase()}-flash-${Date.now()}`);
    
    const flashProduct = new FlashProduct({
      id: pid,
      title,
      price,
      stock: Number(stock || 0),
      category: category || (title ? title.split(" ")[0] : "General"),
      image: image || null,
      description: description || null,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
      discount: typeof discount === 'number' ? discount : null,
      updatedAt: new Date()
    });

    const savedFlashProduct = await flashProduct.save();
    res.status(201).json(savedFlashProduct);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Flash product with this ID already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

// Update a flash product in MongoDB
app.put("/api/flash-products/:id", async (req, res) => {
  try {
    const { title, price, stock, category, image, description, startsAt, endsAt, discount } = req.body;
    const productId = String(req.params.id);
    
    const updatedFlashProduct = await FlashProduct.findOneAndUpdate(
      { id: productId },
      { 
        title, 
        price, 
        stock: Number(stock || 0), 
        category, 
        image, 
        description,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
        discount: typeof discount === 'number' ? discount : null,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedFlashProduct) {
      return res.status(404).json({ error: "Flash product not found" });
    }

    res.json(updatedFlashProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Soft delete a flash product (set isActive to false)
app.delete("/api/flash-products/:id", async (req, res) => {
  try {
    const productId = String(req.params.id);
    
    const deletedFlashProduct = await FlashProduct.findOneAndUpdate(
      { id: productId },
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!deletedFlashProduct) {
      return res.status(404).json({ error: "Flash product not found" });
    }

    res.json({ success: true, message: "Flash product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Quick migration endpoint - clears MongoDB and re-imports from JSON
app.post("/api/quick-migrate", async (req, res) => {
  try {
    console.log("🔄 Starting quick migration (clearing existing data)...");
    
    // Clear existing products
    await Product.deleteMany({});
    await FlashProduct.deleteMany({});
    console.log("🗑️  Cleared existing products from MongoDB");
    
    // Migrate regular products
    const jsonProducts = readProducts();
    let migratedProducts = 0;
    
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
        migratedProducts++;
        console.log(`✅ Migrated product: ${product.title}`);
      } catch (err) {
        console.error(`❌ Error migrating product ${product.id}:`, err.message);
      }
    }
    
    // Migrate flash products
    const jsonFlashProducts = readFlash();
    let migratedFlashProducts = 0;
    
    for (const flashProduct of jsonFlashProducts) {
      try {
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
      } catch (err) {
        console.error(`❌ Error migrating flash product ${flashProduct.id}:`, err.message);
      }
    }
    
    console.log("✅ Quick migration completed!");
    console.log(`📦 Products: ${migratedProducts} migrated`);
    console.log(`⚡ Flash Products: ${migratedFlashProducts} migrated`);
    
    res.json({
      success: true,
      message: "Quick migration completed successfully",
      results: {
        products: { migrated: migratedProducts },
        flashProducts: { migrated: migratedFlashProducts }
      }
    });
    
  } catch (err) {
    console.error("❌ Quick migration failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// Migration endpoint to transfer JSON data to MongoDB
app.post("/api/migrate-products", async (req, res) => {
  try {
    console.log("🔄 Starting product migration from JSON to MongoDB...");
    
    // Migrate regular products
    const jsonProducts = readProducts();
    let migratedProducts = 0;
    let skippedProducts = 0;
    
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
        } else {
          skippedProducts++;
        }
      } catch (err) {
        console.error(`Error migrating product ${product.id}:`, err.message);
      }
    }
    
    // Migrate flash products
    const jsonFlashProducts = readFlash();
    let migratedFlashProducts = 0;
    let skippedFlashProducts = 0;
    
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
        } else {
          skippedFlashProducts++;
        }
      } catch (err) {
        console.error(`Error migrating flash product ${flashProduct.id}:`, err.message);
      }
    }
    
    console.log("✅ Migration completed!");
    console.log(`📦 Products: ${migratedProducts} migrated, ${skippedProducts} skipped`);
    console.log(`⚡ Flash Products: ${migratedFlashProducts} migrated, ${skippedFlashProducts} skipped`);
    
    res.json({
      success: true,
      message: "Migration completed successfully",
      results: {
        products: { migrated: migratedProducts, skipped: skippedProducts },
        flashProducts: { migrated: migratedFlashProducts, skipped: skippedFlashProducts }
      }
    });
    
  } catch (err) {
    console.error("❌ Migration failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// WhatsApp Cloud API integration
// Required env vars: WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, VERIFY_TOKEN
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "dev-verify-token";

// Send a WhatsApp message using Cloud API
// Body: { to: "+9470..." | "9470...", text: "message" }
app.post("/api/whatsapp/send", async (req, res) => {
  try {
    if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      return res.status(500).json({ error: "WhatsApp API not configured" });
    }
    const { to, text, template } = req.body;
    if (!to || (!text && !template)) {
      return res.status(400).json({ error: "Missing 'to' and 'text' or 'template'" });
    }

    const toNumber = String(to).replace(/[^\d]/g, "");
    const url = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    let payload;
    if (template) {
      // template: { name: string, language: { code: 'en_US' }, components?: [...] }
      payload = {
        messaging_product: "whatsapp",
        to: toNumber,
        type: "template",
        template,
      };
    } else {
      payload = {
        messaging_product: "whatsapp",
        to: toNumber,
        type: "text",
        text: { body: text },
      };
    }

    const resp = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    res.json({ success: true, data: resp.data });
  } catch (err) {
    const status = err.response?.status || 500;
    res.status(status).json({ error: err.response?.data || err.message });
  }
});

// ===== FEEDBACK API ENDPOINTS =====

// Submit customer feedback
app.post("/api/feedback", async (req, res) => {
  try {
    const { name, email, rating, feedback, submittedAt } = req.body;
    
    console.log('📝 NEW FEEDBACK SUBMISSION:', { name, email, rating });
    
    // Validation
    if (!name || !email || !rating || !feedback) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address"
      });
    }
    
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ MongoDB not connected');
      return res.status(503).json({
        success: false,
        message: "Database not available. Please try again later."
      });
    }
    
    // Create new feedback document
    const newFeedback = new Feedback({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      rating: Number(rating),
      feedback: feedback.trim(),
      submittedAt: submittedAt || new Date(),
      status: 'pending'
    });
    
    // Save to MongoDB
    const savedFeedback = await newFeedback.save();
    
    console.log('✅ Feedback saved successfully:', savedFeedback._id);
    console.log(`⭐ Rating: ${rating}/5 from ${name}`);
    
    res.status(201).json({
      success: true,
      message: "Thank you for your feedback!",
      feedbackId: savedFeedback._id
    });
    
  } catch (err) {
    console.error('❌ Feedback submission error:', err);
    res.status(500).json({
      success: false,
      message: "Failed to submit feedback. Please try again.",
      error: err.message
    });
  }
});

// Get all feedback (for admin or display)
app.get("/api/feedback", async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database not available"
      });
    }
    
    // Build query
    const query = status ? { status } : {};
    
    // Get feedback from MongoDB
    const feedbacks = await Feedback.find(query)
      .sort({ submittedAt: -1 })
      .limit(Number(limit));
    
    console.log(`📋 Retrieved ${feedbacks.length} feedback entries`);
    
    res.json({
      success: true,
      count: feedbacks.length,
      feedbacks
    });
    
  } catch (err) {
    console.error('❌ Get feedback error:', err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve feedback",
      error: err.message
    });
  }
});

// Cart API endpoints - Direct MongoDB connection
// SIMPLE GET CART - Always works
app.get("/api/cart/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`📦 SIMPLE GET CART - User: ${userId}`);
    
    // Get from memory first (always available)
    let userCart = simpleCart.get(userId);
    
    if (!userCart) {
      // Try MongoDB if available
      if (mongoose.connection.readyState === 1) {
        try {
          const mongoCart = await Cart.findOne({ userId });
          if (mongoCart) {
            userCart = {
              userId: mongoCart.userId,
              items: mongoCart.items,
              createdAt: mongoCart.createdAt,
              updatedAt: mongoCart.updatedAt
            };
            // Save to memory for faster access
            simpleCart.set(userId, userCart);
            console.log(`📦 Loaded cart from MongoDB: ${userCart.items.length} items`);
          }
        } catch (mongoErr) {
          console.log(`⚠️ MongoDB read failed:`, mongoErr.message);
        }
      }
      
      // Create empty cart if still not found
      if (!userCart) {
        userCart = { 
          userId, 
          items: [], 
          createdAt: new Date(),
          updatedAt: new Date()
        };
        simpleCart.set(userId, userCart);
        console.log(`🆕 Created new empty cart for user: ${userId}`);
      }
    } else {
      console.log(`📦 Found cart in memory: ${userCart.items.length} items`);
    }
    
    res.json({
      success: true,
      cart: userCart,
      itemCount: userCart.items.length
    });
    
  } catch (err) {
    console.error("❌ Get cart error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to get cart",
      message: err.message
    });
  }
});

// ENHANCED CART - Save complete product, user, and order details to MongoDB Atlas
app.post("/api/cart/add", async (req, res) => {
  try {
    const { userId, product, quantity = 1, userDetails } = req.body;
    
    console.log(`🛒 ENHANCED CART ADD - User: ${userId}, Product: ${product?.title}`);
    console.log(`📦 Product Details:`, JSON.stringify(product, null, 2));
    console.log(`👤 User Details:`, userDetails ? JSON.stringify(userDetails, null, 2) : 'Not provided');
    
    // Basic validation
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
      // Create new cart with user details
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
      // Update user details if provided
      if (userDetails) {
        cart.userDetails = { ...cart.userDetails, ...userDetails };
      }
    }
    
    // Calculate item subtotal
    const itemSubtotal = Number(product.price) * quantity;
    
    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity and subtotal
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].subtotal = cart.items[existingItemIndex].price * cart.items[existingItemIndex].quantity;
      console.log(`📝 Updated existing item: ${product.title}, new quantity: ${cart.items[existingItemIndex].quantity}`);
    } else {
      // Add new item with complete details
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
    const tax = subtotal * 0.1; // 10% tax
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
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
    
    // Save to MongoDB Atlas carts collection
    const savedCart = await cart.save();
    
    // IMPORTANT: Also update memory cache so GET endpoint returns correct data
    simpleCart.set(userId, {
      userId: savedCart.userId,
      items: savedCart.items,
      createdAt: savedCart.createdAt,
      updatedAt: savedCart.updatedAt
    });
    
    console.log(`✅ Cart saved to MongoDB Atlas 'carts' collection`);
    console.log(`💾 Cart also cached in memory for faster access`);
    console.log(`📊 Cart Summary: ${totalItems} items, ${totalQuantity} total quantity, $${total.toFixed(2)} total`);
    console.log(`💾 MongoDB Document ID: ${savedCart._id}`);
    
    res.status(201).json({
      success: true,
      cart: savedCart,
      message: `Added ${product.title} to cart`,
      summary: {
        itemsInCart: totalItems,
        totalQuantity: totalQuantity,
        totalAmount: total
      }
    });
    
  } catch (err) {
    console.error("❌ Cart add error:", err);
    console.error("Error details:", err.message);
    res.status(500).json({ 
      success: false,
      error: "Failed to add item to cart",
      message: err.message 
    });
  }
});

// Update item quantity in cart with order summary recalculation
app.put("/api/cart/update", async (req, res) => {
  try {
    const { userId, itemId, quantity } = req.body;
    
    console.log(`🔢 UPDATE QUANTITY - User: ${userId}, Item: ${itemId}, Quantity: ${quantity}`);
    
    if (!userId || !itemId || !quantity) {
      return res.status(400).json({ 
        success: false,
        error: "Missing userId, itemId, or quantity" 
      });
    }
    
    if (quantity < 1) {
      return res.status(400).json({ 
        success: false,
        error: "Quantity must be at least 1" 
      });
    }
    
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        success: false,
        error: "Database not connected" 
      });
    }
    
    // Find cart in MongoDB Atlas
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ 
        success: false,
        error: "Cart not found" 
      });
    }
    
    // Find and update item quantity
    const itemIndex = cart.items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ 
        success: false,
        error: "Item not found in cart" 
      });
    }
    
    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].subtotal = cart.items[itemIndex].price * quantity;
    
    // Recalculate order summary
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
    
    // Update memory cache
    simpleCart.set(userId, {
      userId: savedCart.userId,
      items: savedCart.items,
      createdAt: savedCart.createdAt,
      updatedAt: savedCart.updatedAt
    });
    
    console.log(`✅ Quantity updated - Item: ${itemId}, New quantity: ${quantity}`);
    console.log(`📊 Updated cart total: $${total.toFixed(2)}`);
    
    res.json({
      success: true,
      cart: savedCart,
      message: "Quantity updated successfully"
    });
    
  } catch (err) {
    console.error("❌ Update quantity error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to update quantity",
      message: err.message 
    });
  }
});

// Remove item from cart with order summary recalculation
app.delete("/api/cart/remove", async (req, res) => {
  try {
    const { userId, itemId } = req.body;
    
    console.log(`🗑️ ENHANCED REMOVE ITEM - User: ${userId}, Item: ${itemId}`);
    
    if (!userId || !itemId) {
      return res.status(400).json({ 
        success: false,
        error: "Missing userId or itemId" 
      });
    }
    
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        success: false,
        error: "Database not connected" 
      });
    }
    
    // Find cart in MongoDB Atlas
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ 
        success: false,
        error: "Cart not found" 
      });
    }
    
    // Remove item
    cart.items = cart.items.filter(item => item.id !== itemId);
    
    // Recalculate order summary
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
    
    // Update memory cache
    simpleCart.set(userId, {
      userId: savedCart.userId,
      items: savedCart.items,
      createdAt: savedCart.createdAt,
      updatedAt: savedCart.updatedAt
    });
    
    console.log(`✅ Item removed - ${savedCart.items.length} items remaining`);
    console.log(`📊 Updated cart total: $${total.toFixed(2)}`);
    
    res.json({
      success: true,
      cart: savedCart,
      message: "Item removed from cart"
    });
    
  } catch (err) {
    console.error("❌ Remove item error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to remove item",
      message: err.message 
    });
  }
});

// Clear entire cart with order summary reset
app.delete("/api/cart/clear", async (req, res) => {
  try {
    const { userId } = req.body;
    
    console.log(`🧹 ENHANCED CLEAR CART - User: ${userId}`);
    
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        error: "Missing userId" 
      });
    }
    
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        success: false,
        error: "Database not connected" 
      });
    }
    
    // Find cart in MongoDB Atlas
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ 
        success: false,
        error: "Cart not found" 
      });
    }
    
    // Clear all items
    cart.items = [];
    
    // Reset order summary
    cart.orderSummary = {
      totalItems: 0,
      totalQuantity: 0,
      subtotal: 0,
      tax: 0,
      shipping: 0,
      total: 0
    };
    
    cart.updatedAt = new Date();
    
    // Save to MongoDB
    const savedCart = await cart.save();
    
    // Update memory cache
    simpleCart.set(userId, {
      userId: savedCart.userId,
      items: savedCart.items,
      createdAt: savedCart.createdAt,
      updatedAt: savedCart.updatedAt
    });
    
    console.log(`✅ Cart cleared for user ${userId}`);
    console.log(`💾 Cart data saved to MongoDB carts collection`);
    
    res.json({
      success: true,
      cart: savedCart,
      message: "Cart cleared successfully"
    });
    
  } catch (err) {
    console.error("❌ Clear cart error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to clear cart",
      message: err.message 
    });
  }
});

// SIMPLE REMOVE ITEM - Always works
app.delete("/api/cart/:userId/item/:itemId", async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    
    console.log(`🗑️ SIMPLE REMOVE ITEM - User: ${userId}, Item: ${itemId}`);
    
    // Get cart from memory
    let userCart = simpleCart.get(userId);
    if (!userCart) {
      return res.status(404).json({ 
        success: false,
        error: "Cart not found" 
      });
    }
    
    // Remove item
    const originalLength = userCart.items.length;
    userCart.items = userCart.items.filter(item => item.id !== itemId);
    
    if (userCart.items.length === originalLength) {
      return res.status(404).json({ 
        success: false,
        error: "Item not found in cart" 
      });
    }
    
    userCart.updatedAt = new Date();
    
    // Save to memory
    simpleCart.set(userId, userCart);
    
    // Try to save to MongoDB if available
    if (mongoose.connection.readyState === 1) {
      try {
        const mongoCart = await Cart.findOne({ userId });
        if (mongoCart) {
          mongoCart.items = mongoCart.items.filter(item => item.id !== itemId);
          mongoCart.updatedAt = new Date();
          await mongoCart.save();
          console.log(`✅ Removed item from MongoDB`);
        }
      } catch (mongoErr) {
        console.log(`⚠️ MongoDB remove failed, but memory cart updated:`, mongoErr.message);
      }
    }
    
    console.log(`✅ Removed item ${itemId} from cart`);
    
    res.json({
      success: true,
      cart: userCart,
      message: `Removed item from cart`
    });
    
  } catch (err) {
    console.error("❌ Remove item error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to remove item",
      message: err.message 
    });
  }
});

// SIMPLE CLEAR CART - Always works
app.delete("/api/cart/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`🧹 SIMPLE CLEAR CART - User: ${userId}`);
    
    // Clear from memory
    let userCart = simpleCart.get(userId);
    if (userCart) {
      userCart.items = [];
      userCart.updatedAt = new Date();
      simpleCart.set(userId, userCart);
    } else {
      userCart = { 
        userId, 
        items: [], 
        createdAt: new Date(),
        updatedAt: new Date()
      };
      simpleCart.set(userId, userCart);
    }
    
    // Try to clear in MongoDB if available
    if (mongoose.connection.readyState === 1) {
      try {
        let mongoCart = await Cart.findOne({ userId });
        if (mongoCart) {
          mongoCart.items = [];
          mongoCart.updatedAt = new Date();
          await mongoCart.save();
          console.log(`✅ Cleared cart in MongoDB`);
        }
      } catch (mongoErr) {
        console.log(`⚠️ MongoDB clear failed, but memory cart cleared:`, mongoErr.message);
      }
    }
    
    console.log(`✅ Cart cleared for user ${userId}`);
    
    res.json({
      success: true,
      cart: userCart,
      message: "Cart cleared successfully"
    });
    
  } catch (err) {
    console.error("❌ Clear cart error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to clear cart",
      message: err.message 
    });
  }
});

// Webhook verification (GET) and receiver (POST)
app.get("/api/whatsapp/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

app.post("/api/whatsapp/webhook", (req, res) => {
  const body = req.body;
  // Basic logging of incoming messages/events for now
  try {
    console.log("📥 WhatsApp Webhook:", JSON.stringify(body, null, 2));
  } catch {}
  // TODO: handle messages and optionally forward to an admin UI or email/DB.
  res.sendStatus(200);
});

// For Vercel deployment, export the app instead of listening on a port
const PORT = 5000; // Force port 5000 for development

// Force development mode for local development
const isDevelopment = !process.env.VERCEL;

if (isDevelopment) {
  app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
    console.log(`🛒 Cart API available at: http://localhost:${PORT}/api/cart`);
    console.log(`🌐 CORS enabled for frontend: http://localhost:3000`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
} else {
  console.log('🚀 Running in production mode (Vercel)');
}

// Export for Vercel
module.exports = app;
