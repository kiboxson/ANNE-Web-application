import React, { useState } from "react";
import { motion } from "framer-motion";

export default function SideNav({ onHomeClick, onCartClick, onFiltersClick, onDealsClick, onProfileClick, onOrdersClick, onAdminClick, onCommunityClick, isAdmin = false }) {
  const [open, setOpen] = useState(false);

  const items = [
    { icon: "🏠", label: "Home", onClick: onHomeClick },
    { icon: "🛒", label: "Cart", onClick: onCartClick },
    { icon: "🔍", label: "Filters", onClick: onFiltersClick },
    { icon: "⚡", label: "Flash Deals", onClick: onDealsClick },
    { icon: "👤", label: "Profile", onClick: onProfileClick },
    { icon: "📦", label: "Orders", onClick: onOrdersClick },
    { icon: "👥", label: "Community", onClick: onCommunityClick },
  ];
  if (isAdmin) items.push({ icon: "⚙️", label: "Admin", onClick: onAdminClick });

  return (
    <>
      {/* Mobile Hamburger FAB */}
      <motion.button
        className="md:hidden fixed top-20 left-4 z-[60] w-10 h-10 bg-[#12141e] border border-[#1e2130] text-[#e8eaf2] rounded-full shadow-lg flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        aria-label="Open menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </motion.button>

      {/* Mobile Drawer */}
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="md:hidden fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="w-56 h-full bg-[#0f1118] border-r border-[#1e2130] p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1e2130]">
              <span className="font-syne font-bold text-[#6c63ff] text-lg">Menu</span>
              <button onClick={() => setOpen(false)} className="text-[#6b7094] hover:text-[#e8eaf2]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-1">
              {items.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#6b7094] hover:bg-[#161921] hover:text-[#e8eaf2] transition-colors text-left"
                  onClick={() => { item.onClick(); setOpen(false); }}
                >
                  <span>{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-12 shrink-0 bg-[#0f1118] border-r border-[#1e2130] sticky top-16 h-[calc(100vh-64px)] pt-4 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col items-center gap-1 px-1">
          {items.map((item) => (
            <motion.button
              key={item.label}
              title={item.label}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[#6b7094] hover:bg-[#161921] hover:text-[#e8eaf2] transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={item.onClick}
            >
              <span>{item.icon}</span>
            </motion.button>
          ))}
        </div>
      </aside>
    </>
  );
}
