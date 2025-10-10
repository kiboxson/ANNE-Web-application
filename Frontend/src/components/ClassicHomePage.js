import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Star, Shield, Truck, Clock, Award, Users, Heart } from "lucide-react";
import PromoBar from "./PromoBar";
import ImageSlider from "./ImageSlider";
import FlashSalePage from "./Flashsale";
import ProductsSection from "./Products";
import Chatbot from "./Chatbot";
import "../styles/classic-home.css";

function ClassicHomePage({ 
  searchQuery, 
  selectedCategories, 
  priceRange, 
  onGrabDeal, 
  onBuyNow 
}) {
  const dealsRef = useRef(null);

  const features = [
    {
      icon: Shield,
      title: "Premium Quality",
      description: "Carefully curated products that meet our highest standards of excellence and craftsmanship."
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Swift and reliable shipping to your doorstep with real-time tracking and updates."
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer service to assist you with any questions or concerns."
    },
    {
      icon: Award,
      title: "Best Prices",
      description: "Competitive pricing with exclusive deals and seasonal discounts for our valued customers."
    }
  ];

  const stats = [
    { icon: Users, number: "50K+", label: "Happy Customers" },
    { icon: Heart, number: "1M+", label: "Products Sold" },
    { icon: Star, number: "4.9", label: "Average Rating" },
    { icon: Award, number: "8+", label: "Years of Excellence" }
  ];

  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "Verified Buyer",
      text: "Exceptional quality and service. Every purchase has exceeded my expectations.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "David Chen",
      role: "Regular Customer",
      text: "Fast shipping, great prices, and outstanding customer support. Highly recommended!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "Emily Rodriguez",
      role: "Premium Member",
      text: "The quality of products and attention to detail is remarkable. A truly premium experience.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face"
    }
  ];

  return (
    <div className="classic-home-page">
      {/* Gap between navbar and content */}
      <div className="h-6 bg-gradient-to-b from-gray-50 to-transparent"></div>
      
      {/* Classic Hero Section */}
      <div className="relative">
        <PromoBar />
        <ImageSlider />
        
        {/* Elegant Overlay Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-center text-white px-4 sm:px-6 md:px-8 max-w-4xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-serif font-bold mb-4 sm:mb-6 leading-tight"
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}
            >
              Timeless Elegance
            </motion.h1>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (dealsRef.current) {
                  dealsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
              className="hero-button bg-white text-gray-900 px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-none font-semibold text-sm sm:text-base md:text-lg tracking-wider uppercase hover:bg-gray-100 transition-all duration-300 shadow-lg"
            >
              Explore Collection
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Classic Features Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
              Why Choose Excellence
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gray-400 to-gray-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We believe in delivering more than just products – we deliver experiences that exceed expectations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="text-center p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-gray-700" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-16 bg-gray-900 text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-gray-300 text-sm uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Products Section with Classic Styling */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div ref={dealsRef} id="deals" className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
                Featured Collections
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-gray-400 to-gray-600 mx-auto mb-6"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Handpicked selections from our premium catalog, curated for the sophisticated shopper
              </p>
            </motion.div>
          </div>

          <FlashSalePage
            searchQuery={searchQuery}
            selectedCategories={selectedCategories}
            priceRange={priceRange}
            onGrabDeal={onGrabDeal}
          />

          <div className="mt-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
                Our Signature Products
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-gray-400 to-gray-600 mx-auto mb-6"></div>
            </motion.div>

            <ProductsSection
              searchQuery={searchQuery}
              selectedCategories={selectedCategories}
              priceRange={priceRange}
              onBuyNow={onBuyNow}
            />
          </div>
        </div>
      </div>

      {/* Classic Testimonials Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
              Voices of Satisfaction
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gray-400 to-gray-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from our valued customers who have experienced the difference of true quality
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                  "{testimonial.text}"
                </blockquote>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Call to Action Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 bg-gray-900 text-white text-center"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Begin Your Journey
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Join thousands of satisfied customers who have discovered the art of refined shopping
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (dealsRef.current) {
                dealsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
            className="bg-white text-gray-900 px-8 py-4 rounded-none font-semibold text-lg tracking-wider uppercase hover:bg-gray-100 transition-all duration-300"
          >
            Start Shopping
          </motion.button>
        </div>
      </motion.section>

      <Chatbot />
    </div>
  );
}

export default ClassicHomePage;
