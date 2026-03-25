import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react"; // for ratings
import { useCart } from "../context/CartContext";
import ProductModal from "./ProductModal";
import { useProducts } from "../context/ProductsContext";
import { getCurrentUser } from "../services/auth";

// Local product assets are not available; use images provided by context or external URLs

function ProductCard({ image, title, price, category, rating, discount, variants, onAdd, onView, onBuyNow, isLoggedIn }) {
  return (
    <motion.div
      variants={variants}
      className="prod-card cursor-pointer"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 200 }}
      onClick={onView}
    >
      <div className="prod-image">
        <motion.img
          src={image}
          alt={title}
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.5 }}
        />
        {discount && (
          <div className="prod-badge">
            {discount}% OFF
          </div>
        )}
      </div>

      <div className="prod-info">
        <div className="prod-cat">{category || 'General'}</div>
        <div className="prod-name">{title}</div>
        <div className="prod-price">${price}</div>
        
        <div className="flex gap-2 mt-auto">
          <button
            className="add-to-cart-btn flex-1"
            onClick={(e) => { 
              e.stopPropagation(); 
              if (isLoggedIn) {
                onAdd && onAdd();
              } else {
                alert("Please sign in to add items to cart");
              }
            }}
          >
            {isLoggedIn ? "Add to Cart" : "Sign in to Add"}
          </button>
          <button
            className="add-to-cart-btn !bg-[#43e97b]/10 !text-[#43e97b] hover:!bg-[#43e97b] hover:!text-[#07080d] !border-[#43e97b]/30"
            style={{ width: 'auto', padding: '10px 14px' }}
            title="Buy Now"
            onClick={(e) => { e.stopPropagation(); onBuyNow && onBuyNow(); }}
          >
            Buy Now
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Main Products Section
export default function ProductsSection({ searchQuery = "", selectedCategories = [], priceRange = [0, 1000], onBuyNow = () => {} }) {
  const { products: remoteProducts } = useProducts(); // Use ProductsContext instead of local state
  const { addItem } = useCart(); // Use addItem from CartContext
  const [selectedProduct, setSelectedProduct] = useState(null);
  const currentUser = getCurrentUser();
  const isLoggedIn = !!currentUser?.userId;

  // Debug: Log products when they change
  useEffect(() => {
    console.log('🌟 Featured Products - Products updated:', remoteProducts?.length || 0, 'products');
    console.log('Products data:', remoteProducts);
  }, [remoteProducts]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.07, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Section Title */}
      <h1 className="text-2xl font-syne font-bold text-center mb-8 text-[#e8eaf2]">
        Store Catalog
      </h1>

      {/* Grid */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
        whileInView="show"
        viewport={{ amount: 0.2 }}
        key={`pd-${(Array.isArray(selectedCategories)?selectedCategories:[]).slice().sort().join(',')}-${searchQuery?String(searchQuery).trim().toLowerCase():''}-${(priceRange||[])[0]}-${(priceRange||[])[1]}`}
      >
        {(() => {
          const q = searchQuery ? String(searchQuery).trim().toLowerCase() : "";
          const selCats = Array.isArray(selectedCategories) ? selectedCategories : [];
          let [minPrice, maxPrice] = priceRange;
          // Normalize price bounds: treat non-positive max as infinity; swap if min>max
          const effectiveMin = Number.isFinite(minPrice) ? Math.max(0, minPrice) : 0;
          let effectiveMax = Number.isFinite(maxPrice) ? maxPrice : Infinity;
          if (!effectiveMax || effectiveMax <= 0) effectiveMax = Infinity;
          let minB = effectiveMin, maxB = effectiveMax;
          if (minB > maxB) {
            const t = minB; minB = maxB; maxB = t;
          }
          const hasCategoryFilter = selCats.length > 0;

          // Use products from ProductsContext
          const products = remoteProducts || [];
          
          const normalizedProducts = products.map((p) => ({
            key: p.id || p.title,
            id: String(p.id || p.title),
            title: p.title,
            category: p.category || p.title,
            price: Number(p.price) || 0,
            image: p.image || "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80&auto=format&fit=crop",
            meta: p,
          }));

          const activeFilters = !!q || hasCategoryFilter || minB > 0 || maxB !== Infinity;
          const filtered = normalizedProducts.filter((item) => {
            const matchesQuery = q ? (item.title || "").toLowerCase().includes(q) : true;
            const matchesCategory = hasCategoryFilter ? selCats.includes(item.category) : true;
            const matchesPrice = item.price >= minB && item.price <= maxB;
            return matchesQuery && matchesCategory && matchesPrice;
          });

          const hasResults = filtered.length > 0;
          if (!hasResults) {
            // If there are no active filters, show the full list as a safety net
            if (!activeFilters) {
              return normalizedProducts.map((item) => (
                <ProductCard
                  key={item.key}
                  variants={itemVariants}
                  image={item.image}
                  category={item.category}
                  title={item.title}
                  price={item.price}
                  rating={4}
                  discount={null}
                  isLoggedIn={isLoggedIn}
                  onAdd={async () => {
                    try {
                      console.log('🛒 Adding item to cart:', item);
                      const success = await addItem({ 
                        id: item.id || item.key, 
                        title: item.title, 
                        price: Number(item.price), 
                        image: item.image 
                      }, 1);
                      
                      if (success) {
                        console.log('✅ Item added to cart successfully');
                        alert('✅ Item added to cart!');
                      } else {
                        console.log('❌ Failed to add item to cart');
                        alert('❌ Failed to add item to cart. Please try again.');
                      }
                    } catch (error) {
                      console.error('❌ Error adding item to cart:', error);
                      alert('Failed to add item to cart: ' + error.message);
                    }
                  }}
                  onView={() => setSelectedProduct(item)}
                  onBuyNow={() => {
                    try {
                      console.log('Buy Now clicked for item:', item);
                      onBuyNow();
                      console.log('✅ Redirecting to cart');
                    } catch (error) {
                      console.error('❌ Error with Buy Now:', error);
                      alert('Failed to process Buy Now: ' + error.message);
                    }
                  }}
                />
              ));
            }
            return (
              <div className="col-span-full text-center text-gray-500 py-10">
                No products found{q ? ` for "${searchQuery}"` : ""}.
              </div>
            );
          }
          return filtered.map((item) => (
            <ProductCard
              key={item.key}
              variants={itemVariants}
              image={item.image}
              category={item.category}
              title={item.title}
              price={item.price}
              rating={4}
              discount={null}
              isLoggedIn={isLoggedIn}
              onAdd={async () => {
                try {
                  console.log('🛒 Adding item to cart:', item);
                  const success = await addItem({ 
                    id: item.id || item.key, 
                    title: item.title, 
                    price: Number(item.price), 
                    image: item.image 
                  }, 1);
                  
                  if (success) {
                    console.log('✅ Item added to cart successfully');
                    alert('✅ Item added to cart!');
                  } else {
                    console.log('❌ Failed to add item to cart');
                    alert('❌ Failed to add item to cart. Please try again.');
                  }
                } catch (error) {
                  console.error('❌ Error adding item to cart:', error);
                  alert('Failed to add item to cart: ' + error.message);
                }
              }}
              onView={() => setSelectedProduct(item)}
              onBuyNow={() => {
                try {
                  console.log('Buy Now clicked for item:', item);
                  onBuyNow();
                  console.log('✅ Redirecting to cart');
                } catch (error) {
                  console.error('❌ Error with Buy Now:', error);
                  alert('Failed to process Buy Now: ' + error.message);
                }
              }}
            />
          ));
        })()}
      </motion.div>
      <ProductModal
        open={!!selectedProduct}
        product={selectedProduct ? { id: selectedProduct.id || selectedProduct.key, title: selectedProduct.title, price: selectedProduct.price, image: selectedProduct.image, category: selectedProduct.category } : null}
        onClose={() => setSelectedProduct(null)}
        onBuyNow={() => {
          try {
            console.log('Buy Now clicked from modal for product:', selectedProduct);
            onBuyNow();
            console.log('✅ Redirecting to cart from modal');
          } catch (error) {
            console.error('❌ Error with Buy Now from modal:', error);
            alert('Failed to process Buy Now: ' + error.message);
          }
        }}
      />
    </div>
  );
}
