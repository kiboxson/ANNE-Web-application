import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import img from "../assets/kiyu.png";
import { useCart } from "../context/CartContext";
import { Search, ShoppingBag, User, LogOut, Phone, HelpCircle } from "lucide-react";

function ClassicNavbar({ user, onLoginClick, onSignupClick, onLogoutClick, searchValue, onSearchChange, onCartClick, onCommunityClick }) {
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-[#07080d]/85 backdrop-blur-[18px] border-b border-[#1e2130]' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
          <img src={img} alt="Kiyu Logo" className="w-8 h-8 object-contain" />
          <span className="font-syne font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-[#6c63ff] to-[#ff6584]">
            Kiyu
          </span>
        </div>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#12141e] border border-[#1e2130] rounded-full py-2 pl-10 pr-4 text-[#e8eaf2] text-sm focus:outline-none focus:border-[#6c63ff] transition-colors"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7094]" />
        </div>

        {/* Links & Actions */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button className="hidden sm:block text-[#6b7094] hover:text-[#e8eaf2] transition-colors font-medium text-sm" onClick={onCommunityClick}>
            Community
          </button>
          
          <div className="h-4 w-[1px] bg-[#1e2130] hidden sm:block"></div>

          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-[#e8eaf2] hidden sm:block">
                {user.username || user.email?.split('@')[0]}
              </span>
              <button onClick={onLogoutClick} className="text-[#6b7094] hover:text-[#ff6584] transition-colors" title="Logout">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
             <div className="flex items-center gap-3">
              <button onClick={onLoginClick} className="text-sm font-medium text-[#6b7094] hover:text-[#e8eaf2] transition-colors">
                Login
              </button>
              <button onClick={onSignupClick} className="text-sm font-medium px-4 py-1.5 rounded-lg bg-[#6c63ff] text-white hover:bg-[#5850ec] transition-colors shadow-[0_0_15px_rgba(108,99,255,0.3)]">
                Sign Up
              </button>
            </div>
          )}

          <button 
            onClick={onCartClick}
            className="flex items-center gap-2 bg-[#161921] border border-[#1e2130] hover:border-[#6c63ff] hover:text-[#6c63ff] text-[#e8eaf2] px-3 sm:px-4 py-1.5 rounded-lg transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="text-sm font-bold hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="bg-[#6c63ff] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 min-w-[18px] text-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Search - Visible only on small screens */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#12141e] border border-[#1e2130] rounded-full py-2 pl-10 pr-4 text-[#e8eaf2] text-sm focus:outline-none focus:border-[#6c63ff] transition-colors"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7094]" />
        </div>
      </div>
    </nav>
  );
}

export default ClassicNavbar;
