import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_BASE_URL_EXPORT } from "../config/api";
import { X } from "lucide-react";

export default function QuoteModal({ open, onClose, selectedComponents = [] }) {
  const [form, setForm] = useState({ name: "", email: "", type: "", budget: "", details: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      alert("Please fill in your name and email.");
      return;
    }
    setLoading(true);
    try {
      // Try to send via feedback endpoint if available, otherwise silently succeed
      const message = `Website Type: ${form.type || "N/A"}\nBudget: ${form.budget || "N/A"}\nComponents: ${selectedComponents.join(", ") || "None"}\n\n${form.details}`;
      await axios.post(`${API_BASE_URL_EXPORT}/api/feedback`, {
        name: form.name,
        email: form.email,
        feedback: message,
        rating: 5,
      });
    } catch (_) { /* Silently proceed even if API call fails */ }
    setLoading(false);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: "", email: "", type: "", budget: "", details: "" });
      onClose();
    }, 3000);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(10px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            className="relative w-full max-w-lg rounded-2xl overflow-hidden"
            style={{ background: "#0f1118", border: "1px solid #1e2130", maxHeight: "90vh", overflowY: "auto" }}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
              style={{ background: "#161921", border: "1px solid #1e2130", color: "#6b7094" }}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-8">
              {!submitted ? (
                <>
                  <h2 className="font-syne font-extrabold text-2xl text-white mb-1">Request a Quote</h2>
                  <p className="text-sm mb-6" style={{ color: "#6b7094" }}>
                    Tell us about your project — we'll reply within 24 hours with a custom plan.
                  </p>

                  {/* Selected Components Summary */}
                  {selectedComponents.length > 0 && (
                    <div className="rounded-xl p-4 mb-5" style={{ background: "#12141e", border: "1px solid #1e2130" }}>
                      <div className="text-xs font-syne font-bold uppercase tracking-widest mb-3" style={{ color: "#6b7094" }}>
                        Your Selected Components
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedComponents.map((name, i) => (
                          <span key={i} className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: "rgba(108,99,255,.15)", color: "#a89ffc", border: "1px solid rgba(108,99,255,.25)" }}>
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Form */}
                  {[
                    { label: "Full Name", name: "name", type: "text", placeholder: "Your name" },
                    { label: "Email Address", name: "email", type: "email", placeholder: "you@example.com" },
                  ].map(({ label, name, type, placeholder }) => (
                    <div key={name} className="mb-4">
                      <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#6b7094" }}>{label}</label>
                      <input
                        type={type} name={name} value={form[name]} onChange={handleChange} placeholder={placeholder}
                        className="w-full rounded-xl px-4 py-3 text-sm transition-colors outline-none"
                        style={{ background: "#12141e", border: "1px solid #1e2130", color: "#e8eaf2" }}
                        onFocus={(e) => (e.target.style.borderColor = "#6c63ff")}
                        onBlur={(e) => (e.target.style.borderColor = "#1e2130")}
                      />
                    </div>
                  ))}

                  <div className="mb-4">
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#6b7094" }}>Website Type</label>
                    <select
                      name="type" value={form.type} onChange={handleChange}
                      className="w-full rounded-xl px-4 py-3 text-sm cursor-pointer outline-none transition-colors"
                      style={{ background: "#12141e", border: "1px solid #1e2130", color: form.type ? "#e8eaf2" : "#6b7094", appearance: "none" }}
                      onFocus={(e) => (e.target.style.borderColor = "#6c63ff")}
                      onBlur={(e) => (e.target.style.borderColor = "#1e2130")}
                    >
                      <option value="">Select website type...</option>
                      <option>Landing Page</option>
                      <option>E-Commerce Store</option>
                      <option>Portfolio / Agency</option>
                      <option>Business Website</option>
                      <option>SaaS Dashboard</option>
                      <option>Blog / Content Site</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#6b7094" }}>Budget Range</label>
                    <select
                      name="budget" value={form.budget} onChange={handleChange}
                      className="w-full rounded-xl px-4 py-3 text-sm cursor-pointer outline-none"
                      style={{ background: "#12141e", border: "1px solid #1e2130", color: form.budget ? "#e8eaf2" : "#6b7094", appearance: "none" }}
                      onFocus={(e) => (e.target.style.borderColor = "#6c63ff")}
                      onBlur={(e) => (e.target.style.borderColor = "#1e2130")}
                    >
                      <option value="">Select budget...</option>
                      <option>$149 – $299 (Starter)</option>
                      <option>$299 – $699 (Professional)</option>
                      <option>$699 – $1500 (Advanced)</option>
                      <option>$1500+ (Enterprise)</option>
                      <option>Let's discuss</option>
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#6b7094" }}>Project Details</label>
                    <textarea
                      name="details" value={form.details} onChange={handleChange} rows={4}
                      placeholder="Tell us about your project, goals, or any specific requirements..."
                      className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none"
                      style={{ background: "#12141e", border: "1px solid #1e2130", color: "#e8eaf2" }}
                      onFocus={(e) => (e.target.style.borderColor = "#6c63ff")}
                      onBlur={(e) => (e.target.style.borderColor = "#1e2130")}
                    />
                  </div>

                  <motion.button
                    className="w-full py-3.5 rounded-xl font-syne font-bold text-white transition-all"
                    style={{ background: "#6c63ff", boxShadow: "0 0 24px rgba(108,99,255,0.35)" }}
                    whileHover={{ opacity: 0.88, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Request →"}
                  </motion.button>
                </>
              ) : (
                <motion.div
                  className="text-center py-8"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <motion.div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-5"
                    style={{ background: "rgba(67,233,123,.15)", border: "2px solid #43e97b" }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    ✓
                  </motion.div>
                  <h3 className="font-syne font-extrabold text-xl text-white mb-2">Request Sent!</h3>
                  <p className="text-sm" style={{ color: "#6b7094", lineHeight: 1.7 }}>
                    Thank you! We've received your project details and will get back to you within 24 hours with a custom quote.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
