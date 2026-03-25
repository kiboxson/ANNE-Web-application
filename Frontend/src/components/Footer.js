import React from "react";
import { Facebook, Twitter, Instagram, Github } from "lucide-react";

function Footer({ onCommunityClick }) {
  return (
    <footer style={{ background: '#0f1118', borderTop: '1px solid #1e2130', color: '#6b7094' }} className="py-12 mt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
        
        {/* Brand */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-syne font-extrabold text-white mb-3">Anne</h2>
          <p className="text-sm leading-relaxed max-w-xs">
            We build fast, beautiful, conversion-focused websites for businesses and creators worldwide. From idea to launch in days.
          </p>
          <div className="flex gap-4 mt-5">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://www.instagram.com/kiboxson/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://github.com/kiboxson" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-sm font-syne font-bold text-white uppercase tracking-widest mb-4">Services</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#packages" className="hover:text-white transition-colors">Portfolio Websites</a></li>
            <li><a href="#packages" className="hover:text-white transition-colors">E-Commerce Stores</a></li>
            <li><a href="#packages" className="hover:text-white transition-colors">Business Websites</a></li>
            <li><a href="#packages" className="hover:text-white transition-colors">Blog & Content Sites</a></li>
            <li><a href="#packages" className="hover:text-white transition-colors">Custom Development</a></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-sm font-syne font-bold text-white uppercase tracking-widest mb-4">Company</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#why" className="hover:text-white transition-colors">About Us</a></li>
            <li><a href="#process" className="hover:text-white transition-colors">Our Process</a></li>
            <li>
              <button onClick={onCommunityClick} className="hover:text-white transition-colors text-left">Community</button>
            </li>
            <li><a href="mailto:contact@kiyu.dev" className="hover:text-white transition-colors">Contact</a></li>
            <li><a href="mailto:contact@kiyu.dev?subject=Privacy%20Policy%20Request" className="hover:text-white transition-colors">Privacy Policy</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid #1e2130' }}>
        <p className="text-sm">© {new Date().getFullYear()} Anne. All rights reserved.</p>
        <p className="text-sm">Crafted with ❤️ for the web.</p>
      </div>
    </footer>
  );
}

export default Footer;
