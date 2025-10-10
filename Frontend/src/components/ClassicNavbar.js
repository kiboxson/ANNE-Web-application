import React from "react";
import { motion } from "framer-motion";
import img from "../assets/kiyu.png";
import { useCart } from "../context/CartContext";
import { Search, ShoppingBag, User, Phone, HelpCircle } from "lucide-react";
import "../styles/classic-navbar.css";

function ClassicNavbar({ user, onLoginClick, onSignupClick, onLogoutClick, searchValue, onSearchChange, onCartClick, onCommunityClick }) {
  const { count } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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
          <div className="flex items-center justify-between py-2 text-gray-700 text-sm">
            {/* Left side - Contact info */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span className="font-medium">+94701269689</span>
              </div>
              <div className="text-gray-500">|</div>
              <span className="text-gray-600">Free shipping on orders over $50</span>
            </div>

            {/* Right side - User actions */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-800 hidden sm:inline">
                      Welcome, {user.username || user.email.split('@')[0]}
                    </span>
                  </div>
                  <motion.button
                    onClick={onLogoutClick}
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Logout
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={onLoginClick}
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Login
                  </motion.button>
                  <div className="text-gray-300">|</div>
                  <motion.button
                    onClick={onSignupClick}
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign Up
                  </motion.button>
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <motion.button 
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">Help</span>
                </motion.button>
                <motion.button 
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onCommunityClick}
                >
                  <Phone className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">Contact</span>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            
            {/* Logo Section */}
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <img src={img} alt="Logo" className="w-12 h-12 sm:w-20 sm:h-20 ml-8 " />
              
            </motion.div>

            {/* Search Bar - Classic Style */}
            <div className="flex-1 max-w-2xl mx-4 hidden md:block">
              <div className="relative">
                <motion.div
                  className="relative"
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                >
                  <input
                    placeholder="Search for premium products..."
                    className="w-full h-12 pl-12 pr-4 border-2 border-gray-200 rounded-full bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200 font-medium"
                    value={searchValue}
                    onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </motion.div>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
              
              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Cart Button - Classic Style */}
              <motion.div
                className="relative cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCartClick}
              >
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors shadow-lg">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="hidden sm:inline font-medium">Cart</span>
                  {count > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold min-w-[20px] text-center">
                      {count}
                    </span>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white border-b border-gray-200 shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
            
            {/* Mobile Search */}
            <div className="relative">
              <input
                placeholder="Search products..."
                className="w-full h-12 pl-12 pr-4 border-2 border-gray-200 rounded-full bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all"
                value={searchValue}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            {/* Mobile Menu Items */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              {user && (
                <div className="flex items-center gap-2 text-gray-700 pb-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium">Hi, {user.username || user.email.split('@')[0]}</span>
                </div>
              )}
              
              <button className="flex items-center gap-3 w-full text-left py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <HelpCircle className="w-5 h-5" />
                <span className="font-medium">Help & Support</span>
              </button>
              
              <button 
                className="flex items-center gap-3 w-full text-left py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={onCommunityClick}
              >
                <Phone className="w-5 h-5" />
                <span className="font-medium">Contact Us</span>
              </button>
              
              {!user && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={onLoginClick}
                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Login
                  </button>
                  <button
                    onClick={onSignupClick}
                    className="flex-1 py-2 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}

export default ClassicNavbar;
