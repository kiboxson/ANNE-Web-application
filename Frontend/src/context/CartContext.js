import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { getCurrentUser } from "../services/auth";
import { API_BASE_URL_EXPORT, API_CONFIG } from "../config/api";
import auth from "../firebase";

const CartContext = createContext();

const CART_API_BASE_URL = API_BASE_URL_EXPORT;

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Get current user on mount and listen for auth changes
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      const mappedUser = firebaseUser ? {
        userId: firebaseUser.uid,
        email: firebaseUser.email,
        username: firebaseUser.displayName || firebaseUser.email
      } : null;
      setUser(mappedUser);
    });

    return () => unsubscribe();
  }, []);

  // Load cart from API when user changes
  useEffect(() => {
    if (user?.userId) {
      loadCartFromAPI(user.userId);
    } else {
      setItems([]);
      setError(null);
    }
  }, [user?.userId]);

  async function loadCartFromAPI(userId) {
    try {
      setLoading(true);
      setError(null);
      console.log('📦 SIMPLE LOAD CART - User:', userId);
      
      const response = await axios.get(
        `${CART_API_BASE_URL}${API_CONFIG.ENDPOINTS.CART_GET(userId)}`
      );
      
      console.log('✅ Simple cart loaded:', response.data);
      
      if (response.data.success && response.data.cart) {
        setItems(response.data.cart.items || []);
        console.log(`📦 Loaded ${response.data.cart.items.length} items`);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("❌ Simple cart load error:", err);
      setError("Could not load cart");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function addItem(product, quantity = 1) {
    if (!user?.userId) {
      setError("Please sign in to add items to cart");
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🛒 SIMPLE ADD TO CART:', product);
      
      const response = await axios.post(
        `${CART_API_BASE_URL}${API_CONFIG.ENDPOINTS.CART_ADD(user.userId)}`,
        { 
          product: {
            id: product.id,
            title: product.title,
            price: Number(product.price),
            image: product.image
          }, 
          quantity 
        }
      );
      
      console.log('✅ Simple add response:', response.data);
      
      if (response.data.success && response.data.cart) {
        setItems(response.data.cart.items || []);
        console.log(`🎉 Added ${product.title} to cart! Total items: ${response.data.cart.items.length}`);
        return true;
      } else {
        setError("Failed to add item");
        return false;
      }
    } catch (err) {
      console.error("❌ Simple add error:", err);
      setError("Could not add item to cart");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(itemId) {
    if (!user?.userId) {
      setError("Please sign in to manage cart");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete(
        `${CART_API_BASE_URL}${API_CONFIG.ENDPOINTS.CART_REMOVE(user.userId, itemId)}`
      );
      setItems(response.data.items || []);
    } catch (err) {
      console.error("❌ Remove item error:", err);
      setError("Failed to remove item");
    } finally {
      setLoading(false);
    }
  }

  async function clearCart() {
    if (!user?.userId) {
      setError("Please sign in to manage cart");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete(
        `${CART_API_BASE_URL}${API_CONFIG.ENDPOINTS.CART_CLEAR(user.userId)}`
      );
      setItems([]);
    } catch (err) {
      console.error("❌ Clear cart error:", err);
      setError("Failed to clear cart");
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
    count,
    total,
    loading,
    error,
    isLoggedIn: !!user?.userId,
    refreshCart: () => user?.userId && loadCartFromAPI(user.userId)
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
