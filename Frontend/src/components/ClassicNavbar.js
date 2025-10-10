import React from "react";
import { motion } from "framer-motion";
import img from "../assets/kiyu.png";
import { useCart } from "../context/CartContext";
import { Search, ShoppingBag, User, Phone, HelpCircle } from "lucide-react";
import "../styles/classic-navbar.css";

function ClassicNavbar({ user, onLoginClick, onSignupClick, onLogoutClick, searchValue, onSearchChange, onCartClick, onCommunityClick }) {
  const { count } = useCart();

  return (
    <>
      {/* Classic Top Bar */}
      <motion.div
        className="w-full bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 shadow-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center md:justify-between py-3 sm:py-2 text-gray-700 text-sm">
            {/* Left side - Contact info */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span className="font-medium">+94701269689</span>
              </div>
              <div className="text-gray-500">|</div>
              <span className="text-gray-600">Free shipping on orders over $50</span>
            </div>

            {/* User actions - Centered on mobile */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 flex-wrap">
              {user ? (
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-800 text-xs sm:text-sm">
                      Hi, {user.username || user.email.split('@')[0]}
                    </span>
                  </div>
                  <motion.button
                    onClick={onLogoutClick}
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-xs sm:text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Logout
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                  <motion.button
                    onClick={onLoginClick}
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-xs sm:text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Login
                  </motion.button>
                  <div className="text-gray-300 hidden sm:inline">|</div>
                  <motion.button
                    onClick={onSignupClick}
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-xs sm:text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign Up
                  </motion.button>
                </div>
              )}
              
              <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6">
                <motion.button 
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span className="font-medium text-xs sm:text-sm">Help</span>
                </motion.button>
                <motion.button 
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onCommunityClick}
                >
                  <Phone className="w-4 h-4" />
                  <span className="font-medium text-xs sm:text-sm">Contact</span>
                </motion.button>
                
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Classic Navigation */}
      <motion.div
        className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-lg"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-4 gap-3 md:gap-4 lg:gap-6 xl:gap-8">
            
            {/* Logo Section */}
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <img src={img} alt="Logo" className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20" />
            </motion.div>

            {/* Search Bar with Mobile Cart - Classic Style */}
            <div className="flex-1 max-w-2xl flex items-center gap-2">
              <div className="relative flex-1">
                <motion.div
                  className="relative"
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                >
                  <input
                    placeholder="Search products..."
                    className="w-full h-8 sm:h-12 pl-8 sm:pl-12 pr-4 border-2 border-gray-200 rounded-full bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200 font-medium text-sm sm:text-base"
                    value={searchValue}
                    onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                  />
                  <Search className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                </motion.div>
              </div>
              
              {/* Mobile Cart Button - Right of Search */}
              <motion.button
                className="md:hidden relative flex items-center gap-1 px-2 py-1 text-gray-600 hover:text-gray-900 transition-colors bg-gray-100 rounded-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCartClick}
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4" />
                  {count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1 py-0.5 font-bold min-w-[16px] text-center leading-none">
                      {count}
                    </span>
                  )}
                </div>
                <span className="font-medium text-xs">Cart</span>
              </motion.button>
            </div>

            {/* Desktop Cart Button - Near Search Bar */}
            <motion.div
              className="hidden md:flex relative cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCartClick}
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors shadow-lg">
                <ShoppingBag className="w-5 h-5" />
                <span className="font-medium">Cart</span>
                {count > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold min-w-[20px] text-center">
                    {count}
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

    </>
  );
}

export default ClassicNavbar;
