import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { getCurrentUser } from "../services/auth";

export default function ProductModal({ open, product, onClose, onBuyNow }) {
  const { addItem } = useCart();
  const currentUser = getCurrentUser();
  const isLoggedIn = !!currentUser?.userId;
  if (!open || !product) return null;

  const { id, title, price, image, category } = product;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-[#07080d]/80 backdrop-blur-md z-[70]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="fixed inset-0 z-[71] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <div className="bg-[#12141e] border border-[#1e2130] rounded-xl shadow-2xl max-w-lg w-full overflow-hidden text-[#e8eaf2]">
              <div className="flex flex-col sm:flex-row">
                {image ? (
                  <img src={image} alt={title} className="w-full sm:w-48 h-48 object-cover border-b sm:border-b-0 sm:border-r border-[#1e2130]" />
                ) : (
                  <div className="w-full sm:w-48 h-48 bg-[#0f1118] border-b sm:border-b-0 sm:border-r border-[#1e2130] flex items-center justify-center text-[#6b7094]">
                    No Image
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="font-bold text-lg font-syne text-[#e8eaf2] mb-1 line-clamp-2">{title}</h2>
                    {category && (
                      <div className="text-xs text-[#6c63ff] font-semibold tracking-wider uppercase mb-2">{category}</div>
                    )}
                    <div className="text-[#6c63ff] font-bold text-2xl mb-3">${Number(price).toFixed(2)}</div>
                    <div className="text-sm text-[#8a8fbb] mb-5 leading-relaxed">
                      High-quality product selected from the catalog. Enjoy modern features, exceptional durability, and a clean interface.
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-auto">
                    <motion.button
                      className={`px-4 py-2.5 rounded-lg text-sm font-semibold font-syne transition-all flex-1 text-center ${
                        isLoggedIn 
                          ? "bg-[#6c63ff] text-white hover:opacity-90 shadow-[0_0_12px_rgba(108,99,255,0.25)]" 
                          : "bg-[#1e2130] text-[#6b7094] border border-[#2e324d] cursor-not-allowed"
                      }`}
                      whileHover={isLoggedIn ? { scale: 1.02 } : {}}
                      whileTap={isLoggedIn ? { scale: 0.98 } : {}}
                      disabled={!isLoggedIn}
                      onClick={async () => {
                        if (!isLoggedIn) {
                          alert("Please sign in to add items to cart");
                          return;
                        }
                        
                        try {
                          console.log('🛒 Adding item to cart from modal:', { id, title, price, image });
                          const success = await addItem({ 
                            id, 
                            title, 
                            price: Number(price), 
                            image 
                          }, 1);
                          
                          if (success) {
                            console.log('✅ Item added to cart from modal successfully');
                            alert('✅ Item added to cart!');
                            onClose && onClose();
                          } else {
                            console.log('❌ Failed to add item to cart from modal');
                            alert('❌ Failed to add item to cart. Please try again.');
                          }
                        } catch (error) {
                          console.error('❌ Error adding item to cart from modal:', error);
                          alert('Failed to add item to cart: ' + error.message);
                        }
                      }}
                    >
                      {isLoggedIn ? "Add to Cart" : "Sign in"}
                    </motion.button>
                    <motion.button
                      className="px-4 py-2.5 rounded-lg text-sm bg-transparent text-[#00f2fe] border border-[#00f2fe]/30 font-semibold font-syne hover:bg-[#00f2fe]/10 transition-all flex-1 text-center"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={async () => {
                        try {
                          console.log('🛒 Buy Now clicked from modal:', { id, title, price, image });
                          const success = await addItem({ 
                            id, 
                            title, 
                            price: Number(price), 
                            image 
                          }, 1);
                          
                          if (success) {
                            console.log('✅ Item added to cart, redirecting to cart');
                            onClose && onClose();
                            onBuyNow && onBuyNow();
                          } else {
                            console.log('❌ Failed to add item for Buy Now');
                            alert('❌ Failed to add item to cart. Please try again.');
                          }
                        } catch (error) {
                          console.error('❌ Error with Buy Now from modal:', error);
                          alert('Failed to process Buy Now: ' + error.message);
                        }
                      }}
                    >
                      Buy Now
                    </motion.button>
                    <motion.button
                      className="px-3 py-2.5 rounded-lg text-sm bg-[#1e2130] border border-[#2e324d] text-[#e8eaf2] font-semibold hover:bg-[#25293c] transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onClose}
                    >
                      Close
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
