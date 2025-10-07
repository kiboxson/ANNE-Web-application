import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import storageService from "../services/storage";
import { getApiUrl, API_CONFIG } from "../config/api";

const ProductsContext = createContext(null);

const defaultProducts = [];

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(defaultProducts);

  // Load products from backend on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        console.log('🔄 Loading products from backend...');
        const res = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS));
        if (!res.ok) throw new Error(`Failed to load products: ${res.status}`);
        const data = await res.json();
        console.log('📦 Products loaded from backend:', data.length, 'products');
        console.log('Products data:', data);
        if (!cancelled) setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Function to refresh products from backend
  const refreshProducts = useCallback(async () => {
    try {
      const res = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS));
      if (!res.ok) throw new Error(`Failed to load products: ${res.status}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
      console.log('Products refreshed:', data.length, 'products loaded');
    } catch (err) {
      console.error('Failed to refresh products:', err);
    }
  }, []);

  const addProduct = useCallback(async ({ id, title, price, stock, category, image, imageFile, imageUrl }) => {
    const pid = id || `${title}-${Date.now()}`;

    // If we have an image file, upload it to Firebase Storage
    const processImageUpload = async () => {
      if (imageFile instanceof File) {
        try {
          // Validate the image file
          const validation = storageService.validateImageFile(imageFile);
          if (!validation.isValid) {
            throw new Error(validation.error);
          }

          // Upload to Firebase Storage
          const imageUrl = await storageService.uploadProductImage(imageFile, pid);
          return imageUrl;
        } catch (error) {
          console.error('Image upload failed:', error);
          throw error;
        }
      }

      // If we have an imageUrl, use it directly
      if (imageUrl) {
        return imageUrl;
      }

      // If we have an image (already processed), use it
      if (image) {
        return image;
      }

      // Fallback to default image
      return "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80&auto=format&fit=crop";
    };

    try {
      const resolvedImage = await processImageUpload();

      const p = {
        id: String(pid),
        title: title || "Untitled",
        price: Number(price) || 0,
        stock: Number(stock ?? 0),
        category: category || (title ? title.split(" ")[0] : "General"),
        image: resolvedImage,
      };

      // Persist to backend
      const res = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to save product: ${res.status}`);
      }
      const saved = await res.json();
      console.log('Product saved to backend:', saved);
      
      // Update local state with the new product
      setProducts((prev) => {
        const updated = [...prev, saved];
        console.log('Updated products state:', updated.length, 'products');
        return updated;
      });
      
      // Also refresh from backend to ensure consistency
      setTimeout(() => refreshProducts(), 500);
    } catch (error) {
      console.error('Failed to add product:', error);
      alert(`Failed to add product: ${error.message}`);
      throw error;
    }
  }, [refreshProducts]);

  const removeProduct = useCallback(async (id) => {
    // Optimistically remove from UI after backend confirms
    try {
      const res = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS)}/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to delete product: ${res.status}`);
      }

      setProducts((prev) => {
        const toRemove = prev.find((p) => p.id === id);
        if (toRemove && toRemove.image && typeof toRemove.image === "string") {
          if (toRemove.image.startsWith("blob:")) {
            try { URL.revokeObjectURL(toRemove.image); } catch (_) {}
          }
        }
        return prev.filter((p) => p.id !== id);
      });
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert(`Failed to delete product: ${error.message}`);
      throw error;
    }
  }, []);

  const value = useMemo(() => ({ products, addProduct, removeProduct, setProducts, refreshProducts }), [products, addProduct, removeProduct, refreshProducts]);

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within a ProductsProvider");
  return ctx;
}
