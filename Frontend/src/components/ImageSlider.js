import React, { useState, useEffect } from "react";
import img1 from "../assets/img1.jpg";
import img2 from "../assets/img2.jpg";
import img3 from "../assets/img3.jpg";
import "./ImageSlider.css";
import "../styles/shared-responsive.css";

const images = [img1, img2, img3];

function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleShopNow = () => {
    try {
      const anchor = document.getElementById("deals");
      if (anchor) anchor.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {}
  };

  return (
    <div className="slider-responsive-container">
      <div className="image-slider-wrapper">
        {/* Slides (sliding track) */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <div
            className="h-full w-full flex transition-transform duration-700 ease-in-out slider-track"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt="slider"
                className="w-full h-full object-cover flex-shrink-0"
              />
            ))}
          </div>
        </div>

        {/* Readability gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent z-10" />

        {/* Overlay content */}
        <div className="slider-content">
          <div className="slider-text-content">
            <div className="hot-deals-badge">
              <span>HOT DEALS</span>
              <span className="emoji-icon">🔥</span>
            </div>
            <div className="mega-sale-title">
              MEGA SALE
            </div>
            <div className="sale-subtitle">
              Up to <span className="sale-percentage">70% OFF</span>
            </div>
            <div className="action-buttons">
              <button
                onClick={handleShopNow}
                className="shop-now-btn"
              >
                Shop Now
              </button>
              <span className="emoji-icon text-white/80 text-lg">🎁</span>
            </div>
          </div>
        </div>

        {/* Arrows */}
        <button
          aria-label="Previous"
          onClick={prevSlide}
          className="nav-button prev"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          aria-label="Next"
          onClick={nextSlide}
          className="nav-button next"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots */}
        <div className="dots-container">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`dot ${currentIndex === index ? "active" : "inactive"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ImageSlider;
