import React from "react";
import { motion } from "framer-motion";
import img from "../assets/kiyu.png";
import { useCart } from "../context/CartContext";
import "../styles/shared-responsive.css";

function Navbar({ user, onLoginClick, onSignupClick, onLogoutClick, searchValue, onSearchChange, onCartClick }) {
  const { count } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <>
      {/* Non-sticky navbar section with buttons */}
      <motion.div
        className="w-full bg-[#1A1E21] border-b border-white/20"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Top section - login/logout buttons */}
        <div className="navbar-responsive-container">
          <div className="flex items-center justify-center py-2 text-[#EBEBEB] text-xs sm:text-sm overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1 sm:gap-4 whitespace-nowrap min-w-max px-2">
              {user ? (
                <div className="flex items-center gap-2 sm:gap-4">
                  <span className="font-semibold text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">
                    Hi, {user.username || user.email}
                  </span>
                  <motion.button
                    onClick={onLogoutClick}
                    className="px-2 sm:px-3 py-1 rounded-lg hover:bg-white/10 transition text-xs sm:text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Logout
                  </motion.button>
                </div>
              ) : (
                <>
                  <motion.button
                    onClick={onLoginClick}
                    className="px-2 sm:px-3 py-1 rounded-lg hover:bg-white/10 transition text-xs sm:text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Login
                  </motion.button>
                  <motion.button
                    onClick={onSignupClick}
                    className="px-2 sm:px-3 py-1 rounded-lg hover:bg-white/10 transition text-xs sm:text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign up
                  </motion.button>
                </>
              )}
              <motion.button 
                className="px-2 sm:px-3 py-1 rounded-lg hover:bg-white/10 transition text-xs sm:text-sm" 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                <span className="hidden sm:inline">Help & Support</span>
                <span className="sm:hidden">Help</span>
              </motion.button>
              <motion.button 
                className="px-2 sm:px-3 py-1 rounded-lg hover:bg-white/10 transition text-xs sm:text-sm" 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                <span className="hidden sm:inline">Contact Us</span>
                <span className="sm:hidden">Contact</span>
              </motion.button>
            </div>
          </div>
        </div>

      </motion.div>

      {/* Sticky search bar section */}
      <motion.div
        className="sticky top-0 z-50 w-full bg-[#1A1E21] border-b border-white/20 shadow-lg"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
      >
        <div className="navbar-responsive-container">
          <div className="flex items-center justify-center gap-4 py-3">
          {/* Logo - now sticky */}
          <div className="flex items-center">
            <img src={img} alt="Logo" className="w-14 h-14 sm:w-16 sm:h-16" />
          </div>

          {/* Search bar - extra long and centered with icon inside */}
          <div className="flex items-center justify-center flex-1 max-w-4xl">
            <div className="relative w-full max-w-3xl">
              <motion.input
                placeholder="Search products..."
                className="w-full h-10 pl-12 pr-8 rounded-lg bg-white text-black border-none outline-none text-lg"
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                value={searchValue}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Cart button - positioned near search bar */}
          <div className="flex items-center">
            <motion.div
              className="relative cursor-pointer select-none text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCartClick}
              role="button"
              aria-label="Open cart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="sm:w-12 sm:h-12"
              >
                <circle cx="9" cy="20" r="1.5" />
                <circle cx="18" cy="20" r="1.5" />
                <path d="M3 3h2l1.6 9.6a2 2 0 0 0 2 1.6h7.8a1 1 0 0 0 .98-.79L21 6H6" />
              </svg>
              {count > 0 && (
                <span
                  className="absolute -top-1 -right-2 bg-red-600 text-white text-sm rounded-full px-2 py-1 shadow font-semibold"
                  aria-label={`Cart items: ${count}`}
                >
                  {count}
                </span>
              )}
            </motion.div>
          </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile menu - also sticky */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="sticky top-[73px] z-40 lg:hidden bg-[#1A1E21] border-t border-white/20"
        >
          <div className="navbar-responsive-container">
            <div className="py-3 space-y-3">
            {/* Mobile search */}
            <div className="md:hidden relative">
              <input
                placeholder="Search products..."
                className="w-full h-12 pl-12 pr-8 rounded-lg bg-white text-black text-lg"
                value={searchValue}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
                  />
                </svg>
              </div>
            </div>

            {/* Mobile menu items */}
            <div className="flex flex-col space-y-2 text-white">
              {user && (
                <div className="text-sm text-gray-300 pb-2 border-b border-white/20">
                  Hi, {user.username || user.email}
                </div>
              )}
              <button className="text-left py-2 hover:bg-white/10 rounded">Help & Support</button>
              <button className="text-left py-2 hover:bg-white/10 rounded">Contact Us</button>
            </div>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}

export default Navbar;
