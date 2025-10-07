import React, { useState, useEffect } from "react";
import img1 from "../assets/img1.jpg";
import img2 from "../assets/img2.jpg";
import img3 from "../assets/img3.jpg";

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
    <div className="w-full flex justify-center px-2 sm:px-4 lg:px-6 mt-3">
      <div className="relative w-full max-w-7xl h-64 sm:h-80 lg:h-[420px] mx-auto rounded-2xl overflow-hidden bg-white shadow-md">
        {/* Slides (sliding track) */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <div
            className="h-full w-full flex transition-transform duration-700 ease-in-out"
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
        <div className="absolute inset-y-0 left-0 flex items-center z-20">
          <div className="px-4 sm:px-8">
            <div className="inline-flex items-center gap-2 bg-red-600 text-white text-[10px] sm:text-xs px-3 py-1 rounded-full shadow">
              <span>HOT DEALS</span>
              <span className="hidden sm:inline">🔥</span>
            </div>
            <div className="mt-3 sm:mt-4">
              <div className="text-white font-extrabold leading-[1.05] text-3xl sm:text-5xl drop-shadow">
                MEGA SALE
              </div>
              <div className="text-white/90 mt-1 sm:mt-2 text-base sm:text-xl">
                Up to <span className="font-bold text-yellow-300">70% OFF</span>
              </div>
            </div>
            <div className="mt-4 sm:mt-6 flex items-center gap-3">
              <button
                onClick={handleShopNow}
                className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-5 py-2 rounded-full shadow"
              >
                Shop Now
              </button>
              <span className="hidden sm:inline text-white/80 text-lg">🎁</span>
            </div>
          </div>
        </div>

        {/* Arrows */}
        <button
          aria-label="Previous"
          onClick={prevSlide}
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow z-30"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          aria-label="Next"
          onClick={nextSlide}
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow z-30"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-30">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-colors ${
                currentIndex === index ? "bg-white" : "bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ImageSlider;
