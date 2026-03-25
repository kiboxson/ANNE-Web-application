import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useFlashProducts } from "../context/FlashProductsContext";
import { getCurrentUser } from "../services/auth";

// ⏳ Countdown Timer
function CountdownTimer({ endTime }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = endTime - now;
      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft("Offer Expired");
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <span className="text-sm font-bold" style={{ color: '#ff6584', background: 'rgba(255,101,132,.1)', padding: '4px 12px', borderRadius: '8px', border: '1px solid rgba(255,101,132,.3)' }}>
      ⏰ {timeLeft}
    </span>
  );
}

// 🔥 Flash Deal Card
function FlashDealCard({ image, title, price, stock, variants, onGrabDeal, isLoggedIn }) {
  return (
    <motion.div
      variants={variants}
      className="prod-card cursor-pointer"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <div className="prod-image" style={{ height: '160px' }}>
        {image ? (
          <motion.img src={image} alt={title} whileHover={{ scale: 1.08 }} transition={{ duration: 0.4 }} />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full gap-2" style={{ background: 'rgba(255,101,132,.08)' }}>
            <span className="text-3xl">⚡</span>
            <span className="text-xs font-syne font-bold uppercase tracking-widest" style={{ color: '#ff6584' }}>Flash Offer</span>
          </div>
        )}
        <div className="prod-badge" style={{ background: 'rgba(255,101,132,.9)' }}>DEAL ⚡</div>
      </div>

      <div className="prod-info">
        <div className="prod-cat" style={{ color: '#ff6584' }}>Limited Time Offer</div>
        <div className="prod-name">{title}</div>
        <div className="prod-price" style={{ color: '#ff6584' }}>${price}</div>

        <div className="w-full rounded-full h-1.5 mb-1" style={{ background: '#1e2130' }}>
          <div className="h-1.5 rounded-full" style={{ width: `${stock}%`, background: '#ff6584' }}></div>
        </div>
        <p className="text-xs mb-3" style={{ color: '#6b7094' }}>{stock}% Slots Left</p>

        <button
          className="add-to-cart-btn"
          style={isLoggedIn ? { borderColor: 'rgba(255,101,132,.4)', color: '#ff6584' } : { opacity: 0.5, cursor: 'not-allowed' }}
          onClick={() => {
            if (isLoggedIn) onGrabDeal && onGrabDeal();
            else alert("Please sign in to grab this deal");
          }}
          disabled={!isLoggedIn}
        >
          {isLoggedIn ? "⚡ Grab This Deal" : "Sign in to Grab"}
        </button>
      </div>
    </motion.div>
  );
}

// ⚡ Flash Deals Section
export default function FlashSalePage({ searchQuery = "", selectedCategories = [], priceRange = [0, 100000], onGrabDeal = () => {} }) {
  const { addItem } = useCart();
  const { flashProducts: items, refreshFlashProducts } = useFlashProducts();
  const currentUser = getCurrentUser();
  const isLoggedIn = !!currentUser?.userId;

  useEffect(() => {
    (async () => {
      try { await refreshFlashProducts(); } catch (e) {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saleEnd = new Date();
  saleEnd.setHours(saleEnd.getHours() + 2);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } }
  };
  const item = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const safeItems = Array.isArray(items) ? items : [];
  const q = searchQuery ? String(searchQuery).trim().toLowerCase() : "";
  const selCats = Array.isArray(selectedCategories) ? selectedCategories : [];

  const filtered = safeItems.filter((p) => {
    const matchesQuery = q ? (p.title || "").toLowerCase().includes(q) : true;
    const matchesCategory = selCats.length > 0 ? selCats.includes(p.category || p.title) : true;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <h2 className="text-2xl font-syne font-bold" style={{ color: '#ff6584' }}>⚡ Limited Time Deals</h2>
        <CountdownTimer endTime={saleEnd} />
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
        viewport={{ amount: 0.2 }}
        key={`fs-${selCats.sort().join(',')}-${q}`}
      >
        {safeItems.length === 0 ? (
          <div className="col-span-full text-center py-10" style={{ color: '#6b7094' }}>
            No flash deals available right now. Check back soon!
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-10" style={{ color: '#6b7094' }}>
            No deals found{q ? ` for "${searchQuery}"` : ""}.
          </div>
        ) : (
          filtered.map((p) => (
            <FlashDealCard
              key={p.id || `${p.title}-${p.price}`}
              variants={item}
              image={p.image}
              title={p.title}
              price={p.price}
              stock={p.stock || 80}
              isLoggedIn={isLoggedIn}
              onGrabDeal={async () => {
                try {
                  const success = await addItem({ id: p.id || p.title, title: p.title, price: Number(p.price), image: p.image }, 1);
                  if (success) onGrabDeal();
                  else alert("❌ Failed to add deal. Please try again.");
                } catch (error) {
                  alert("Failed to add: " + error.message);
                }
              }}
            />
          ))
        )}
      </motion.div>
    </div>
  );
}
