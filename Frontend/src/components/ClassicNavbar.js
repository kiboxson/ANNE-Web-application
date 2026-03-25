import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { Search, ShoppingBag, LogOut } from "lucide-react";
import img from "../assets/kiyu.png";

function ClassicNavbar({ user, onLoginClick, onSignupClick, onLogoutClick, searchValue, onSearchChange, onCartClick, onCommunityClick }) {
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(7,8,13,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(18px)' : 'none',
        borderBottom: scrolled ? '1px solid #1e2130' : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => window.scrollTo(0,0)}>
          <img src={img} alt="Kiyu Logo" className="w-8 h-8 object-contain" />
          <span className="font-syne font-extrabold text-xl" style={{
            background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Kiyu
          </span>
        </div>

        {/* Center nav links */}
        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-[#6b7094]">
          <a href="#packages" className="hover:text-[#e8eaf2] transition-colors">Packages</a>
          <a href="#process" className="hover:text-[#e8eaf2] transition-colors">How It Works</a>
          <a href="#why" className="hover:text-[#e8eaf2] transition-colors">Why Kiyu</a>
          <button className="hover:text-[#e8eaf2] transition-colors" onClick={onCommunityClick}>Community</button>
        </div>

        {/* Search */}
        <div className="hidden lg:flex flex-1 max-w-xs relative">
          <input
            type="text"
            placeholder="Search packages..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full text-sm py-2 pl-9 pr-3 rounded-lg text-[#e8eaf2] focus:outline-none focus:border-[#6c63ff] transition-colors"
            style={{ background: '#12141e', border: '1px solid #1e2130' }}
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7094]" />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[#e8eaf2] hidden sm:block">
                {user.username || user.email?.split('@')[0]}
              </span>
              <button onClick={onLogoutClick} className="text-[#6b7094] hover:text-[#ff6584] transition-colors" title="Logout">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={onLoginClick} className="text-sm font-medium text-[#6b7094] hover:text-[#e8eaf2] transition-colors">
                Login
              </button>
              <button
                onClick={onSignupClick}
                className="text-sm font-medium px-4 py-1.5 rounded-lg text-white transition-colors"
                style={{ background: '#6c63ff', boxShadow: '0 0 15px rgba(108,99,255,0.3)' }}
              >
                Sign Up
              </button>
            </div>
          )}

          <button
            onClick={onCartClick}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[#e8eaf2] transition-all"
            style={{ background: '#161921', border: '1px solid #1e2130' }}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="text-sm font-bold hidden sm:inline">Orders</span>
            {count > 0 && (
              <span className="text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 min-w-[18px] text-center" style={{ background: '#6c63ff' }}>
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default ClassicNavbar;
