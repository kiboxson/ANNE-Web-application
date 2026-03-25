import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquare } from "lucide-react";
import axios from "axios";
import { API_BASE_URL_EXPORT } from "../config/api";
import FlashSalePage from "./Flashsale";
import ProductsSection from "./Products";
import Chatbot from "./Chatbot";
import FeedbackForm from "./FeedbackForm";
// Note: We use global styles from kiyu-theme.css now

function ClassicHomePage({ 
  searchQuery, 
  selectedCategories, 
  priceRange, 
  onGrabDeal, 
  onBuyNow 
}) {
  const storeRef = useRef(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [testimonials, setTestimonials] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(true);

  // Default testimonials
  const defaultTestimonials = [
    {
      name: "Sarah Mitchell",
      role: "Verified Buyer",
      feedback: "Exceptional quality and service. Every purchase has exceeded my expectations. The shipping was incredibly fast too.",
      rating: 5,
      image: "https://ui-avatars.com/api/?name=Sarah+M&background=6c63ff&color=fff&size=80"
    },
    {
      name: "James K.",
      role: "Regular Customer",
      feedback: "Got the latest tech accessories and they fit and look amazing. The packaging alone feels like a true luxury experience.",
      rating: 5,
      image: "https://ui-avatars.com/api/?name=James+K&background=ff6584&color=fff&size=80"
    },
    {
      name: "Priya L.",
      role: "Premium Member",
      feedback: "The quality of products and attention to detail is remarkable. My everyday go-to store. Highly recommended!",
      rating: 5,
      image: "https://ui-avatars.com/api/?name=Priya+L&background=43e97b&color=fff&size=80"
    }
  ];

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoadingFeedback(true);
        const response = await axios.get(`${API_BASE_URL_EXPORT}/api/feedback?status=published&limit=10`);
        
        if (response.data.success && response.data.feedbacks.length > 0) {
          const fetchedTestimonials = response.data.feedbacks.map(fb => ({
            name: fb.name,
            role: "Customer",
            feedback: fb.feedback,
            rating: fb.rating || 5,
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(fb.name)}&background=random&size=80`
          }));
          setTestimonials([...fetchedTestimonials, ...defaultTestimonials].slice(0, 6));
        } else {
          setTestimonials(defaultTestimonials);
        }
      } catch (err) {
        setTestimonials(defaultTestimonials);
      } finally {
        setLoadingFeedback(false);
      }
    };
    fetchFeedback();
  }, []);

  return (
    <div className="bg-[#07080d] text-[#e8eaf2] w-full pt-16 font-dmsans overflow-hidden">
      
      {/* ─── HERO ─── */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-grid"></div>
        <div className="hero-badge"><span></span> FW25 Collection Dropped</div>
        <h1 className="text-center">Elevate Your<br/><em>Everyday Style</em></h1>
        <p className="hero-sub text-center">
          Discover curated products from top designers. Premium materials, unmatched quality, and effortless aesthetics for modern living.
        </p>
        <div className="hero-btns justify-center">
          <button 
            className="btn-primary" 
            onClick={() => storeRef.current?.scrollIntoView({behavior:'smooth'})}
          >
            Shop The Collection
          </button>
          <button 
            className="btn-secondary px-8" 
            onClick={() => document.getElementById('collections')?.scrollIntoView({behavior:'smooth'})}
          >
            Explore Categories
          </button>
        </div>
      </section>

      {/* ─── MARQUEE ─── */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          <span className="accent">✦ Free Shipping Over $50</span>
          <span>30-Day Easy Returns</span>
          <span className="accent">✦ Secure Checkout</span>
          <span>24/7 Customer Support</span>
          <span className="accent">✦ Premium Quality</span>
          <span>Eco-friendly Packaging</span>
          <span className="accent">✦ Free Shipping Over $50</span>
          <span>30-Day Easy Returns</span>
          <span className="accent">✦ Secure Checkout</span>
          <span>24/7 Customer Support</span>
          <span className="accent">✦ Premium Quality</span>
          <span>Eco-friendly Packaging</span>
        </div>
      </div>

      {/* ─── STORE CATALOG (Replaces generic products section) ─── */}
      <section id="store" ref={storeRef}>
        <div className="max-w-[1160px] mx-auto">
          <div className="section-label">Our Catalog</div>
          <h2 className="section-title">Store & Flash Sales</h2>
          <p className="section-desc">
            Browse our latest curations. From daily essentials to statement pieces, find exactly what you need.
          </p>

          <div className="space-y-16">
            <FlashSalePage
              searchQuery={searchQuery}
              selectedCategories={selectedCategories}
              priceRange={priceRange}
              onGrabDeal={onGrabDeal}
            />

            <ProductsSection
              searchQuery={searchQuery}
              selectedCategories={selectedCategories}
              priceRange={priceRange}
              onBuyNow={onBuyNow}
            />
          </div>
        </div>
      </section>

      {/* ─── HOW WE DELIVER ─── */}
      <section id="how" className="bg-[#0f1118]">
        <div className="max-w-[1160px] mx-auto">
          <div className="section-label">The Process</div>
          <h2 className="section-title">How We Deliver</h2>
          <p className="section-desc">From our warehouse to your front door in four simple steps.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 relative group">
              <div className="hidden lg:block absolute right-[-12px] top-10 text-[#6c63ff] opacity-50 text-xl font-bold">→</div>
              <div className="w-14 h-14 mx-auto rounded-xl bg-[#6c63ff]/10 border border-[#6c63ff]/30 flex items-center justify-center text-2xl mb-4 text-[#6c63ff]">🛍️</div>
              <div className="font-syne font-bold mb-2">Place Order</div>
              <div className="text-sm text-[#6b7094] leading-relaxed">Securely check out with your preferred payment method.</div>
            </div>
            <div className="text-center p-6 relative group">
              <div className="hidden lg:block absolute right-[-12px] top-10 text-[#6c63ff] opacity-50 text-xl font-bold">→</div>
              <div className="w-14 h-14 mx-auto rounded-xl bg-[#6c63ff]/10 border border-[#6c63ff]/30 flex items-center justify-center text-2xl mb-4 text-[#6c63ff]">📦</div>
              <div className="font-syne font-bold mb-2">Processing</div>
              <div className="text-sm text-[#6b7094] leading-relaxed">We carefully inspect and pack your items within 24 hours.</div>
            </div>
            <div className="text-center p-6 relative group">
              <div className="hidden lg:block absolute right-[-12px] top-10 text-[#6c63ff] opacity-50 text-xl font-bold">→</div>
              <div className="w-14 h-14 mx-auto rounded-xl bg-[#6c63ff]/10 border border-[#6c63ff]/30 flex items-center justify-center text-2xl mb-4 text-[#6c63ff]">🚚</div>
              <div className="font-syne font-bold mb-2">Shipping</div>
              <div className="text-sm text-[#6b7094] leading-relaxed">Track your package in real-time as it makes its way to you.</div>
            </div>
            <div className="text-center p-6 relative group">
              <div className="w-14 h-14 mx-auto rounded-xl bg-[#6c63ff]/10 border border-[#6c63ff]/30 flex items-center justify-center text-2xl mb-4 text-[#6c63ff]">✨</div>
              <div className="font-syne font-bold mb-2">Delivery</div>
              <div className="text-sm text-[#6b7094] leading-relaxed">Enjoy your new premium lifestyle items.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURED COLLECTIONS ─── */}
      <section id="collections" className="bg-[#07080d]">
        <div className="max-w-[1160px] mx-auto">
          <div className="section-label">Curations</div>
          <h2 className="section-title">Featured Collections</h2>
          <p className="section-desc">Explore our handpicked selections tailored for your lifestyle.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-[#12141e] border border-[#1e2130] rounded-2xl p-8 text-center transition-all hover:-translate-y-1 hover:border-[#6c63ff] flex flex-col items-center">
              <div className="text-5xl mb-4">🎧</div>
              <div className="font-syne font-extrabold text-xl mb-3">Digital Nomad</div>
              <div className="text-sm text-[#6b7094] leading-relaxed mb-6 flex-1">Premium tech accessories and everyday carry essentials for the modern remote worker.</div>
              <button className="w-full bg-[#161921] border border-[#1e2130] hover:border-[#6c63ff] hover:text-[#6c63ff] py-3 rounded-lg font-syne font-bold transition-all text-sm" onClick={() => storeRef.current?.scrollIntoView({behavior:'smooth'})}>Shop Collection</button>
            </div>
            <div className="bg-[#12141e]/50 border border-[#6c63ff] rounded-2xl p-8 text-center transition-all hover:-translate-y-1 relative overflow-hidden flex flex-col items-center">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#6c63ff] to-[#ff6584]"></div>
              <div className="text-5xl mb-4">👔</div>
              <div className="font-syne font-extrabold text-xl mb-3">Minimalist Wardrobe</div>
              <div className="text-sm text-[#6b7094] leading-relaxed mb-6 flex-1">Elevated basics, neutral tones, and versatile pieces that never go out of style.</div>
              <button className="w-full bg-[#6c63ff] text-white hover:opacity-85 py-3 rounded-lg font-syne font-bold transition-all text-sm" onClick={() => storeRef.current?.scrollIntoView({behavior:'smooth'})}>Explore Minimalist</button>
            </div>
            <div className="bg-[#12141e] border border-[#1e2130] rounded-2xl p-8 text-center transition-all hover:-translate-y-1 hover:border-[#6c63ff] flex flex-col items-center">
              <div className="text-5xl mb-4">🛋️</div>
              <div className="font-syne font-extrabold text-xl mb-3">Home Sanctuary</div>
              <div className="text-sm text-[#6b7094] leading-relaxed mb-6 flex-1">Aesthetic decor, ambient lighting, and objects that turn your space into a retreat.</div>
              <button className="w-full bg-[#161921] border border-[#1e2130] hover:border-[#6c63ff] hover:text-[#6c63ff] py-3 rounded-lg font-syne font-bold transition-all text-sm" onClick={() => storeRef.current?.scrollIntoView({behavior:'smooth'})}>Shop Home</button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section id="testimonials" className="bg-[#0f1118] border-t border-[#1e2130]">
        <div className="max-w-[1160px] mx-auto">
          <div className="section-label">Customer Reviews</div>
          <h2 className="section-title">Loved by Shoppers</h2>
          <p className="section-desc">Join thousands of happy customers who have upgraded their lifestyle with Kiyu.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            {testimonials.map((testi, i) => (
              <div key={i} className="bg-[#12141e] border border-[#1e2130] rounded-2xl p-6 transition-all hover:-translate-y-1 hover:border-[#6c63ff]">
                <div className="text-[#febc2e] text-sm tracking-widest mb-3">
                  {Array.from({length: testi.rating}).map((_, idx) => "★").join('')}
                  {Array.from({length: 5 - testi.rating}).map((_, idx) => "☆").join('')}
                </div>
                <div className="text-sm text-[#6b7094] leading-relaxed mb-5 italic">"{testi.feedback}"</div>
                <div className="flex items-center gap-3">
                  <img src={testi.image} alt={testi.name} className="w-10 h-10 rounded-full bg-[#1e2130]" />
                  <div>
                    <strong className="block font-syne font-bold text-sm text-[#e8eaf2]">{testi.name}</strong>
                    <span className="text-xs text-[#6b7094]">{testi.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button 
              onClick={() => setShowFeedbackForm(true)}
              className="inline-flex items-center gap-2 bg-[#6c63ff] text-white px-6 py-3 rounded-lg font-syne font-bold text-sm shadow-[0_0_20px_rgba(108,99,255,0.3)] hover:opacity-85 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              Leave a Review
            </button>
          </div>
        </div>
      </section>

      {/* Feedback Form Modal */}
      <AnimatePresence>
        {showFeedbackForm && (
          <FeedbackForm
            onClose={() => setShowFeedbackForm(false)}
            onSuccess={() => console.log("Feedback submitted successfully!")}
          />
        )}
      </AnimatePresence>

      <Chatbot />
    </div>
  );
}

export default ClassicHomePage;
