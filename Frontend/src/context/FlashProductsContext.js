import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { getApiUrl, API_CONFIG } from "../config/api";

const FlashProductsContext = createContext(null);

const defaultFlashProducts = [];

export function FlashProductsProvider({ children }) {
  const [flashProducts, setFlashProducts] = useState(defaultFlashProducts);

  // Load flash products from backend on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        console.log('🔄 SIMPLE FLASH PRODUCTS LOAD - Loading from backend...');
        const res = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.FLASH_PRODUCTS));
        const data = await res.json();
        
        console.log('⚡ Simple flash products response:', data);
        
        if (!cancelled) {
          // Handle new API response format
          if (data.success && Array.isArray(data.flashProducts)) {
            setFlashProducts(data.flashProducts);
            console.log(`⚡ Loaded ${data.flashProducts.length} flash products successfully`);
          } else if (Array.isArray(data)) {
            // Fallback for old format
            setFlashProducts(data);
            console.log(`⚡ Loaded ${data.length} flash products (legacy format)`);
          } else {
            setFlashProducts([]);
            console.log('⚡ No flash products loaded, using empty array');
          }
        }
      } catch (err) {
        console.error('❌ Simple flash products load error:', err);
        if (!cancelled) setFlashProducts([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Function to refresh flash products from backend
  const refreshFlashProducts = useCallback(async () => {
    try {
      console.log('🔄 SIMPLE FLASH PRODUCTS REFRESH');
      const res = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.FLASH_PRODUCTS));
      const data = await res.json();
      
      // Handle new API response format
      if (data.success && Array.isArray(data.flashProducts)) {
        setFlashProducts(data.flashProducts);
        console.log(`⚡ Refreshed ${data.flashProducts.length} flash products successfully`);
      } else if (Array.isArray(data)) {
        setFlashProducts(data);
        console.log(`⚡ Refreshed ${data.length} flash products (legacy format)`);
      } else {
        setFlashProducts([]);
        console.log('⚡ No flash products refreshed, using empty array');
      }
    } catch (err) {
      console.error('❌ Simple flash products refresh error:', err);
      setFlashProducts([]);
    }
  }, []);

  const addFlashProduct = useCallback(async ({ id, title, price, stock, category, image, imageFile, imageUrl, discount, startsAt, endsAt }) => {
    const pid = id || `${title}-${Date.now()}`;

    try {
      let resolvedImage = image || imageUrl || "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80&auto=format&fit=crop";

      const p = {
        id: String(pid),
        title: title || "Untitled",
        price: Number(price) || 0,
        stock: Number(stock ?? 0),
        category: category || (title ? title.split(" ")[0] : "General"),
        image: resolvedImage,
        discount: discount ? Number(discount) : null,
        startsAt: startsAt || null,
        endsAt: endsAt || null,
      };

      console.log('⚡ Adding flash product via context:', p);

      // Persist to backend
      const res = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.FLASH_PRODUCTS), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to save flash product: ${res.status}`);
      }
      const saved = await res.json();
      console.log('⚡ Flash product saved to backend:', saved);
      
      // Update local state with the new flash product
      setFlashProducts((prev) => {
        const updated = [...prev, saved];
        console.log('⚡ Updated flash products state:', updated.length, 'products');
        return updated;
      });

      // Also refresh from backend to ensure consistency across views (home/admin)
      await refreshFlashProducts();

      return saved;
    } catch (error) {
      console.error('❌ Failed to add flash product:', error);
      throw error;
    }
  }, [refreshFlashProducts]);

  const removeFlashProduct = useCallback(async (id) => {
    try {
      const res = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.FLASH_PRODUCTS)}/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to delete flash product: ${res.status}`);
      }

      setFlashProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Failed to delete flash product:', error);
      alert(`Failed to delete flash product: ${error.message}`);
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({ flashProducts, addFlashProduct, removeFlashProduct, setFlashProducts, refreshFlashProducts }),
    [flashProducts, addFlashProduct, removeFlashProduct, refreshFlashProducts]
  );

  return <FlashProductsContext.Provider value={value}>{children}</FlashProductsContext.Provider>;
}

export function useFlashProducts() {
  const ctx = useContext(FlashProductsContext);
  if (!ctx) throw new Error("useFlashProducts must be used within a FlashProductsProvider");
  return ctx;
}
