// Cart Controller - Moved from cart-only folder
const Cart = require('../models/Cart');

// Add to cart
async function addToCart(req, res) {
  const { userId, product, quantity = 1, userDetails } = req.body;
  
  console.log(`🛒 BACKEND CART CONTROLLER - Add to cart: User ${userId}, Product: ${product?.title}`);
  
  try {
    // Validation
    if (!userId || !product || !product.id || !product.title || !product.price) {
      return res.status(400).json({ 
        success: false,
        error: "Missing required fields: userId, product (id, title, price)" 
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
    
    console.log(`✅ Backend Cart Controller - Cart saved: ${savedCart._id}`);
    
    return res.status(201).json({
      success: true,
      cart: savedCart,
      message: `Added ${product.title} to cart via Backend Controller`,
      summary: {
        itemsInCart: totalItems,
        totalQuantity: totalQuantity,
        totalAmount: total
      }
    });
    
  } catch (error) {
    console.error('❌ Backend Cart Controller - Add error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Get cart
async function getCart(req, res) {
  const { userId } = req.params;
  
  console.log(`📦 BACKEND CART CONTROLLER - Get cart: User ${userId}`);
  
  try {
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
    console.error('❌ Backend Cart Controller - Get error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Remove from cart
async function removeFromCart(req, res) {
  const { userId, productId } = req.body;
  
  console.log(`🗑️ BACKEND CART CONTROLLER - Remove: User ${userId}, Product ${productId}`);
  
  try {
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
    console.error('❌ Backend Cart Controller - Remove error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Clear cart
async function clearCart(req, res) {
  const { userId } = req.body;
  
  console.log(`🧹 BACKEND CART CONTROLLER - Clear cart: User ${userId}`);
  
  try {
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing userId'
      });
    }
    
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
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
    
    console.log(`✅ Backend Cart Controller - Cart cleared for user ${userId}`);
    
    return res.json({
      success: true,
      cart: cart,
      message: 'Cart cleared successfully'
    });
    
  } catch (error) {
    console.error('❌ Backend Cart Controller - Clear error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

module.exports = {
  addToCart,
  getCart,
  removeFromCart,
  clearCart
};
