// Standalone Cart API Module
// This can be imported into index.js to ensure cart functionality works

const mongoose = require('mongoose');

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

// Get or create Cart model
let Cart;
try {
  Cart = mongoose.model('Cart');
} catch {
  Cart = mongoose.model('Cart', cartSchema);
}

// Cart API Routes
function setupCartRoutes(app) {
  
  // Add to cart
  app.post("/api/cart/add", async (req, res) => {
    try {
      const { userId, product, quantity = 1, userDetails } = req.body;
      
      console.log(`🛒 CART ADD - User: ${userId}, Product: ${product?.title}`);
      
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
          error: "Database not connected"
        });
      }
      
      // Find or create cart
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
          }
        });
      } else if (userDetails) {
        cart.userDetails = { ...cart.userDetails, ...userDetails };
      }
      
      // Check if item exists
      const existingItemIndex = cart.items.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Update existing item
        cart.items[existingItemIndex].quantity += quantity;
        cart.items[existingItemIndex].subtotal = cart.items[existingItemIndex].price * cart.items[existingItemIndex].quantity;
      } else {
        // Add new item
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
          subtotal: Number(product.price) * quantity
        });
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
      
      console.log(`✅ Cart saved - ID: ${savedCart._id}`);
      
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
  });
  
  // Get cart
  app.get("/api/cart/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      console.log(`📦 GET CART - User: ${userId}`);
      
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
  });
  
  // Remove from cart
  app.delete("/api/cart/remove", async (req, res) => {
    try {
      const { userId, productId } = req.body;
      
      console.log(`🗑️ REMOVE FROM CART - User: ${userId}, Product: ${productId}`);
      
      if (!userId || !productId) {
        return res.status(400).json({
          success: false,
          error: 'Missing userId or productId'
        });
      }
      
      const cart = await Cart.findOne({ userId });
      
      if (!cart) {
        return res.status(404).json({
          success: false,
          error: 'Cart not found'
        });
      }
      
      cart.items = cart.items.filter(item => item.id !== productId);
      
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
      await cart.save();
      
      return res.json({
        success: true,
        cart: cart,
        message: 'Item removed from cart'
      });
      
    } catch (error) {
      console.error("❌ Remove from cart error:", error);
      return res.status(500).json({
        success: false,
        error: 'Failed to remove item from cart',
        message: error.message
      });
    }
  });
  
  // Clear cart
  app.delete("/api/cart/clear", async (req, res) => {
    try {
      const { userId } = req.body;
      
      console.log(`🧹 CLEAR CART - User: ${userId}`);
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing userId'
        });
      }
      
      const cart = await Cart.findOne({ userId });
      
      if (!cart) {
        return res.json({
          success: true,
          message: 'Cart already empty'
        });
      }
      
      cart.items = [];
      cart.orderSummary = {
        totalItems: 0,
        totalQuantity: 0,
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0
      };
      cart.updatedAt = new Date();
      
      await cart.save();
      
      return res.json({
        success: true,
        cart: cart,
        message: 'Cart cleared'
      });
      
    } catch (error) {
      console.error("❌ Clear cart error:", error);
      return res.status(500).json({
        success: false,
        error: 'Failed to clear cart',
        message: error.message
      });
    }
  });
  
  console.log('✅ Cart routes registered');
}

module.exports = { setupCartRoutes, Cart };
