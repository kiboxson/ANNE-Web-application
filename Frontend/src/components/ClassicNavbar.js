import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { Search, ShoppingBag, LogOut, Menu, X } from "lucide-react";
import img from "../assets/kiyu.png";

function ClassicNavbar({ user, onLoginClick, onSignupClick, onLogoutClick, searchValue, onSearchChange, onCartClick, onCommunityClick }) {
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navLinks = [
    { label: "Packages", href: "#packages" },
    { label: "How It Works", href: "#process" },
    { label: "Why Anne", href: "#why" },
  ];

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300"
        style={{
          background: scrolled || mobileOpen ? 'rgba(7,8,13,0.95)' : 'transparent',
          backdropFilter: scrolled || mobileOpen ? 'blur(18px)' : 'none',
          borderBottom: scrolled || mobileOpen ? '1px solid #1e2130' : '1px solid transparent',
        }}
      >
        {/* Main bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => window.scrollTo(0, 0)}>
            <img src={img} alt="Anne Logo" className="w-8 h-8 object-contain" />
            <span className="font-syne font-extrabold text-xl" style={{
              background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              Anne
            </span>
          </div>

          {/* Center nav links — desktop only */}
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-[#6b7094]">
            {navLinks.map(l => (
              <a key={l.label} href={l.href} className="hover:text-[#e8eaf2] transition-colors">{l.label}</a>
            ))}
            <button className="hover:text-[#e8eaf2] transition-colors" onClick={onCommunityClick}>Community</button>
          </div>

          {/* Search — desktop only */}
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
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-sm font-medium text-[#e8eaf2] hidden sm:block">
                  {user.username || user.email?.split('@')[0]}
                </span>
                <button onClick={onLogoutClick} className="text-[#6b7094] hover:text-[#ff6584] transition-colors" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
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
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-[#e8eaf2] transition-all"
              style={{ background: '#161921', border: '1px solid #1e2130' }}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-sm font-bold hidden sm:inline">Orders</span>
              {count > 0 && (
                <span className="text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5 min-w-[18px] text-center" style={{ background: '#6c63ff' }}>
                  {count}
                </span>
              )}
            </button>

            {/* Hamburger — mobile only */}
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
              style={{ background: '#161921', border: '1px solid #1e2130', color: '#6b7094' }}
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <div className="md:hidden border-t" style={{ borderColor: '#1e2130', background: 'rgba(7,8,13,0.98)' }}>
            {/* Mobile search */}
            <div className="px-4 pt-3 pb-2 relative">
              <input
                type="text"
                placeholder="Search packages..."
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full text-sm py-2.5 pl-9 pr-3 rounded-lg text-[#e8eaf2] focus:outline-none focus:border-[#6c63ff] transition-colors"
                style={{ background: '#12141e', border: '1px solid #1e2130' }}
              />
              <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7094]" style={{ top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            {/* Nav links */}
            <div className="flex flex-col px-4 pb-3 gap-0.5">
              {navLinks.map(l => (
                <a
                  key={l.label}
                  href={l.href}
                  className="py-2.5 text-sm font-medium text-[#6b7094] hover:text-[#e8eaf2] transition-colors border-b"
                  style={{ borderColor: '#1e2130' }}
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </a>
              ))}
              <button
                className="py-2.5 text-sm font-medium text-[#6b7094] hover:text-[#e8eaf2] transition-colors text-left border-b"
                style={{ borderColor: '#1e2130' }}
                onClick={() => { setMobileOpen(false); onCommunityClick && onCommunityClick(); }}
              >
                Community
              </button>
            </div>

            {/* Auth buttons (mobile) */}
            {!user && (
              <div className="flex gap-2 px-4 pb-4 pt-1">
                <button
                  onClick={() => { setMobileOpen(false); onLoginClick(); }}
                  className="flex-1 text-sm font-medium py-2.5 rounded-lg text-[#e8eaf2] transition-colors"
                  style={{ background: '#161921', border: '1px solid #1e2130' }}
                >
                  Login
                </button>
                <button
                  onClick={() => { setMobileOpen(false); onSignupClick(); }}
                  className="flex-1 text-sm font-medium py-2.5 rounded-lg text-white transition-colors"
                  style={{ background: '#6c63ff', boxShadow: '0 0 15px rgba(108,99,255,0.3)' }}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
}

export default ClassicNavbar;
