import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, Mail, MessageSquare } from "lucide-react";

function ContactModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Reset form after 2 seconds and close modal
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ name: "", email: "", subject: "", message: "" });
        onClose();
      }, 2000);
    }, 1500);
  };

  const resetModal = () => {
    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitted(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#07080d]/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#12141e] border border-[#1e2130] rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto text-[#e8eaf2] scrollbar-thin scrollbar-thumb-[#1e2130] scrollbar-track-transparent"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-syne bg-gradient-to-r from-[#6c63ff] to-[#00f2fe] bg-clip-text text-transparent">Contact Us</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-[#1e2130] rounded-full transition-colors text-[#6b7094] hover:text-[#e8eaf2]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isSubmitted ? (
            /* Success Message */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-[#00f2fe]/10 border border-[#00f2fe]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#00f2fe]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold font-syne text-[#e8eaf2] mb-2">Message Sent!</h3>
              <p className="text-[#8a8fbb]">
                Thank you for reaching out. We'll get back to you within 24 hours.
              </p>
            </motion.div>
          ) : (
            /* Contact Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-[#8a8fbb] mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2 text-[#6c63ff]" />
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-[#0f1118] border border-[#1e2130] rounded-lg text-[#e8eaf2] placeholder-[#6b7094] focus:border-[#6c63ff] outline-none transition-colors duration-200"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-[#8a8fbb] mb-2 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-[#6c63ff]" />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-[#0f1118] border border-[#1e2130] rounded-lg text-[#e8eaf2] placeholder-[#6b7094] focus:border-[#6c63ff] outline-none transition-colors duration-200"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-[#8a8fbb] mb-2">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-[#0f1118] border border-[#1e2130] rounded-lg text-[#e8eaf2] focus:border-[#6c63ff] outline-none transition-colors duration-200 cursor-pointer"
                >
                  <option value="" className="bg-[#0f1118] text-[#e8eaf2]">Select a subject</option>
                  <option value="general" className="bg-[#0f1118] text-[#e8eaf2]">General Inquiry</option>
                  <option value="support" className="bg-[#0f1118] text-[#e8eaf2]">Customer Support</option>
                  <option value="partnership" className="bg-[#0f1118] text-[#e8eaf2]">Partnership</option>
                  <option value="feedback" className="bg-[#0f1118] text-[#e8eaf2]">Feedback</option>
                  <option value="other" className="bg-[#0f1118] text-[#e8eaf2]">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-[#8a8fbb] mb-2 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2 text-[#6c63ff]" />
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-[#0f1118] border border-[#1e2130] rounded-lg text-[#e8eaf2] placeholder-[#6b7094] focus:border-[#6c63ff] outline-none transition-colors duration-200 resize-none"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 bg-transparent border border-[#1e2130] text-[#e8eaf2] rounded-lg hover:bg-[#1e2130] transition-colors font-semibold font-syne"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-[#6c63ff] text-white rounded-lg hover:opacity-90 transition-all font-semibold font-syne disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(108,99,255,0.25)]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Contact Info */}
          {!isSubmitted && (
            <div className="mt-8 pt-6 border-t border-[#1e2130]">
              <p className="text-sm text-[#8a8fbb] text-center mb-4 font-semibold">
                Or reach us directly:
              </p>
              <div className="flex justify-center gap-6 text-sm text-[#8a8fbb]">
                <div className="text-center flex flex-col items-center">
                  <Mail className="w-4 h-4 mb-1 text-[#6c63ff]" />
                  <p>contact@anne.com</p>
                </div>
                <div className="text-center flex flex-col items-center">
                  <svg className="w-4 h-4 mb-1 text-[#6c63ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <p>+1 (555) 123-4567</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ContactModal;
