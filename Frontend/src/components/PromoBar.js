import React from "react";
import "../styles/shared-responsive.css";

export default function PromoBar() {
  const items = [
    { icon: "⏰", text: "Limited Time Offer!" },
    { icon: "🎁", text: "Buy 2 Get 1 FREE" },
    { icon: "💰", text: "Save up to 50%" },
    { icon: "🚚", text: "Fast Shipping" },
  ];

  return (
    <div className="responsive-container mt-3 sm:mt-4">
      <div className="rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 text-[#1A1E21] shadow-md overflow-hidden">
        {/* Mobile: Show only first 2 items in a scrollable container */}
        <div className="block sm:hidden">
          <div className="flex items-center gap-4 px-4 py-2 text-xs font-semibold overflow-x-auto scrollbar-hide">
            {items.slice(0, 2).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
                <span className="text-base">{item.icon}</span>
                <span className="text-xs">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Desktop: Show all items with separators */}
        <div className="hidden sm:flex items-center justify-center gap-6 px-6 py-2 text-sm font-semibold">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-lg">{item.icon}</span>
              <span>{item.text}</span>
              {idx < items.length - 1 && (
                <span className="inline-block w-px h-4 bg-black/20 ml-2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
