// Cart Routes - Moved from cart-only folder
const express = require('express');
const router = express.Router();
const { addToCart, getCart, removeFromCart, clearCart } = require('../controllers/cartController');

// Cart routes
router.post('/add', addToCart);           // POST /api/cart/add
router.get('/:userId', getCart);          // GET /api/cart/:userId
router.delete('/remove', removeFromCart); // DELETE /api/cart/remove
router.delete('/clear', clearCart);       // DELETE /api/cart/clear

module.exports = router;
