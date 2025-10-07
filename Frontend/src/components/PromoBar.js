import React from "react";

export default function PromoBar() {
  const items = [
    { icon: "⏰", text: "Limited Time Offer!" },
    { icon: "🎁", text: "Buy 2 Get 1 FREE" },
    { icon: "💰", text: "Save up to 50%" },
    { icon: "🚚", text: "Fast Shipping" },
  ];

  return (
    <div className="w-full flex justify-center px-2 sm:px-4 lg:px-6 mt-3 sm:mt-4">
      <div className="w-full max-w-7xl">
        <div className="rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 text-[#1A1E21] shadow-md">
          <div className="flex items-center justify-center gap-3 sm:gap-6 px-3 sm:px-6 py-2 text-xs sm:text-sm font-semibold">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-base sm:text-lg">{item.icon}</span>
                <span>{item.text}</span>
                {idx < items.length - 1 && (
                  <span className="hidden sm:inline-block w-px h-4 bg-black/20 ml-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
