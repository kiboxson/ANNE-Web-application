import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_CONFIG, API_BASE_URL_EXPORT } from "../config/api";

// Use the proper API configuration from api.js
const CART_API_BASE_URL = API_BASE_URL_EXPORT;

console.log('🛒 CartContext API Configuration:', {
  environment: process.env.NODE_ENV,
  isProduction: process.env.NODE_ENV === 'production',
  apiBaseUrl: API_BASE_URL_EXPORT,
  cartApiUrl: CART_API_BASE_URL
});

const CartContext = createContext(null);

export function CartProvider({ children, user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load cart from API when user changes
  useEffect(() => {
    // Clear any previous errors when user changes
    setError(null);
    
    if (user?.userId) {
      loadCartFromAPI(user.userId);
    } else {
      // Clear cart when user logs out
      setItems([]);
    }
  }, [user?.userId]);

  // Load cart from localStorage for guest users (fallback)
  useEffect(() => {
    if (!user?.userId) {
      try {
        const raw = localStorage.getItem("guest_cart");
        const guestCart = raw ? JSON.parse(raw) : [];
        setItems(Array.isArray(guestCart) ? guestCart : []);
      } catch (e) {
        setItems([]);
      }
    }
  }, [user?.userId]);

  // Save guest cart to localStorage
  useEffect(() => {
    if (!user?.userId && items.length >= 0) {
      try {
        localStorage.setItem("guest_cart", JSON.stringify(items));
      } catch (e) {
        // ignore persistence errors
      }
    }
  }, [items, user?.userId]);

  async function loadCartFromAPI(userId) {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading cart from API for user:', userId);
      const response = await axios.get(`${CART_API_BASE_URL}${API_CONFIG.ENDPOINTS.CART(userId)}`);
      console.log('📦 Cart API response:', response.data);
      setItems(response.data.items || []);
      console.log('✅ Cart loaded successfully');
    } catch (err) {
      console.error("❌ Error loading cart:", err);
      console.error("❌ Error details:", err.response?.data || err.message);
      console.error("❌ Request URL:", err.config?.url);
      
      // More specific error messages
      let errorMessage = "Failed to load cart";
      if (err.code === 'ERR_NETWORK') {
        errorMessage = "Network error - please check your connection";
      } else if (err.response?.status === 404) {
        errorMessage = "Cart service not found";
      } else if (err.response?.status >= 500) {
        errorMessage = "Server error - please try again later";
      }
      
      setError(errorMessage);
      // Fallback to empty cart
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function addItem(product, qty = 1) {
    // Check if user is logged in - REQUIRED for add to cart
    if (!user || !user.userId) {
      console.log('❌ User not logged in - add to cart disabled');
      setError("Please sign in to add items to cart");
      return false;
    }
    
    if (!product || !product.id) {
      console.log('❌ Invalid product:', product);
      setError("Invalid product data");
      return false;
    }
    
    // Validate product data
    if (!product.title || typeof product.price !== 'number') {
      console.log('❌ Invalid product fields:', { title: product.title, price: product.price, type: typeof product.price });
      setError("Product must have valid title and price");
      return false;
    }
    
    console.log('🛒 Adding item to cart:', product);
    console.log('👤 Current user:', user);
    console.log('🔍 User has userId?', !!user?.userId);
    console.log('🔍 API Base URL:', API_BASE_URL_EXPORT);
    
    if (user?.userId) {
      // User is logged in - use API with enhanced error handling
      try {
        setLoading(true);
        setError(null);
        
        const apiUrl = `${CART_API_BASE_URL}${API_CONFIG.ENDPOINTS.CART_ADD(user.userId)}`;
        console.log('📡 Making API request to:', apiUrl);
        console.log('📡 Request payload:', { product, quantity: qty });
        
        const response = await axios.post(apiUrl, { product, quantity: qty });
        console.log('📦 Add to cart API response:', response.data);
        
        if (response.data && response.data.items) {
          setItems(response.data.items);
          console.log('✅ Item added to cart successfully via API');
          console.log('🎉 Success: Item added to cart!');
          return true;
        } else {
          console.log('⚠️ Unexpected API response format:', response.data);
          setError("Unexpected response from server");
          return false;
        }
      } catch (err) {
        console.error("❌ Error adding to cart:", err);
        console.error("❌ Error response:", err.response?.data);
        console.error("❌ Error status:", err.response?.status);
        console.error("❌ Request URL:", err.config?.url);
        console.error("❌ Request method:", err.config?.method);
        
        // Enhanced error handling - NO FALLBACK FOR LOGGED-IN USERS
        let errorMessage = "Failed to add item to cart";
        
        if (err.code === 'ERR_NETWORK') {
          errorMessage = "Network error - please check your connection and try again";
        } else if (err.response?.status === 503) {
          errorMessage = err.response?.data?.message || "Database service temporarily unavailable - please try again in a moment";
        } else if (err.response?.status === 404) {
          errorMessage = "Backend service not available - please check if the server is running";
        } else if (err.response?.status === 401 || err.response?.status === 403) {
          errorMessage = "Authentication issue - please log in again";
        } else if (err.response?.status === 500) {
          errorMessage = err.response?.data?.message || "Server error - please try again later";
        } else {
          errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Unknown error occurred";
        }
        
        setError(errorMessage);
        console.log('❌ Error: Failed to add item to cart');
        return false;
      } finally {
        setLoading(false);
      }
    }
  }

  async function removeItem(id) {
    if (!user?.userId) {
      console.log('❌ User not logged in - remove item disabled');
      setError("Please sign in to manage cart items");
      return;
    }
    
    // User is logged in - use API
    try {
      setLoading(true);
      setError(null);
      console.log('🗑️ Removing item from cart:', id);
      const response = await axios.delete(
        `${CART_API_BASE_URL}${API_CONFIG.ENDPOINTS.CART_REMOVE(user.userId, id)}`
      );
      console.log('📦 Remove item API response:', response.data);
      setItems(response.data.items || []);
      console.log('✅ Item removed from cart successfully');
    } catch (err) {
      console.error("❌ Error removing from cart:", err);
      console.error("❌ Error response:", err.response?.data);
      setError(`Failed to remove item from cart: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function setQuantity(id, qty) {
    if (!user?.userId) {
      console.log('❌ User not logged in - set quantity disabled');
      setError("Please sign in to manage cart items");
      return;
    }
    
    // User is logged in - use API
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Updating item quantity:', id, 'to', qty);
      const response = await axios.put(
        `${CART_API_BASE_URL}${API_CONFIG.ENDPOINTS.CART_UPDATE(user.userId, id)}`,
        { quantity: Math.max(1, qty) }
      );
      console.log('📦 Update quantity API response:', response.data);
      setItems(response.data.items || []);
      console.log('✅ Item quantity updated successfully');
    } catch (err) {
      console.error("❌ Error updating cart quantity:", err);
      console.error("❌ Error response:", err.response?.data);
      setError(`Failed to update item quantity: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function clearCart() {
    if (!user?.userId) {
      console.log('❌ User not logged in - clear cart disabled');
      setError("Please sign in to manage cart");
      return;
    }
    
    // User is logged in - use API
    try {
      setLoading(true);
      setError(null);
      console.log('🧹 Clearing cart for user:', user.userId);
      const response = await axios.delete(
        `${CART_API_BASE_URL}${API_CONFIG.ENDPOINTS.CART_CLEAR(user.userId)}`
      );
      console.log('📦 Clear cart API response:', response.data);
      setItems(response.data.items || []);
      console.log('✅ Cart cleared successfully');
    } catch (err) {
      console.error("❌ Error clearing cart:", err);
      console.error("❌ Error response:", err.response?.data);
      setError(`Failed to clear cart: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  }


  // Manual refresh function for cart
  async function refreshCart() {
    if (user?.userId) {
      await loadCartFromAPI(user.userId);
    }
  }

  const count = useMemo(() => items.reduce((acc, it) => acc + (it.quantity || 1), 0), [items]);
  const total = useMemo(() => items.reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0), [items]);

  const value = useMemo(
    () => ({ 
      items, 
      addItem, 
      removeItem, 
      setQuantity, 
      clearCart, 
      refreshCart,
      count, 
      total, 
      loading, 
      error,
      isLoggedIn: !!user?.userId
    }),
    [items, count, total, loading, error, user?.userId]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
