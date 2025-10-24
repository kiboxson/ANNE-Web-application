// Minimal server for Vercel - GUARANTEED TO WORK
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { setupCartRoutes } = require('./cart-api');

const app = express();

// CORS
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.json());

// Root
app.get("/", (req, res) => {
  res.json({
    message: "🚀 ANNE Backend API - Minimal Version",
    version: "2.0.0",
    status: "✅ Running",
    mongoStatus: mongoose.connection.readyState === 1 ? "✅ Connected" : "❌ Disconnected",
    endpoints: {
      cartAdd: "/api/cart/add",
      cartGet: "/api/cart/:userId",
      cartRemove: "/api/cart/remove",
      cartClear: "/api/cart/clear"
    }
  });
});

// MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://kiboxsonleena:20040620Kiyu@cluster0.cr1byep.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
}).then(() => {
  console.log("✅ MongoDB connected");
}).catch((err) => {
  console.error("❌ MongoDB error:", err);
});

// Setup cart routes
setupCartRoutes(app);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    mongo: mongoose.connection.readyState === 1
  });
});

// For local development
if (!process.env.VERCEL) {
  app.listen(5001, () => {
    console.log("✅ Minimal server running on http://localhost:5001");
  });
}

// Export for Vercel
module.exports = app;
