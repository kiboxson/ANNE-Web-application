import React, { useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import ProductModal from "./ProductModal";
import { useProducts } from "../context/ProductsContext";
import { getCurrentUser } from "../services/auth";

const CATEGORY_COLORS = {
  "E-Commerce": "#ff6584",
  "Portfolio": "#6c63ff",
  "Business": "#43e97b",
  "Blog": "#febc2e",
  "Landing Page": "#6c63ff",
  "default": "#6c63ff",
};

// Website Package Card
function PackageCard({ image, title, category, price, discount, variants, onAdd, onView, onBuyNow, isLoggedIn }) {
  const accent = CATEGORY_COLORS[category] || CATEGORY_COLORS["default"];

  return (
    <motion.div
      variants={variants}
      className="prod-card cursor-pointer"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 200 }}
      onClick={onView}
    >
      <div className="prod-image" style={{ height: '180px' }}>
        {image ? (
          <motion.img src={image} alt={title} whileHover={{ scale: 1.08 }} transition={{ duration: 0.5 }} />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full gap-2" style={{ background: `${accent}10` }}>
            <span className="text-4xl">🌐</span>
            <span className="text-xs font-syne font-bold uppercase tracking-widest" style={{ color: accent }}>{category || 'Website'}</span>
          </div>
        )}
        {discount && <div className="prod-badge">{discount}% OFF</div>}
      </div>

      <div className="prod-info">
        <div className="prod-cat" style={{ color: accent }}>{category || 'Website Package'}</div>
        <div className="prod-name">{title}</div>
        <div className="prod-price">${price}</div>

        <div className="flex gap-2 mt-auto">
          <button
            className="add-to-cart-btn flex-1"
            onClick={(e) => {
              e.stopPropagation();
              if (isLoggedIn) onAdd && onAdd();
              else alert("Please sign in to order a package");
            }}
          >
            {isLoggedIn ? "Add to Order" : "Sign in to Order"}
          </button>
          <button
            className="add-to-cart-btn"
            style={{ width: 'auto', padding: '10px 14px', background: `${accent}15`, color: accent, borderColor: `${accent}40` }}
            title="Buy Now"
            onClick={(e) => { e.stopPropagation(); onBuyNow && onBuyNow(); }}
          >
            Order Now
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProductsSection({ searchQuery = "", selectedCategories = [], priceRange = [0, 100000], onBuyNow = () => {} }) {
  const { products: remoteProducts } = useProducts();
  const { addItem } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const currentUser = getCurrentUser();
  const isLoggedIn = !!currentUser?.userId;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const q = searchQuery ? String(searchQuery).trim().toLowerCase() : "";
  const selCats = Array.isArray(selectedCategories) ? selectedCategories : [];
  let [minPrice, maxPrice] = priceRange;
  const effectiveMin = Number.isFinite(minPrice) ? Math.max(0, minPrice) : 0;
  let effectiveMax = Number.isFinite(maxPrice) ? maxPrice : Infinity;
  if (!effectiveMax || effectiveMax <= 0) effectiveMax = Infinity;
  if (effectiveMin > effectiveMax) [minPrice, maxPrice] = [effectiveMax, effectiveMin];

  const products = (remoteProducts || []).map((p) => ({
    key: p.id || p.title,
    id: String(p.id || p.title),
    title: p.title,
    category: p.category || "Website",
    price: Number(p.price) || 0,
    image: p.image || "",
    meta: p,
  }));

  const filtered = products.filter((item) => {
    const matchesQuery = q ? item.title.toLowerCase().includes(q) : true;
    const matchesCategory = selCats.length > 0 ? selCats.includes(item.category) : true;
    const matchesPrice = item.price >= effectiveMin && item.price <= effectiveMax;
    return matchesQuery && matchesCategory && matchesPrice;
  });

  const display = filtered.length > 0 ? filtered : products;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-syne font-bold text-center mb-2 text-[#e8eaf2]">All Website Packages</h2>
      <p className="text-center text-[#6b7094] text-sm mb-8">Custom-built websites from our catalog. Every order includes source code &amp; support.</p>

      {display.length === 0 ? (
        <div className="text-center text-[#6b7094] py-16 bg-[#12141e] border border-[#1e2130] rounded-2xl">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-syne font-bold text-[#e8eaf2] mb-1">No packages found</p>
          <p className="text-sm">Try a different search or filter.</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
          key={`${selCats.join(',')}-${q}`}
        >
          {display.map((item) => (
            <PackageCard
              key={item.key}
              variants={itemVariants}
              image={item.image}
              title={item.title}
              category={item.category}
              price={item.price}
              discount={null}
              isLoggedIn={isLoggedIn}
              onAdd={async () => {
                try {
                  const success = await addItem({ id: item.id, title: item.title, price: Number(item.price), image: item.image }, 1);
                  if (success) alert('✅ Package added to your order!');
                  else alert('❌ Failed to add package. Please try again.');
                } catch (error) {
                  alert('Failed to add package: ' + error.message);
                }
              }}
              onView={() => setSelectedProduct(item)}
              onBuyNow={() => { onBuyNow(); }}
            />
          ))}
        </motion.div>
      )}

      <ProductModal
        open={!!selectedProduct}
        product={selectedProduct ? { id: selectedProduct.id, title: selectedProduct.title, price: selectedProduct.price, image: selectedProduct.image, category: selectedProduct.category } : null}
        onClose={() => setSelectedProduct(null)}
        onBuyNow={() => { onBuyNow(); }}
      />
    </div>
  );
}
