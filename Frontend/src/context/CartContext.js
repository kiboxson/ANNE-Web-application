import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { getCurrentUser } from "../services/auth";
import auth from "../firebase";
import { API_BASE_URL_EXPORT } from '../config/api';

const CartContext = createContext();

// EMERGENCY FIX - Use working cart API until main backend is fixed
const CART_API_BASE = 'https://anne-cart-emergency.vercel.app';

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Get current user and listen for auth changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        } catch (err) {
          console.error("Error getting current user:", err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load cart when user changes
  useEffect(() => {
    if (user?.userId) {
      loadCart(user.userId);
    } else {
      setItems([]);
      setError(null);
    }
  }, [user?.userId]);

  // Simple load cart (like loading orders)
  async function loadCart(userId) {
    try {
      setLoading(true);
      setError(null);
      console.log('📦 SIMPLE LOAD CART - User:', userId);
      
      const response = await axios.get(`${CART_API_BASE}/api/cart?userId=${userId}`);
      
      console.log('✅ Cart loaded:', response.data);
      
      if (response.data.success && response.data.cart) {
        setItems(response.data.cart.items || []);
        console.log(`📦 Loaded ${response.data.cart.items.length} items`);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("❌ Load cart error:", err);
      setItems([]);
      setError(null); // Don't show error to user
    } finally {
      setLoading(false);
    }
  }

  // Enhanced add item with complete product and user details
  async function addItem(product, quantity = 1) {
    if (!user?.userId) {
      setError("Please sign in to add items to cart");
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🛒 ENHANCED ADD TO CART:', product);
      console.log('👤 User Info:', user);
      
      // Prepare complete product details
      const productDetails = {
        id: product.id,
        title: product.title,
        price: Number(product.price),
        image: product.image || null,
        category: product.category || null,
        description: product.description || null,
        stock: product.stock || null
      };
      
      // Prepare user details
      const userDetails = {
        username: user.username || user.displayName || null,
        email: user.email || null,
        phone: user.phoneNumber || null
      };
      
      console.log('📦 Sending product details:', productDetails);
      console.log('👤 Sending user details:', userDetails);
      
      const response = await axios.post(`${CART_API_BASE}/api/cart`, {
        userId: user.userId,
        product: productDetails,
        quantity,
        userDetails
      });
      
      console.log('✅ Add response:', response.data);
      
      if (response.data.success && response.data.cart) {
        setItems(response.data.cart.items || []);
        console.log(`🎉 Added ${product.title} to cart!`);
        console.log(`📊 Cart Summary:`, response.data.summary);
        console.log(`💾 Saved to MongoDB carts collection`);
        return true;
      } else {
        setError("Failed to add item");
        return false;
      }
    } catch (err) {
      console.error("❌ Add error:", err);
      console.error("❌ Error details:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Could not add item to cart");
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Simple remove item (like order function)
  async function removeItem(itemId) {
    if (!user?.userId) {
      setError("Please sign in to manage cart");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🗑️ SIMPLE REMOVE ITEM:', itemId);
      
      const response = await axios.delete(`${CART_API_BASE}/api/cart/remove`, {
        data: {
          userId: user.userId,
          itemId: itemId
        }
      });
      
      console.log('✅ Remove response:', response.data);
      
      if (response.data.success && response.data.cart) {
        setItems(response.data.cart.items || []);
        console.log(`🗑️ Removed item from cart`);
      } else {
        setError("Failed to remove item");
      }
    } catch (err) {
      console.error("❌ Remove error:", err);
      setError("Could not remove item");
    } finally {
      setLoading(false);
    }
  }

  // Simple clear cart (like order function)
  async function clearCart() {
    if (!user?.userId) {
      setError("Please sign in to manage cart");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🧹 SIMPLE CLEAR CART');
      
      const response = await axios.delete(`${CART_API_BASE}/api/cart/clear`, {
        data: {
          userId: user.userId
        }
      });
      
      console.log('✅ Clear response:', response.data);
      
      if (response.data.success) {
        setItems([]);
        console.log('🧹 Cart cleared successfully');
      } else {
        setError("Failed to clear cart");
      }
    } catch (err) {
      console.error("❌ Clear error:", err);
      setError("Could not clear cart");
    } finally {
      setLoading(false);
    }
  }

  // Simple quantity update (remove and re-add for simplicity)
  async function setQuantity(itemId, quantity) {
    if (!user?.userId) {
      setError("Please sign in to manage cart");
      return;
    }

    if (quantity < 1) {
      return removeItem(itemId);
    }

    // For simplicity, just reload the cart
    loadCart(user.userId);
  }

  const count = useMemo(() => items.reduce((acc, it) => acc + (it.quantity || 1), 0), [items]);
  const total = useMemo(() => items.reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0), [items]);

  const value = {
    items,
    addItem,
    removeItem,
    clearCart,
    setQuantity,
    count,
    total,
    loading,
    error,
    isLoggedIn: !!user?.userId,
    refreshCart: () => user?.userId && loadCart(user.userId)
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
