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
        console.log('🔄 Loading flash products from backend...');
        const res = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.FLASH_PRODUCTS));
        console.log('⚡ Flash products API response status:', res.status);
        if (!res.ok) throw new Error(`Failed to load flash products: ${res.status}`);
        const data = await res.json();
        console.log('⚡ Flash products loaded from backend:', data.length, 'products');
        console.log('Flash products raw data:', data);
        if (!cancelled) {
          setFlashProducts(Array.isArray(data) ? data : []);
          console.log('⚡ Flash products state updated');
        }
      } catch (err) {
        console.error('❌ Failed to load flash products:', err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Function to refresh flash products from backend
  const refreshFlashProducts = useCallback(async () => {
    try {
      const res = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.FLASH_PRODUCTS));
      if (!res.ok) throw new Error(`Failed to load flash products: ${res.status}`);
      const data = await res.json();
      setFlashProducts(Array.isArray(data) ? data : []);
      console.log('Flash products refreshed:', data.length, 'products loaded');
    } catch (err) {
      console.error('Failed to refresh flash products:', err);
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
