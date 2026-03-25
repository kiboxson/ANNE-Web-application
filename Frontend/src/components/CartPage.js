import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import PayHereCheckout from "./PayHereCheckout";

export default function CartPage({ onBack }) {
  const { items, setQuantity, removeItem, clearCart, total, loading, error, isLoggedIn, refreshCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    if (isLoggedIn && refreshCart) {
      refreshCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const hasItems = items && items.length > 0;

  const handleCheckoutSuccess = (order) => {
    alert(`Order placed successfully! Order ID: ${order.orderId}`);
    clearCart();
    setShowCheckout(false);
    onBack();
  };

  const handleCheckoutCancel = () => {
    setShowCheckout(false);
  };

  if (showCheckout) {
    return (
      <PayHereCheckout
        cartItems={items}
        totalAmount={total}
        onSuccess={handleCheckoutSuccess}
        onCancel={handleCheckoutCancel}
      />
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pt-20 sm:pt-24 bg-[#07080d] min-h-[calc(100vh-64px)] font-dmsans text-[#e8eaf2]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-syne font-bold text-[#e8eaf2]">Your Order</h1>
        <div className="flex items-center gap-3">
          <motion.button
            className="px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            style={{ background: '#161921', border: '1px solid #1e2130', color: '#6b7094' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBack}
          >
            Browse Packages
          </motion.button>
          {hasItems && (
            <motion.button
              className="px-4 py-2 rounded-lg bg-[#ff6584]/10 text-[#ff6584] hover:bg-[#ff6584]/20 border border-[#ff6584]/30 font-medium transition-colors text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={clearCart}
            >
              Clear Cart
            </motion.button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-[#ff6584]/10 border border-[#ff6584]/30 text-[#ff6584] px-4 py-3 rounded-lg mb-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold font-syne">Cart Error:</span>
              {refreshCart && (
                <motion.button
                  className="px-3 py-1 bg-[#ff6584] text-white rounded hover:opacity-90 text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={refreshCart}
                  disabled={loading}
                >
                  {loading ? "Retrying..." : "Retry"}
                </motion.button>
              )}
            </div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center text-[#6b7094] py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6c63ff]"></div>
          <p className="mt-4 font-medium">Loading your cart...</p>
        </div>
      )}

      {!loading && !hasItems ? (
        <div className="text-center py-20 bg-[#12141e] border border-[#1e2130] rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
          {isLoggedIn ? (
            <div>
              <div className="text-5xl mb-4">🛒</div>
              <p className="text-xl font-syne font-bold text-[#e8eaf2] mb-2">Your cart is empty</p>
              <p className="text-[#6b7094]">Looks like you haven't added anything yet.</p>
              <button 
                className="mt-6 px-6 py-2.5 bg-[#6c63ff] text-white rounded-lg font-medium hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(108,99,255,0.3)]"
                onClick={onBack}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div>
              <div className="text-5xl mb-4">🔒</div>
              <p className="text-xl font-syne font-bold text-[#e8eaf2] mb-2">Please sign in to use cart</p>
              <p className="text-[#6b7094] max-w-sm mx-auto">Sign in to add items to your cart and save them for later.</p>
            </div>
          )}
        </div>
      ) : !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {items.map((it) => (
              <div key={it.id} className="flex flex-col sm:flex-row items-center gap-4 bg-[#12141e] border border-[#1e2130] rounded-2xl p-4 sm:p-5 transition-all hover:border-[#6c63ff]">
                
                <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-[#0f1118] rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                  {it.image ? (
                    <img src={it.image} alt={it.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl text-[#6b7094]">📦</span>
                  )}
                </div>
                
                <div className="flex-1 text-center sm:text-left w-full">
                  <div className="font-syne font-bold text-[#e8eaf2] text-lg mb-1">{it.title}</div>
                  <div className="text-[#6c63ff] font-bold">${it.price.toFixed(2)}</div>
                </div>

                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-4 sm:mt-0 gap-4 sm:gap-0">
                  <div className="flex items-center gap-3 sm:mb-3">
                    <label className="text-sm font-medium text-[#6b7094]">Qty</label>
                    <input
                      type="number"
                      min={1}
                      value={it.quantity}
                      onChange={(e) => setQuantity(it.id, Number(e.target.value) || 1)}
                      className="w-16 bg-[#0f1118] border border-[#1e2130] rounded-lg px-2 py-1 text-sm text-[#e8eaf2] focus:outline-none focus:border-[#6c63ff] text-center"
                    />
                  </div>
                  
                  <div className="flex items-center gap-4 sm:gap-0">
                    <div className="font-syne font-bold text-lg sm:hidden">${(it.price * it.quantity).toFixed(2)}</div>
                    <motion.button
                      className="text-[#ff6584] hover:text-[#ff6584]/80 text-sm font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => removeItem(it.id)}
                    >
                      Remove
                    </motion.button>
                  </div>
                </div>
                
                {/* Total per item on desktop */}
                <div className="hidden sm:block w-24 text-right">
                  <div className="font-syne font-bold text-lg">${(it.price * it.quantity).toFixed(2)}</div>
                </div>

              </div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div className="bg-[#12141e] border border-[#1e2130] rounded-2xl p-6 h-fit sticky top-[80px] shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
            <h2 className="text-xl font-syne font-bold mb-6 text-[#e8eaf2]">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between text-[#6b7094]">
                <span>Subtotal</span>
                <span className="text-[#e8eaf2]">${total.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-[#6b7094]">
                <span>Shipping</span>
                <span className="text-sm">Calculated at checkout</span>
              </div>
            </div>
            
            <div className="h-[1px] bg-[#1e2130] w-full mb-6"></div>
            
            <div className="flex items-center justify-between font-syne font-bold text-xl mb-8 text-[#e8eaf2]">
              <span>Total</span>
              <span className="text-[#43e97b]">${total.toFixed(2)}</span>
            </div>
            
            <motion.button
              className="w-full px-4 py-3.5 rounded-xl bg-[#6c63ff] text-white font-syne font-bold text-sm shadow-[0_0_20px_rgba(108,99,255,0.3)] hover:opacity-90"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCheckout(true)}
            >
              Proceed to Checkout
            </motion.button>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#6b7094]">
              <span>🔒</span>
              <span>Secure Encrypted Checkout</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
