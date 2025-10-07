import React, { useState, useEffect } from 'react';
import ImageSlider from './ImageSlider';

function ImageSliderTest() {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getBreakpointInfo = () => {
    const width = screenSize.width;
    if (width < 480) return { name: 'Mobile (XS)', range: '320px - 479px', color: 'bg-red-100 text-red-800' };
    if (width < 768) return { name: 'Mobile (SM)', range: '480px - 767px', color: 'bg-orange-100 text-orange-800' };
    if (width < 1024) return { name: 'Tablet (MD)', range: '768px - 1023px', color: 'bg-yellow-100 text-yellow-800' };
    if (width < 1280) return { name: 'Desktop (LG)', range: '1024px - 1279px', color: 'bg-green-100 text-green-800' };
    if (width < 1536) return { name: 'Desktop (XL)', range: '1280px - 1535px', color: 'bg-blue-100 text-blue-800' };
    return { name: 'Ultra Wide (2XL)', range: '1536px+', color: 'bg-purple-100 text-purple-800' };
  };

  const breakpoint = getBreakpointInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Responsive Info Panel */}
      <div className="sticky top-0 z-50 bg-white shadow-sm border-b p-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900">ImageSlider Responsive Test</h1>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${breakpoint.color}`}>
              {breakpoint.name}
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>Width: <strong>{screenSize.width}px</strong></span>
            <span>Height: <strong>{screenSize.height}px</strong></span>
            <span>Range: <strong>{breakpoint.range}</strong></span>
          </div>
        </div>
      </div>

      {/* ImageSlider Component */}
      <div className="py-8">
        <ImageSlider />
      </div>

      {/* Responsive Features Info */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Breakpoint Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {screenSize.width < 480 && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-medium text-red-900 mb-2">Mobile (XS) Features</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Compact 220px height</li>
                  <li>• 26px title font size</li>
                  <li>• Minimal padding</li>
                  <li>• Hidden emoji icons</li>
                </ul>
              </div>
            )}
            
            {screenSize.width >= 480 && screenSize.width < 768 && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-medium text-orange-900 mb-2">Mobile (SM) Features</h3>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• 240px height</li>
                  <li>• 32px title font size</li>
                  <li>• Visible emoji icons</li>
                  <li>• 36px navigation buttons</li>
                </ul>
              </div>
            )}
            
            {screenSize.width >= 768 && screenSize.width < 1024 && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-medium text-yellow-900 mb-2">Tablet (MD) Features</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• 320px height</li>
                  <li>• 48px title font size</li>
                  <li>• Enhanced padding (32px)</li>
                  <li>• 40px navigation buttons</li>
                </ul>
              </div>
            )}
            
            {screenSize.width >= 1024 && screenSize.width < 1280 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">Desktop (LG) Features</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• 420px height</li>
                  <li>• 64px title font size</li>
                  <li>• Maximum visual impact</li>
                  <li>• 44px navigation buttons</li>
                </ul>
              </div>
            )}
            
            {screenSize.width >= 1280 && screenSize.width < 1536 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Desktop (XL) Features</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 480px height</li>
                  <li>• 72px title font size</li>
                  <li>• Enhanced padding (48px)</li>
                  <li>• Premium experience</li>
                </ul>
              </div>
            )}
            
            {screenSize.width >= 1536 && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-900 mb-2">Ultra Wide (2XL) Features</h3>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• 520px height</li>
                  <li>• 80px title font size</li>
                  <li>• Ultra-premium layout</li>
                  <li>• Maximum screen utilization</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Testing Instructions */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="bg-gray-100 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Testing Instructions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Desktop Testing</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Resize browser window to test breakpoints</li>
                <li>• Use Chrome DevTools device simulation</li>
                <li>• Test different zoom levels</li>
                <li>• Check high DPI displays</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Mobile Testing</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Rotate device to test orientation</li>
                <li>• Test on actual mobile devices</li>
                <li>• Check touch interactions</li>
                <li>• Verify accessibility features</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageSliderTest;
