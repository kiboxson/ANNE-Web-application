import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Check, X } from "lucide-react";
import axios from "axios";
import { API_BASE_URL_EXPORT } from "../config/api";
import Chatbot from "./Chatbot";
import FeedbackForm from "./FeedbackForm";
import QuoteModal from "./QuoteModal";

// ──────────────────────────────────────────────────────────
// Component Library Data
// ──────────────────────────────────────────────────────────
const COMPONENTS = [
  {
    id: "hero-gradient", category: "hero", name: "Gradient Hero",
    desc: "Animated gradient background with glowing badge and CTA buttons",
    tags: ["animated", "popular", "full-width"],
    emoji: "🚀",
    previewStyle: { background: "linear-gradient(135deg,#07080d 0%,#0f0a1a 100%)" },
    previewContent: (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 20 }}>
        <span style={{ background: "rgba(108,99,255,.2)", border: "1px solid rgba(108,99,255,.4)", color: "#a89ffc", fontSize: ".6rem", padding: "3px 10px", borderRadius: 100 }}>✦ Now Live</span>
        <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: ".88rem", color: "#fff", textAlign: "center", background: "linear-gradient(135deg,#6c63ff,#ff6584)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Build Something Incredible</div>
        <div style={{ fontSize: ".58rem", color: "#6b7094" }}>Stunning pages that convert</div>
        <div style={{ background: "#6c63ff", color: "#fff", fontSize: ".58rem", padding: "5px 14px", borderRadius: 6, fontWeight: 700 }}>Get Started →</div>
      </div>
    ),
  },
  {
    id: "hero-grid", category: "hero", name: "Grid Hero",
    desc: "Dark grid pattern background with radial glow and animated headline",
    tags: ["dark", "minimal", "grid"],
    emoji: "⬛",
    previewStyle: { background: "#07080d", position: "relative", overflow: "hidden" },
    previewContent: (
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 20 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(#1e2130 1px,transparent 1px),linear-gradient(90deg,#1e2130 1px,transparent 1px)", backgroundSize: "30px 30px", opacity: .5 }}></div>
        <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: ".85rem", color: "#fff", position: "relative", textAlign: "center", lineHeight: 1.2 }}>The Future<br/>Starts Here</div>
        <div style={{ fontSize: ".58rem", color: "#6b7094", position: "relative" }}>Modern web experiences</div>
        <div style={{ display: "flex", gap: 6, position: "relative" }}>
          <span style={{ background: "#6c63ff", color: "#fff", fontSize: ".55rem", padding: "4px 10px", borderRadius: 5, fontWeight: 700 }}>Launch →</span>
          <span style={{ border: "1px solid #1e2130", color: "#6b7094", fontSize: ".55rem", padding: "4px 10px", borderRadius: 5 }}>Learn More</span>
        </div>
      </div>
    ),
  },
  {
    id: "shader-wave", category: "shader", name: "Wave Shader",
    desc: "WebGL-powered animated wave with shifting color gradients",
    tags: ["webgl", "immersive", "animated"],
    emoji: "✨",
    previewStyle: { background: "#07080d", position: "relative", overflow: "hidden" },
    previewContent: (
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#0d0221,#1a0533,#0a1628)" }}></div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "linear-gradient(0deg,rgba(108,99,255,.4) 0%,transparent 100%)" }}></div>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: "Syne,sans-serif", fontSize: ".8rem", fontWeight: 800, color: "#fff", textShadow: "0 0 30px rgba(108,99,255,.8)" }}>SHADER</div>
        </div>
      </div>
    ),
  },
  {
    id: "buttons-animated", category: "button", name: "Animated Buttons",
    desc: "Gradient, outline, glow and magnetic button styles with hover effects",
    tags: ["interactive", "hover", "various"],
    emoji: "🔘",
    previewStyle: { background: "#0a0b10" },
    previewContent: (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: 20 }}>
        <div style={{ background: "linear-gradient(135deg,#6c63ff,#ff6584)", color: "#fff", padding: "7px 18px", borderRadius: 8, fontSize: ".7rem", fontWeight: 700 }}>Get Started Free</div>
        <div style={{ border: "1.5px solid #6c63ff", color: "#a89ffc", padding: "7px 18px", borderRadius: 8, fontSize: ".7rem", fontWeight: 700 }}>Learn More</div>
        <div style={{ background: "#43e97b", color: "#07080d", padding: "7px 18px", borderRadius: 100, fontSize: ".7rem", fontWeight: 800 }}>✓ Success</div>
      </div>
    ),
  },
  {
    id: "text-animations", category: "text", name: "Text Animations",
    desc: "Typewriter effect, gradient text, and glitch animations for headlines",
    tags: ["typewriter", "gradient", "glitch"],
    emoji: "🔤",
    previewStyle: { background: "#0a0b10" },
    previewContent: (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: 20 }}>
        <div style={{ fontFamily: "Syne,sans-serif", fontSize: ".85rem", fontWeight: 800, color: "#fff", borderRight: "2px solid #6c63ff", paddingRight: 4 }}>Build & Launch Fast</div>
        <div style={{ fontFamily: "Syne,sans-serif", fontSize: ".75rem", fontWeight: 700, background: "linear-gradient(90deg,#6c63ff,#ff6584,#43e97b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Gradient Animated Text</div>
        <div style={{ fontSize: ".68rem", color: "#6b7094", letterSpacing: ".3em", textTransform: "uppercase" }}>GLITCH EFFECT</div>
      </div>
    ),
  },
  {
    id: "feature-cards", category: "feature", name: "Feature Cards",
    desc: "Animated grid of feature cards with icon, title and pulsing borders",
    tags: ["grid", "cards", "icons"],
    emoji: "⚡",
    previewStyle: { background: "#0a0b10" },
    previewContent: (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: 16 }}>
        {[["⚡","Fast"],["🔒","Secure"],["🎨","Custom"],["📱","Mobile"]].map(([icon,label]) => (
          <div key={label} style={{ background: "#12141e", border: "1px solid #1e2130", borderRadius: 10, padding: 10, textAlign: "center" }}>
            <div style={{ fontSize: "1.2rem", marginBottom: 4 }}>{icon}</div>
            <div style={{ fontFamily: "Syne,sans-serif", fontSize: ".6rem", fontWeight: 700, color: "#e8eaf2" }}>{label}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "cta-glow", category: "cta", name: "Glow CTA",
    desc: "Full-width CTA section with radial glow, gradient button and subtle animation",
    tags: ["glow", "full-width", "conversion"],
    emoji: "📣",
    previewStyle: { background: "linear-gradient(135deg,#0f0a1a,#0a0b10)", position: "relative", overflow: "hidden" },
    previewContent: (
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 20 }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 100%,rgba(108,99,255,.3),transparent)", pointerEvents: "none" }}></div>
        <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: ".88rem", color: "#fff", textAlign: "center", position: "relative" }}>Ready to Launch?</div>
        <div style={{ fontSize: ".6rem", color: "#6b7094", position: "relative" }}>Join 2,000+ businesses</div>
        <div style={{ background: "#6c63ff", color: "#fff", fontSize: ".62rem", padding: "6px 16px", borderRadius: 7, fontWeight: 700, position: "relative", boxShadow: "0 0 20px rgba(108,99,255,.5)" }}>Start Building →</div>
      </div>
    ),
  },
  {
    id: "pricing-cards", category: "pricing", name: "Pricing Cards",
    desc: "Three-tier pricing layout with featured highlight and feature checklist",
    tags: ["three-tier", "featured", "conversion"],
    emoji: "💰",
    previewStyle: { background: "#0a0b10" },
    previewContent: (
      <div style={{ display: "flex", gap: 8, padding: 16, alignItems: "center" }}>
        {[["$29", "Starter", false],["$79","Pro ⭐",true],["Custom","Enterprise",false]].map(([price,plan,featured]) => (
          <div key={plan} style={{ flex: 1, background: featured ? "rgba(108,99,255,.08)" : "#12141e", border: `1px solid ${featured ? "#6c63ff" : "#1e2130"}`, borderRadius: 10, padding: 10, textAlign: "center" }}>
            <div style={{ fontSize: ".55rem", color: "#6b7094", marginBottom: 2 }}>{plan}</div>
            <div style={{ fontFamily: "Syne,sans-serif", fontSize: ".88rem", fontWeight: 800, color: featured ? "#a89ffc" : "#e8eaf2" }}>{price}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "testimonial-cards", category: "testimonial", name: "Testimonial Cards",
    desc: "Animated customer testimonial cards with avatar, stars and smooth transitions",
    tags: ["social-proof", "animated", "cards"],
    emoji: "💬",
    previewStyle: { background: "#0a0b10" },
    previewContent: (
      <div style={{ padding: 16 }}>
        <div style={{ background: "#12141e", border: "1px solid #1e2130", borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: ".65rem", color: "#febc2e", letterSpacing: 1, marginBottom: 6 }}>★★★★★</div>
          <div style={{ fontSize: ".6rem", color: "#6b7094", lineHeight: 1.5, marginBottom: 8 }}>"Absolutely incredible work. Transformed our brand!"</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "linear-gradient(135deg,#6c63ff,#ff6584)" }}></div>
            <div style={{ fontSize: ".6rem", fontWeight: 600, color: "#e8eaf2" }}>Alex Johnson</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "ai-chat-ui", category: "aichat", name: "AI Chat UI",
    desc: "Sleek conversational UI with typing indicator, bubbles and avatar support",
    tags: ["chat", "ai", "interactive"],
    emoji: "🤖",
    previewStyle: { background: "#0a0b10" },
    previewContent: (
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
          <div style={{ width: 16, height: 16, borderRadius: "50%", background: "linear-gradient(135deg,#6c63ff,#a89ffc)", flexShrink: 0 }}></div>
          <div style={{ background: "#1e2130", padding: "6px 10px", borderRadius: "10px 10px 10px 2px", fontSize: ".58rem", color: "#e8eaf2", maxWidth: "70%" }}>Hello! How can I help you?</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end", flexDirection: "row-reverse" }}>
          <div style={{ width: 16, height: 16, borderRadius: "50%", background: "linear-gradient(135deg,#ff6584,#ffb347)", flexShrink: 0 }}></div>
          <div style={{ background: "rgba(108,99,255,.25)", padding: "6px 10px", borderRadius: "10px 10px 2px 10px", fontSize: ".58rem", color: "#e8eaf2", maxWidth: "70%" }}>Build me a website!</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
          <div style={{ width: 16, height: 16, borderRadius: "50%", background: "linear-gradient(135deg,#6c63ff,#a89ffc)", flexShrink: 0 }}></div>
          <div style={{ background: "#1e2130", padding: "6px 10px", borderRadius: "10px 10px 10px 2px", display: "flex", gap: 3, alignItems: "center" }}>
            {[0,.15,.3].map(d => <span key={d} style={{ width: 4, height: 4, borderRadius: "50%", background: "#6c63ff", display: "block" }}></span>)}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "navbar-glass", category: "navbar", name: "Glassmorphism Navbar",
    desc: "Floating frosted-glass navigation bar with smooth backdrop blur effect",
    tags: ["glass", "sticky", "modern"],
    emoji: "🧭",
    previewStyle: { background: "#0a0b10" },
    previewContent: (
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(15,17,24,0.9)", border: "1px solid #1e2130", borderRadius: 10, padding: "8px 14px", backdropFilter: "blur(8px)" }}>
          <div style={{ fontFamily: "Syne,sans-serif", fontSize: ".72rem", fontWeight: 800, color: "#a89ffc" }}>BrandName</div>
          <div style={{ display: "flex", gap: 10 }}>
            {["Home","About","Work"].map(l => <span key={l} style={{ fontSize: ".55rem", color: "#6b7094" }}>{l}</span>)}
          </div>
          <div style={{ background: "#6c63ff", color: "#fff", fontSize: ".55rem", padding: "3px 9px", borderRadius: 5, fontWeight: 700 }}>Contact</div>
        </div>
        <div style={{ fontSize: ".55rem", color: "#6b7094", textAlign: "center" }}>↑ Frosted glass effect on scroll</div>
      </div>
    ),
  },
];

const CATEGORIES = [
  { id: "all", label: "🎨 All", count: COMPONENTS.length },
  { id: "hero", label: "🚀 Hero", count: 2 },
  { id: "shader", label: "✨ Shaders", count: 1 },
  { id: "button", label: "🔘 Buttons", count: 1 },
  { id: "text", label: "🔤 Text", count: 1 },
  { id: "feature", label: "⚡ Features", count: 1 },
  { id: "cta", label: "📣 CTA", count: 1 },
  { id: "pricing", label: "💰 Pricing", count: 1 },
  { id: "testimonial", label: "💬 Reviews", count: 1 },
  { id: "aichat", label: "🤖 AI Chat", count: 1 },
  { id: "navbar", label: "🧭 Navbar", count: 1 },
];

const PRICING = [
  {
    name: "Starter", price: "$299", period: "one-time",
    badge: null,
    features: [
      { text: "Up to 5 Components", ok: true },
      { text: "Responsive Design", ok: true },
      { text: "Basic Animations", ok: true },
      { text: "1 Revision Round", ok: true },
      { text: "Custom Shaders", ok: false },
      { text: "Full Source Code", ok: false },
    ],
    featured: false,
  },
  {
    name: "Professional", price: "$699", period: "one-time",
    badge: "Most Popular",
    features: [
      { text: "Up to 12 Components", ok: true },
      { text: "Responsive Design", ok: true },
      { text: "Premium Animations", ok: true },
      { text: "3 Revision Rounds", ok: true },
      { text: "Custom Shaders", ok: true },
      { text: "Full Source Code", ok: true },
    ],
    featured: true,
  },
  {
    name: "Enterprise", price: "Custom", period: "contact us",
    badge: null,
    features: [
      { text: "Unlimited Components", ok: true },
      { text: "Fully Custom Design", ok: true },
      { text: "Advanced Interactions", ok: true },
      { text: "Unlimited Revisions", ok: true },
      { text: "Custom Shaders + 3D", ok: true },
      { text: "Priority Support", ok: true },
    ],
    featured: false,
  },
];

// ──────────────────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────────────────
function ClassicHomePage({ onBuyNow }) {
  const builderRef = useRef(null);

  const [showFeedback, setShowFeedback] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [testimonials, setTestimonials] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selected, setSelected] = useState(new Set());

  const defaultTestimonials = useMemo(() => ([
    { name: "Sarah M.", role: "Founder, NovaTech SaaS", feedback: "The animated hero they built transformed our landing page. Conversion rate went up 40% in the first month!", rating: 5, image: "https://ui-avatars.com/api/?name=Sarah+M&background=6c63ff&color=fff&size=80" },
    { name: "James K.", role: "Creative Director, Studio72", feedback: "I selected 8 components and they nailed every single one. The shader backgrounds are breathtaking. 10/10.", rating: 5, image: "https://ui-avatars.com/api/?name=James+K&background=ff6584&color=fff&size=80" },
    { name: "Priya L.", role: "CEO, GreenLeaf Commerce", feedback: "The component picker made it so easy to communicate what I wanted. The final result exceeded every expectation.", rating: 5, image: "https://ui-avatars.com/api/?name=Priya+L&background=43e97b&color=000&size=80" },
  ]), []);

  useEffect(() => {
    axios.get(`${API_BASE_URL_EXPORT}/api/feedback?status=published&limit=6`)
      .then(r => {
        if (r.data.success && r.data.feedbacks?.length > 0) {
          setTestimonials(r.data.feedbacks.map(fb => ({
            name: fb.name, role: "Client", feedback: fb.feedback, rating: fb.rating || 5,
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(fb.name)}&background=random&size=80`,
          })).concat(defaultTestimonials).slice(0, 6));
        } else setTestimonials(defaultTestimonials);
      }).catch(() => setTestimonials(defaultTestimonials));
  }, [defaultTestimonials]);

  const visibleComponents = activeCategory === "all" ? COMPONENTS : COMPONENTS.filter(c => c.category === activeCategory);

  const toggleComponent = (id) => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const selectedNames = [...selected].map(id => COMPONENTS.find(c => c.id === id)?.name).filter(Boolean);

  return (
    <div className="bg-[#07080d] text-[#e8eaf2] w-full pt-16 font-dmsans overflow-x-hidden">

      {/* ─── HERO ─── */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-grid"></div>
        <div className="hero-badge"><span></span> 200+ Animated Components Available</div>
        <h1>Build Websites That<br /><em>Actually Impress</em></h1>
        <p className="hero-sub">
          Choose from our curated library of stunning animated components — heroes, shaders, buttons, navbars, and more. You pick the style, we handle the code.
        </p>
        <div className="hero-btns">
          <button className="btn-primary" onClick={() => builderRef.current?.scrollIntoView({ behavior: "smooth" })}>
            Browse Components
          </button>
          <button className="btn-secondary" onClick={() => setShowQuote(true)}>
            Get a Free Quote
          </button>
        </div>
      </section>

      {/* ─── MARQUEE ─── */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          <span className="accent">✦ Hero Sections</span><span>Animated Shaders</span>
          <span className="accent">✦ Interactive Buttons</span><span>Testimonials</span>
          <span className="accent">✦ Pricing Tables</span><span>AI Chat UI</span>
          <span className="accent">✦ Text Animations</span><span>Feature Cards</span>
          <span className="accent">✦ Call to Action</span><span>Navigation Bars</span>
          <span className="accent">✦ Footer Designs</span><span>3D Cards</span>
          <span className="accent">✦ Hero Sections</span><span>Animated Shaders</span>
          <span className="accent">✦ Interactive Buttons</span><span>Testimonials</span>
          <span className="accent">✦ Pricing Tables</span><span>AI Chat UI</span>
        </div>
      </div>

      {/* ─── COMPONENT LIBRARY ─── */}
      <section id="builder" ref={builderRef}>
        <div className="max-w-[1160px] mx-auto w-full">
          <div className="section-label">Component Library</div>
          <h2 className="section-title">Pick Your Style</h2>
          <p className="section-desc">Click any component you want for your website. Mix and match — we build exactly what you select.</p>

          <div className="flex flex-col lg:flex-row gap-5 min-h-[600px] lg:min-h-0">
            {/* Category Sidebar — scrollable row on mobile, column on desktop */}
            <div className="lg:w-52 shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-1 lg:pb-0 lg:overflow-x-visible" style={{ scrollbarWidth: 'none' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all text-left shrink-0"
                  style={{
                    background: activeCategory === cat.id ? "rgba(108,99,255,.12)" : "#0f1118",
                    border: `1px solid ${activeCategory === cat.id ? "rgba(108,99,255,.35)" : "#1e2130"}`,
                    color: activeCategory === cat.id ? "#a89ffc" : "#6b7094",
                  }}
                >
                  <span className="text-xs whitespace-nowrap">{cat.label}</span>
                  <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded-full" style={{ background: activeCategory === cat.id ? "rgba(108,99,255,.25)" : "#161921", color: activeCategory === cat.id ? "#6c63ff" : "#6b7094" }}>{cat.count}</span>
                </button>
              ))}
            </div>

            {/* Preview Area */}
            <div className="flex-1 rounded-2xl overflow-hidden flex flex-col" style={{ background: "#0f1118", border: "1px solid #1e2130" }}>
              {/* Topbar */}
              <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "#1e2130", background: "#161921" }}>
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }}></span>
                  <span className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }}></span>
                  <span className="w-3 h-3 rounded-full" style={{ background: "#28c840" }}></span>
                </div>
                <span className="text-xs font-syne font-semibold" style={{ color: "#6b7094" }}>Component Preview</span>
                <div className="flex gap-2">
                  <button onClick={() => setSelected(new Set())} className="text-xs px-3 py-1 rounded-lg transition-colors" style={{ background: "#0f1118", border: "1px solid #1e2130", color: "#6b7094" }}>Clear</button>
                  <button onClick={() => setShowQuote(true)} className="text-xs px-3 py-1 rounded-lg font-semibold transition-colors" style={{ border: "1px solid #6c63ff", color: "#6c63ff", background: "transparent" }}>Order Now →</button>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4 overflow-y-auto flex-1" style={{ minHeight: 440 }}>
                <AnimatePresence mode="popLayout">
                  {visibleComponents.map(comp => (
                    <motion.div
                      key={comp.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => toggleComponent(comp.id)}
                      className="rounded-2xl overflow-hidden cursor-pointer transition-all relative"
                      style={{
                        background: "#12141e",
                        border: `2px solid ${selected.has(comp.id) ? "#6c63ff" : "#1e2130"}`,
                        boxShadow: selected.has(comp.id) ? "0 0 0 3px rgba(108,99,255,.2)" : "none",
                      }}
                      whileHover={{ y: -3, borderColor: "#6c63ff" }}
                    >
                      {selected.has(comp.id) && (
                        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 text-white text-[10px] font-syne font-bold px-2 py-0.5 rounded-full" style={{ background: "#6c63ff" }}>
                          <Check className="w-3 h-3" /> Selected
                        </div>
                      )}
                      {/* Preview */}
                      <div className="overflow-hidden flex items-center justify-center" style={{ height: 160, ...comp.previewStyle }}>
                        {comp.previewContent}
                      </div>
                      {/* Info */}
                      <div className="p-4 border-t" style={{ borderColor: "#1e2130" }}>
                        <div className="font-syne font-bold text-sm text-white mb-1">{comp.emoji} {comp.name}</div>
                        <div className="text-xs leading-relaxed mb-2" style={{ color: "#6b7094" }}>{comp.desc}</div>
                        <div className="flex flex-wrap gap-1">
                          {comp.tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "#161921", color: "#6b7094" }}>{t}</span>)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Selection Panel */}
          <div className="mt-5 rounded-2xl p-4 sm:p-6" style={{ background: "#0f1118", border: "1px solid #1e2130" }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-syne font-bold text-white">Your Selection</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "#6c63ff" }}>{selected.size}</span>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
              {selected.size === 0 ? (
                <span className="text-sm italic" style={{ color: "#6b7094" }}>No components selected yet — click cards above to choose!</span>
              ) : (
                [...selected].map(id => {
                  const comp = COMPONENTS.find(c => c.id === id);
                  return (
                    <motion.div key={id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full" style={{ background: "rgba(108,99,255,.12)", border: "1px solid rgba(108,99,255,.3)", color: "#a89ffc" }}>
                      {comp?.name}
                      <button onClick={(e) => { e.stopPropagation(); toggleComponent(id); }} className="transition-colors hover:text-[#ff6584]"><X className="w-3 h-3" /></button>
                    </motion.div>
                  );
                })
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-5">
              <button
                className="btn-primary"
                style={selected.size === 0 ? { opacity: 0.5, pointerEvents: "none" } : {}}
                onClick={() => setShowQuote(true)}
              >
                Request Quote for Selected →
              </button>
              <button className="btn-secondary" onClick={() => setSelected(new Set())}>Clear Selection</button>
              {selected.size > 0 && <span className="text-sm ml-auto" style={{ color: "#6b7094" }}>{selected.size} component{selected.size > 1 ? "s" : ""} selected</span>}
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section style={{ background: "#0f1118", borderTop: "1px solid #1e2130" }}>
        <div className="max-w-[1160px] mx-auto w-full">
          <div className="section-label">The Process</div>
          <h2 className="section-title">How It Works</h2>
          <p className="section-desc">From selection to launch in 4 simple steps.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: "01", icon: "🎨", title: "Choose Components", desc: "Browse our library and select the animated components you want for your website." },
              { n: "02", icon: "📋", title: "Submit Request", desc: "Fill in your project details, budget, and any special requirements." },
              { n: "03", icon: "⚙️", title: "We Build It", desc: "Our team crafts your website with all selected components, tailored to your brand." },
              { n: "04", icon: "🚀", title: "Launch & Own", desc: "Receive your fully functional website with source code, ready to go live." },
            ].map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12 }} viewport={{ once: true }} className="relative text-center p-6">
                {i < 3 && <div className="hidden lg:block absolute right-[-12px] top-10 text-xl font-bold opacity-30" style={{ color: "#6c63ff" }}>→</div>}
                <div className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center text-2xl mb-4" style={{ background: "rgba(108,99,255,.1)", border: "1px solid rgba(108,99,255,.25)" }}>{step.icon}</div>
                <div className="font-syne font-bold text-white mb-2"><span style={{ color: "#6c63ff" }}>{step.n}.</span> {step.title}</div>
                <div className="text-sm leading-relaxed" style={{ color: "#6b7094" }}>{step.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" style={{ background: "#07080d" }}>
        <div className="max-w-[1160px] mx-auto w-full">
          <div className="section-label">Pricing Plans</div>
          <h2 className="section-title">Simple, Transparent Pricing</h2>
          <p className="section-desc">No hidden fees. Choose the plan that fits your needs.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PRICING.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="rounded-2xl p-8 relative overflow-hidden transition-all hover:-translate-y-1"
                style={{
                  background: plan.featured ? "rgba(108,99,255,.06)" : "#12141e",
                  border: `1px solid ${plan.featured ? "#6c63ff" : "#1e2130"}`,
                  boxShadow: plan.featured ? "0 0 40px rgba(108,99,255,.15)" : "none",
                }}
              >
                {plan.featured && <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,#6c63ff,#ff6584)" }}></div>}
                {plan.badge && (
                  <div className="inline-block text-[11px] font-syne font-bold uppercase tracking-wider text-white px-3 py-1 rounded-full mb-4" style={{ background: "#6c63ff" }}>{plan.badge}</div>
                )}
                <div className="font-syne font-bold text-white text-lg mb-2">{plan.name}</div>
                <div className="font-syne font-extrabold text-5xl text-white mb-1">{plan.price !== "Custom" && <sup className="text-2xl">$</sup>}{plan.price === "Custom" ? plan.price : plan.price.replace("$","")}</div>
                <div className="text-sm mb-6" style={{ color: "#6b7094" }}>{plan.period}</div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f.text} className="flex items-center gap-3 text-sm" style={{ color: f.ok ? "#a0a8cc" : "#3a3f5c", opacity: f.ok ? 1 : 0.5 }}>
                      {f.ok ? <Check className="w-4 h-4 shrink-0" style={{ color: "#43e97b" }} /> : <X className="w-4 h-4 shrink-0" style={{ color: "#6b7094" }} />}
                      {f.text}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setShowQuote(true)}
                  className="w-full py-3 rounded-xl font-syne font-bold text-sm transition-all"
                  style={plan.featured
                    ? { background: "#6c63ff", color: "#fff", border: "1px solid #6c63ff", boxShadow: "0 0 20px rgba(108,99,255,.35)" }
                    : { background: "transparent", color: "#e8eaf2", border: "1px solid #1e2130" }
                  }
                >
                  {plan.name === "Enterprise" ? "Contact Us" : "Get Started"}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section style={{ background: "#0f1118", borderTop: "1px solid #1e2130" }}>
        <div className="max-w-[1160px] mx-auto w-full">
          <div className="section-label">What Clients Say</div>
          <h2 className="section-title">Loved by Businesses</h2>
          <p className="section-desc">Real feedback from business owners who trusted us to build their digital presence.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="rounded-2xl p-6 transition-all hover:-translate-y-1 hover:border-[#6c63ff]"
                style={{ background: "#12141e", border: "1px solid #1e2130" }}
              >
                <div className="text-sm tracking-widest mb-3" style={{ color: "#febc2e" }}>{"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}</div>
                <p className="text-sm leading-relaxed italic mb-5" style={{ color: "#6b7094" }}>"{t.feedback}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <strong className="block font-syne font-bold text-sm text-[#e8eaf2]">{t.name}</strong>
                    <span className="text-xs" style={{ color: "#6b7094" }}>{t.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <button onClick={() => setShowFeedback(true)} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-syne font-bold text-sm text-white" style={{ background: "#6c63ff", boxShadow: "0 0 20px rgba(108,99,255,.3)" }}>
              <MessageSquare className="w-4 h-4" /> Share Your Experience
            </button>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section style={{ background: "#07080d" }}>
        <div className="max-w-[1160px] mx-auto w-full text-center">
          <div className="rounded-3xl p-6 sm:p-8 md:p-12" style={{ background: "linear-gradient(135deg,rgba(108,99,255,.18),rgba(255,101,132,.12))", border: "1px solid rgba(108,99,255,.3)" }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>Ready to Build Something Incredible?</h2>
            <p className="text-base sm:text-lg mb-8 max-w-xl mx-auto" style={{ color: "#6b7094" }}>
              Pick your components, submit a request, and we'll have your dream website ready in days.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="btn-primary" onClick={() => builderRef.current?.scrollIntoView({ behavior: "smooth" })}>
                Browse Components
              </button>
              <button className="btn-secondary" onClick={() => setShowQuote(true)}>
                Get a Free Quote
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <QuoteModal open={showQuote} onClose={() => setShowQuote(false)} selectedComponents={selectedNames} />

      <AnimatePresence>
        {showFeedback && <FeedbackForm onClose={() => setShowFeedback(false)} onSuccess={() => {}} />}
      </AnimatePresence>

      <Chatbot />
    </div>
  );
}

export default ClassicHomePage;
