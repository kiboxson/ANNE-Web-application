// Cart Model - Moved from cart-only folder
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

// Create and export the Cart model
const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
