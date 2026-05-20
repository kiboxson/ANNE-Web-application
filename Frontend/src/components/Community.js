import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Users, Heart, Award, Globe } from "lucide-react";
import ContactModal from "./ContactModal";
import kibo from "../assets/kibo.jpg"

function Community({ onBack, onContactClick }) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const teamMembers = [
    {
      id: 1,
      name: "PRAKASH LEENA",
      role: "Founder & CEO",
      image: kibo,
      bio: "Passionate entrepreneur dedicated to revolutionizing the e-commerce experience and bringing quality products to customers worldwide.",
      expertise: ["E-commerce Strategy", "Business Development", "Customer Experience"]
    }
  ];

  const stats = [
    { icon: Users, label: "Happy Customers", value: "50K+" },
    { icon: Award, label: "Years of Excellence", value: "8+" },
    { icon: Globe, label: "Countries Served", value: "25+" },
    { icon: Heart, label: "Products Sold", value: "1M+" }
  ];

  const testimonials = [
    {
      id: 1,
      name: "Alex Thompson",
      role: "Regular Customer",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      text: "Anne has completely transformed my online shopping experience. The quality and service are unmatched!",
      rating: 5
    },
    {
      id: 2,
      name: "Maria Garcia",
      role: "Business Owner",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      text: "As a small business owner, I appreciate the reliable service and excellent customer support from the Anne team.",
      rating: 5
    },
    {
      id: 3,
      name: "John Chen",
      role: "Tech Enthusiast",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      text: "The platform is intuitive, fast, and always has the latest products. Highly recommend to anyone!",
      rating: 5
    }
  ];

  const handleContactUs = () => {
    setIsContactModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#07080d] font-dmsans text-[#e8eaf2]">
      {/* Header */}
      <div className="bg-[#0f1118] border-b border-[#1e2130] pt-20 sm:pt-24 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-[#6b7094] hover:text-[#e8eaf2] transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </button>
            <h1 className="text-xl sm:text-2xl font-syne font-bold text-[#e8eaf2]">Our Community</h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-syne font-bold text-white mb-6">
            Welcome to Our Community
          </h2>
          <p className="text-lg sm:text-xl text-[#6b7094] max-w-3xl mx-auto leading-relaxed">
            We're more than just an e-commerce platform. We're a community of passionate individuals 
            dedicated to bringing you the best shopping and creation experience possible.
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-6 bg-[#12141e] border border-[#1e2130] rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.15)]">
              <stat.icon className="w-8 h-8 text-[#6c63ff] mx-auto mb-3" />
              <div className="text-2xl sm:text-3xl font-syne font-bold text-[#e8eaf2] mb-1">{stat.value}</div>
              <div className="text-sm text-[#6b7094] font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Who We Are Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <div className="bg-[#12141e] border border-[#1e2130] rounded-2xl p-8 md:p-12 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
            <h3 className="text-3xl font-syne font-bold text-[#e8eaf2] mb-8 text-center">Who We Are</h3>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-base sm:text-lg text-[#6b7094] mb-6 leading-relaxed">
                  Founded in 2016, Anne began as a simple idea: to make online shopping 
                  and digital building more personal, reliable, and enjoyable. What started as a small team with 
                  big dreams has grown into a thriving community of innovators, creators, and 
                  customer advocates.
                </p>
                <p className="text-base sm:text-lg text-[#6b7094] mb-6 leading-relaxed">
                  We believe that great products deserve great experiences. That's why we've 
                  built our platform around three core principles: quality, trust, and innovation. 
                  Every decision we make is guided by our commitment to serving our customers better.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-[#6c63ff]/10 text-[#6c63ff] border border-[#6c63ff]/20 rounded-full text-sm font-medium">
                    Customer-First
                  </span>
                  <span className="px-4 py-2 bg-[#43e97b]/10 text-[#43e97b] border border-[#43e97b]/20 rounded-full text-sm font-medium">
                    Innovation-Driven
                  </span>
                  <span className="px-4 py-2 bg-[#ff6584]/10 text-[#ff6584] border border-[#ff6584]/20 rounded-full text-sm font-medium">
                    Quality-Focused
                  </span>
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop"
                  alt="Our team working together"
                  className="rounded-xl shadow-lg w-full h-80 object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl"></div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Team Members Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-syne font-bold text-[#e8eaf2] mb-8 text-center">Meet Our Team</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-[#12141e] border border-[#1e2130] rounded-2xl p-6 hover:border-[#6c63ff] transition-all shadow-[0_4px_15px_rgba(0,0,0,0.15)] cursor-pointer"
                onClick={() => setSelectedMember(member)}
              >
                <div className="text-center">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-[#1e2130]"
                  />
                  <h4 className="text-xl font-syne font-bold text-[#e8eaf2] mb-1">{member.name}</h4>
                  <p className="text-[#6c63ff] font-medium mb-3">{member.role}</p>
                  <p className="text-[#6b7094] text-sm leading-relaxed mb-4">{member.bio}</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {member.expertise.slice(0, 2).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-[#0f1118] border border-[#1e2130] text-[#e8eaf2] rounded-full text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-syne font-bold text-[#e8eaf2] mb-8 text-center">What Our Customers Say</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-[#12141e] border border-[#1e2130] rounded-2xl p-6 shadow-[0_4px_15px_rgba(0,0,0,0.15)] hover:border-[#6c63ff] transition-all"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[#6b7094] italic mb-6 leading-relaxed">
                  "{testimonial.id === 1 ? "Anne has completely transformed my online presence. The templates and service are unmatched!" : testimonial.id === 2 ? "As a small business owner, I appreciate the reliable builder and excellent customer support from the Anne team." : testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#1e2130]"
                  />
                  <div>
                    <p className="font-syne font-bold text-[#e8eaf2] text-sm">{testimonial.name}</p>
                    <p className="text-xs text-[#6b7094]">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Location & Contact Section */}
        <motion.section
          id="contact-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-syne font-bold text-[#e8eaf2] mb-8 text-center">Visit Us</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="bg-[#12141e] border border-[#1e2130] rounded-2xl p-8 shadow-[0_4px_15px_rgba(0,0,0,0.15)] flex flex-col justify-between">
              <div>
                <h4 className="text-2xl font-syne font-bold text-[#e8eaf2] mb-6">Get in Touch</h4>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <MapPin className="w-6 h-6 text-[#6c63ff]" />
                    <div>
                      <p className="font-semibold text-[#e8eaf2]">Headquarters</p>
                      <p className="text-[#6b7094]">No-06, Vankalai, Mannar</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Phone className="w-6 h-6 text-[#6c63ff]" />
                    <div>
                      <p className="font-semibold text-[#e8eaf2]">Phone</p>
                      <p className="text-[#6b7094]">+94701269689</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Mail className="w-6 h-6 text-[#6c63ff]" />
                    <div>
                      <p className="font-semibold text-[#e8eaf2]">Email</p>
                      <p className="text-[#6b7094]">kiboxsonleena51@gmail.com</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Contact Us Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleContactUs}
                className="w-full mt-8 bg-[#6c63ff] text-white font-semibold py-4 px-6 rounded-xl hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(108,99,255,0.3)]"
              >
                Contact Us Now
              </motion.button>
            </div>

            {/* Map/Office Image */}
            <div className="bg-[#12141e] border border-[#1e2130] rounded-2xl overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.15)]">
              <div className="relative h-full min-h-[300px]">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop"
                  alt="Our office location"
                  className="w-full h-full object-cover opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h5 className="text-xl font-syne font-bold mb-2">Our Design Studio</h5>
                  <p className="text-[#e8eaf2]/80">Creative workspace where web builders are reimagined</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center bg-gradient-to-r from-[#6c63ff]/20 to-[#c850c0]/20 border border-[#6c63ff]/30 rounded-2xl p-12 text-[#e8eaf2] shadow-2xl"
        >
          <h3 className="text-3xl font-syne font-bold mb-4">Join Our Community</h3>
          <p className="text-lg mb-8 text-[#6b7094] max-w-2xl mx-auto">
            Be part of something bigger. Connect with us, share your feedback, and help us build 
            the future of web creation together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleContactUs}
              className="bg-[#6c63ff] text-white font-semibold py-3 px-8 rounded-xl hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(108,99,255,0.35)]"
            >
              Get in Touch
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="border border-[#1e2130] bg-[#161921] text-[#6b7094] hover:text-[#e8eaf2] font-semibold py-3 px-8 rounded-xl transition-colors"
            >
              Start Shopping
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Team Member Modal */}
      {selectedMember && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMember(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#12141e] border border-[#1e2130] rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <img
                src={selectedMember.image}
                alt={selectedMember.name}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-[#1e2130]"
              />
              <h4 className="text-2xl font-syne font-bold text-white mb-2">{selectedMember.name}</h4>
              <p className="text-[#6c63ff] font-semibold mb-4">{selectedMember.role}</p>
              <p className="text-[#6b7094] mb-6 leading-relaxed">{selectedMember.bio}</p>
              
              <div className="mb-6">
                <h5 className="font-semibold text-white mb-3">Expertise</h5>
                <div className="flex flex-wrap gap-2 justify-center">
                  {selectedMember.expertise.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-[#6c63ff]/10 text-[#6c63ff] border border-[#6c63ff]/20 rounded-full text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => setSelectedMember(null)}
                className="w-full bg-[#161921] border border-[#1e2130] text-[#6b7094] hover:text-[#e8eaf2] font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Contact Modal */}
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />
    </div>
  );
}

export default Community;
