import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star, Send, CheckCircle, X } from "lucide-react";
import axios from "axios";
import { API_BASE_URL_EXPORT } from "../config/api";

function FeedbackForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: 5,
    feedback: ""
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.feedback.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL_EXPORT}/api/feedback`, {
        ...formData,
        submittedAt: new Date().toISOString()
      });

      if (response.data.success) {
        setSubmitted(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          if (onClose) onClose();
        }, 2000);
      }
    } catch (err) {
      console.error("Feedback submission error:", err);
      setError(err.response?.data?.message || "Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#07080d]/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-[#12141e] border border-[#1e2130] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto text-[#e8eaf2] scrollbar-thin scrollbar-thumb-[#1e2130] scrollbar-track-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        {!submitted ? (
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold font-syne bg-gradient-to-r from-[#6c63ff] to-[#00f2fe] bg-clip-text text-transparent">Share Your Experience</h2>
                <p className="text-[#8a8fbb] mt-2 font-medium">We value your feedback and would love to hear from you</p>
              </div>
              <button
                onClick={onClose}
                className="text-[#6b7094] hover:text-[#e8eaf2] transition-colors p-2 hover:bg-[#1e2130] rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-[#ff6584]/10 border border-[#ff6584]/20 rounded-lg text-[#ff6584] font-semibold text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-semibold text-[#8a8fbb] mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-[#0f1118] border border-[#1e2130] rounded-lg text-[#e8eaf2] placeholder-[#6b7094] focus:border-[#6c63ff] outline-none transition-all duration-200"
                  required
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-[#8a8fbb] mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 bg-[#0f1118] border border-[#1e2130] rounded-lg text-[#e8eaf2] placeholder-[#6b7094] focus:border-[#6c63ff] outline-none transition-all duration-200"
                  required
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold text-[#8a8fbb] mb-3">
                  Your Rating *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      type="button"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRatingClick(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= (hoveredRating || formData.rating)
                            ? "text-yellow-400 fill-current"
                            : "text-[#1e2130] stroke-[#2e324d]"
                        }`}
                      />
                    </motion.button>
                  ))}
                  <span className="ml-3 text-[#8a8fbb] font-semibold">
                    {formData.rating} {formData.rating === 1 ? "star" : "stars"}
                  </span>
                </div>
              </div>

              {/* Feedback Textarea */}
              <div>
                <label className="block text-sm font-semibold text-[#8a8fbb] mb-2">
                  Your Feedback *
                </label>
                <textarea
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleChange}
                  placeholder="Tell us about your experience..."
                  rows={5}
                  className="w-full px-4 py-3 bg-[#0f1118] border border-[#1e2130] rounded-lg text-[#e8eaf2] placeholder-[#6b7094] focus:border-[#6c63ff] outline-none transition-all duration-200 resize-none"
                  required
                />
                <p className="text-sm text-[#6b7094] mt-2 font-medium">
                  {formData.feedback.length} characters
                </p>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-4 rounded-lg font-bold font-syne text-white flex items-center justify-center gap-2 transition-all bg-[#6c63ff] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(108,99,255,0.3)]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Feedback
                  </>
                )}
              </motion.button>
            </form>
          </div>
        ) : (
          // Success State
          <div className="p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
            >
              <CheckCircle className="w-20 h-20 text-[#00f2fe] mx-auto mb-6" />
            </motion.div>
            <h3 className="text-3xl font-bold font-syne bg-gradient-to-r from-[#6c63ff] to-[#00f2fe] bg-clip-text text-transparent mb-4">
              Thank You!
            </h3>
            <p className="text-lg text-[#e8eaf2] mb-2 font-medium">
              Your feedback has been submitted successfully.
            </p>
            <p className="text-[#8a8fbb]">
              We appreciate you taking the time to share your experience with us.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default FeedbackForm;
