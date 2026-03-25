import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import auth from "../firebase";
import { API_BASE_URL_EXPORT } from '../config/api';

const CartContext = createContext();

// Use the correct backend API URL from config
const CART_API_BASE = API_BASE_URL_EXPORT;

const __DEV__ = process.env.NODE_ENV !== 'production';
if (__DEV__) {
  console.log('🔗 CartContext API Configuration:', {
    CART_API_BASE,
    environment: process.env.NODE_ENV,
    envApiUrl: process.env.REACT_APP_API_URL
  });
}

export function CartProvider({ children }) {
  // Initialize items from localStorage to prevent empty cart flash on refresh
  const [items, setItems] = useState(() => {
    try {
      const cached = localStorage.getItem('cart_items');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false); // Start as not loading
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Save items to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('cart_items', JSON.stringify(items));
    } catch (err) {
      console.error('Failed to save cart to localStorage:', err);
    }
  }, [items]);

  // Simple load cart (like loading orders) - defined with useCallback
  const loadCart = useCallback(async (userId) => {
    if (!userId) {
      console.warn('⚠️ No userId provided to loadCart');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (__DEV__) {
        console.log('📦 LOADING CART - User:', userId);
        console.log('🔗 API URL:', `${CART_API_BASE}/api/cart/${userId}`);
      }
      
      const response = await axios.get(`${CART_API_BASE}/api/cart/${userId}`);
      if (__DEV__) console.log('📊 Cart response status:', response.status);
      
      if (response.data.success && response.data.cart) {
        const cartItems = response.data.cart.items || [];
        setItems(cartItems);
        if (__DEV__) console.log(`✅ CART LOADED: ${cartItems.length} items`);
      } else {
        if (__DEV__) console.warn('⚠️ Cart response not successful or no cart data');
        setItems([]);
      }
    } catch (err) {
      console.error("❌ LOAD CART ERROR:", err);
      if (__DEV__) {
        console.error("❌ Error message:", err.message);
        console.error("❌ Error status:", err.response?.status);
      }
      
      // Don't clear items on error - keep existing cart
      // Only show error if it's a real problem
      if (err.response?.status === 404 || err.response?.status === 500) {
        if (__DEV__) console.log('⚠️ Cart not found or server error - initializing empty cart');
        setItems([]);
      } else {
        if (__DEV__) console.log('⚠️ Network error - keeping existing cart items');
      }
    } finally {
      setLoading(false);
      if (__DEV__) console.log('📦 Cart loading finished');
    }
  }, []);

  // Get current user and listen for auth changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (__DEV__) console.log('🔐 Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      
      if (firebaseUser) {
        try {
          // Map Firebase user to app user format
          const username = firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split("@")[0] : "User");
          const currentUser = {
            username,
            email: firebaseUser.email || "",
            userId: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            phoneNumber: firebaseUser.phoneNumber
          };
          
          if (__DEV__) console.log('👤 User authenticated:', currentUser.userId);
          setUser(currentUser);
          
          // Load cart immediately after user is set
          if (currentUser.userId) {
            if (__DEV__) console.log('📦 Loading cart for user:', currentUser.userId);
            await loadCart(currentUser.userId);
          }
        } catch (err) {
          console.error("Error getting current user:", err);
          setUser(null);
          setItems([]);
        }
      } else {
        if (__DEV__) console.log('👤 No user authenticated - clearing cart');
        setUser(null);
        setItems([]);
        setError(null);
        setLoading(false); // Ensure loading is false when no user
        // Clear localStorage when user logs out
        try {
          localStorage.removeItem('cart_items');
        } catch (err) {
          console.error('Failed to clear cart from localStorage:', err);
        }
      }
    });

    return () => unsubscribe();
  }, [loadCart]);

  // Enhanced add item with complete product and user details
  async function addItem(product, quantity = 1) {
    if (!user?.userId) {
      setError("Please sign in to add items to cart");
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      if (__DEV__) console.log('🛒 ADD TO CART:', { productId: product?.id, quantity });
      
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
      
      if (__DEV__) {
        console.log('📦 Sending product details:', productDetails);
        console.log('👤 Sending user details:', userDetails);
      }
      
      const response = await axios.post(`${CART_API_BASE}/api/cart/add`, {
        userId: user.userId,
        product: productDetails,
        quantity,
        userDetails
      });
      
      if (__DEV__) console.log('✅ Add to cart response success:', !!response.data?.success);
      
      if (response.data.success && response.data.cart) {
        setItems(response.data.cart.items || []);
        if (__DEV__) console.log(`🎉 Added ${product.title} to cart`);
        return true;
      } else {
        setError("Failed to add item");
        return false;
      }
    } catch (err) {
      console.error("❌ Add error:", err);
      if (__DEV__) {
        console.error("❌ Error details:", err.response?.data || err.message);
        console.error("❌ Request URL:", `${CART_API_BASE}/api/cart/add`);
      }
      
      let errorMessage = "Could not add item to cart";
      
      if (err.code === 'ERR_NETWORK') {
        errorMessage = `Network error: Cannot connect to ${CART_API_BASE}. Make sure backend is running.`;
      } else if (err.response) {
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
      } else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      alert(`❌ ${errorMessage}`);
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

    try {
      setLoading(true);
      setError(null);
      console.log('🔢 UPDATE QUANTITY:', itemId, quantity);
      
      const response = await axios.put(`${CART_API_BASE}/api/cart/update`, {
        userId: user.userId,
        itemId: itemId,
        quantity: quantity
      });
      
      console.log('✅ Update quantity response:', response.data);
      
      if (response.data.success && response.data.cart) {
        setItems(response.data.cart.items || []);
        console.log(`🔢 Updated quantity for item ${itemId}`);
      } else {
        setError("Failed to update quantity");
      }
    } catch (err) {
      console.error("❌ Update quantity error:", err);
      // Fallback: reload the cart
      await loadCart(user.userId);
    } finally {
      setLoading(false);
    }
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
