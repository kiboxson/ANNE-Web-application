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
    /\.vercel\.app$/, // All Vercel domains
    /\.netlify\.app$/, // All Netlify domains (if needed)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
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
    version: "1.0.0",
    endpoints: {
      health: "/api/health/db",
      products: "/api/products",
      flashProducts: "/api/flash-products",
      orders: "/api/orders",
      chat: "/api/chat",
      users: "/api/users",
      email: "/api/test-email"
    },
    documentation: "Visit the API endpoints above for functionality"
  });
});

// --- MongoDB Atlas connection ---
const MONGODB_URI = "mongodb+srv://kiboxsonleena:20040620Kiyu@cluster0.cr1byep.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(MONGODB_URI, {
    // options recommended for Mongoose 8+
    dbName: "passkey",
  })
  .then(async () => {
    console.log("✅ Connected to MongoDB Atlas");
    // Test the connection with a ping
    await mongoose.connection.db.admin().ping();
    console.log("✅ Pinged your deployment. You successfully connected to MongoDB!");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
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

// Get all products from MongoDB
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    console.log(`📦 API: Returning ${products.length} products`);
    res.json(products);
  } catch (err) {
    console.error('❌ API Error:', err);
    res.status(500).json({ error: err.message });
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

// Flash products API - Get all flash products from MongoDB
app.get("/api/flash-products", async (req, res) => {
  try {
    const flashProducts = await FlashProduct.find({ isActive: true }).sort({ createdAt: -1 });
    console.log(`⚡ API: Returning ${flashProducts.length} flash products`);
    res.json(flashProducts);
  } catch (err) {
    console.error('❌ Flash Products API Error:', err);
    res.status(500).json({ error: err.message });
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

app.listen(5000, () => console.log("✅ Backend running on http://localhost:5000"));
