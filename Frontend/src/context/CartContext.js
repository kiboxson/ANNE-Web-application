import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_CONFIG, API_BASE_URL_EXPORT } from "../config/api";

const CartContext = createContext(null);

export function CartProvider({ children, user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load cart from API when user changes
  useEffect(() => {
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
      const response = await axios.get(`${API_BASE_URL_EXPORT}${API_CONFIG.ENDPOINTS.CART(userId)}`);
      setItems(response.data.items || []);
    } catch (err) {
      console.error("Error loading cart:", err);
      setError("Failed to load cart");
      // Fallback to empty cart
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function addItem(product, qty = 1) {
    if (!product || !product.id) {
      console.log('❌ Invalid product:', product);
      return;
    }
    
    console.log('🛒 Adding item to cart:', product);
    console.log('👤 Current user:', user);
    console.log('🔍 User has userId?', !!user?.userId);
    
    if (user?.userId) {
      // User is logged in - use API
      try {
        setLoading(true);
        setError(null);
        const response = await axios.post(
          `${API_BASE_URL_EXPORT}${API_CONFIG.ENDPOINTS.CART_ADD(user.userId)}`,
          { product, quantity: qty }
        );
        setItems(response.data.items || []);
        console.log('✅ Item added to cart successfully via API');
        // Simple success feedback for now
        console.log('🎉 Success: Item added to cart!');
      } catch (err) {
        console.error("❌ Error adding to cart:", err);
        setError("Failed to add item to cart");
        console.log('❌ Error: Failed to add item to cart');
      } finally {
        setLoading(false);
      }
    } else {
      // Guest user - use local state
      setItems((prev) => {
        const idx = prev.findIndex((p) => p.id === product.id);
        if (idx !== -1) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], quantity: (copy[idx].quantity || 1) + qty };
          return copy;
        }
        return [
          ...prev,
          {
            id: product.id,
            title: product.title,
            price: Number(product.price) || 0,
            image: product.image || null,
            quantity: qty,
          },
        ];
      });
      console.log('✅ Item added to guest cart successfully');
      console.log('🎉 Success: Item added to guest cart!');
    }
  }

  async function removeItem(id) {
    if (user?.userId) {
      // User is logged in - use API
      try {
        setLoading(true);
        setError(null);
        const response = await axios.delete(
          `${API_BASE_URL_EXPORT}${API_CONFIG.ENDPOINTS.CART_REMOVE(user.userId, id)}`
        );
        setItems(response.data.items || []);
      } catch (err) {
        console.error("Error removing from cart:", err);
        setError("Failed to remove item from cart");
      } finally {
        setLoading(false);
      }
    } else {
      // Guest user - use local state
      setItems((prev) => prev.filter((p) => p.id !== id));
    }
  }

  async function setQuantity(id, qty) {
    if (user?.userId) {
      // User is logged in - use API
      try {
        setLoading(true);
        setError(null);
        const response = await axios.put(
          `${API_BASE_URL_EXPORT}${API_CONFIG.ENDPOINTS.CART_UPDATE(user.userId, id)}`,
          { quantity: Math.max(1, qty) }
        );
        setItems(response.data.items || []);
      } catch (err) {
        console.error("Error updating cart quantity:", err);
        setError("Failed to update item quantity");
      } finally {
        setLoading(false);
      }
    } else {
      // Guest user - use local state
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, quantity: Math.max(1, qty) } : p)));
    }
  }

  async function clearCart() {
    if (user?.userId) {
      // User is logged in - use API
      try {
        setLoading(true);
        setError(null);
        const response = await axios.delete(
          `${API_BASE_URL_EXPORT}${API_CONFIG.ENDPOINTS.CART_CLEAR(user.userId)}`
        );
        setItems(response.data.items || []);
      } catch (err) {
        console.error("Error clearing cart:", err);
        setError("Failed to clear cart");
      } finally {
        setLoading(false);
      }
    } else {
      // Guest user - use local state
      setItems([]);
    }
  }

  // Transfer guest cart to user cart when user logs in
  async function transferGuestCart(userId) {
    if (items.length > 0) {
      try {
        setLoading(true);
        // Add each guest cart item to user's cart
        for (const item of items) {
          await axios.post(
            `${API_BASE_URL_EXPORT}${API_CONFIG.ENDPOINTS.CART_ADD(userId)}`,
            { 
              product: {
                id: item.id,
                title: item.title,
                price: item.price,
                image: item.image
              }, 
              quantity: item.quantity 
            }
          );
        }
        // Clear guest cart from localStorage
        localStorage.removeItem("guest_cart");
        // Reload cart from API
        await loadCartFromAPI(userId);
      } catch (err) {
        console.error("Error transferring guest cart:", err);
        setError("Failed to transfer cart items");
      } finally {
        setLoading(false);
      }
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
      transferGuestCart,
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
