import React, { useState } from "react";
import { motion } from "framer-motion";

export default function SideNav({ onHomeClick, onCartClick, onFiltersClick, onDealsClick, onProfileClick, onOrdersClick, onAdminClick, isAdmin = false }) {
  const [collapsed, setCollapsed] = useState(true);

  const Item = ({ label, onClick, children }) => (
    <motion.button
      className={`w-full flex items-center ${collapsed ? "justify-center" : "justify-start"} gap-2 px-1.5 py-1.5 rounded-md hover:bg-[white] hover:text-black text-white/90 cursor-pointer`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      title={collapsed ? label : undefined}
    >
      <span className="inline-flex items-center justify-center">{children}</span>
      {!collapsed && <span className="text-xs truncate">{label}</span>}
    </motion.button>
  );

  return (
    <>
      {/* Mobile floating action button */}
      <motion.button
        className="md:hidden fixed top-36 left-4 z-[60] w-10 h-10 bg-black/90 text-white rounded-full shadow-lg flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </motion.button>

      {/* Mobile overlay sidebar */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="md:hidden fixed inset-0 z-[55] bg-black/50"
          onClick={() => setCollapsed(true)}
        >
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="w-32 h-full bg-black/95 text-white p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button
                onClick={() => setCollapsed(true)}
                className="text-white hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              <Item label="Home" onClick={() => { onHomeClick(); setCollapsed(true); }}>
                🏠
              </Item>
              <Item label="Cart" onClick={() => { onCartClick(); setCollapsed(true); }}>
                🛒
              </Item>
              <Item label="Filters" onClick={() => { onFiltersClick(); setCollapsed(true); }}>
                🔍
              </Item>
              <Item label="Flash Deals" onClick={() => { onDealsClick(); setCollapsed(true); }}>
                ⚡
              </Item>
              <Item label="Profile" onClick={() => { onProfileClick(); setCollapsed(true); }}>
                👤
              </Item>
              <Item label="Orders" onClick={() => { onOrdersClick(); setCollapsed(true); }}>
                📦
              </Item>
              {isAdmin && (
                <Item label="Admin" onClick={() => { onAdminClick(); setCollapsed(true); }}>
                  ⚙️
                </Item>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden md:flex md:flex-col ${collapsed ? "md:w-12" : "md:w-44"} shrink-0 bg-[black]/95 text-white max-h-[50vh] sticky top-52 pt-2 rounded-md overflow-y-auto`}>
        <div className="px-1.5 sticky top-0 bg-[black]/95 z-10">
          <motion.button
            className={`w-full ${collapsed ? "justify-center" : "justify-between"} flex items-center gap-2 px-1.5 py-1.5 rounded-md hover:bg-[white] hover:text-black text-white/90 cursor-pointer`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            {!collapsed && <span className="text-xs">Menu</span>}
          </motion.button>
        </div>
        <div className="px-1.5 pb-2 space-y-1">
          <Item label="Home" onClick={onHomeClick}>🏠</Item>
          <Item label="Cart" onClick={onCartClick}>🛒</Item>
          <Item label="Filters" onClick={onFiltersClick}>🔍</Item>
          <Item label="Flash Deals" onClick={onDealsClick}>⚡</Item>
          <Item label="Profile" onClick={onProfileClick}>👤</Item>
          <Item label="Orders" onClick={onOrdersClick}>📦</Item>
          {isAdmin && <Item label="Admin" onClick={onAdminClick}>⚙️</Item>}
        </div>
      </aside>
    </>
  );
}
