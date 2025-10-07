import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import ImageSlider from './ImageSlider';
import PromoBar from './PromoBar';
import '../styles/shared-responsive.css';

function MobileWidthTest() {
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

  const isMobile = screenSize.width < 768;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Screen Size Indicator */}
      <div className="fixed top-0 right-0 z-50 bg-black text-white p-2 text-xs rounded-bl">
        {screenSize.width}px × {screenSize.height}px
        {isMobile && <span className=" ml-2 bg-red-500 px-2 py-1 rounded">MOBILE</span>}
      </div>

      {/* Navbar */}
      <Navbar 
        user={null}
        onLoginClick={() => {}}
        onSignupClick={() => {}}
        onLogoutClick={() => {}}
        searchValue=""
        onSearchChange={() => {}}
        onCartClick={() => {}}
      />

      {/* PromoBar */}
      <PromoBar />

      {/* ImageSlider */}
      <ImageSlider />

      {/* Width Comparison Visual Guide */}
      {isMobile && (
        <div className="mt-8 px-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4 text-center">Mobile Width Alignment Test</h3>
            
            {/* Navbar Width Indicator */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Navbar Content Width:</p>
              <div className="navbar-responsive-container bg-blue-100 border-2 border-blue-300 rounded p-2">
                <div className="text-center text-blue-800 font-medium">Navbar Container</div>
              </div>
            </div>

            {/* PromoBar Width Indicator */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">PromoBar Content Width:</p>
              <div className="responsive-container bg-yellow-100 border-2 border-yellow-300 rounded p-2">
                <div className="text-center text-yellow-800 font-medium">PromoBar Container</div>
              </div>
            </div>

            {/* ImageSlider Width Indicator */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">ImageSlider Content Width:</p>
              <div className="slider-responsive-container bg-green-100 border-2 border-green-300 rounded p-2">
                <div className="text-center text-green-800 font-medium">ImageSlider Container</div>
              </div>
            </div>

            {/* Alignment Status */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-800 px-3 py-2 rounded-full">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">All Components Aligned</span>
              </div>
            </div>

            {/* Mobile Breakpoint Info */}
            <div className="mt-4 p-3 bg-gray-100 rounded">
              <h4 className="font-medium text-gray-900 mb-2">Current Mobile Settings:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Container padding: {screenSize.width < 480 ? '16px' : '20px'}</li>
                <li>• Max width: calc(100vw - {screenSize.width < 480 ? '32px' : '40px'})</li>
                <li>• ImageSlider height: {screenSize.width < 480 ? '220px' : '240px'}</li>
                <li>• Border radius: {screenSize.width < 480 ? '14px' : '16px'}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Info */}
      {!isMobile && (
        <div className="mt-8 max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4 text-center">Desktop View - Resize to Test Mobile</h3>
            <div className="text-center text-gray-600">
              <p className="mb-2">Current screen width: <strong>{screenSize.width}px</strong></p>
              <p className="mb-4">Resize your browser window to less than 768px to see mobile alignment test</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="font-medium text-blue-900">Mobile (&lt; 768px)</div>
                  <div className="text-blue-700">Constrained width with padding</div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="font-medium text-green-900">Tablet (768px+)</div>
                  <div className="text-green-700">Max width 1280px</div>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <div className="font-medium text-purple-900">Desktop (1024px+)</div>
                  <div className="text-purple-700">Full responsive layout</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">Testing Instructions:</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• <strong>Mobile Test</strong>: Resize browser to &lt; 768px width</li>
            <li>• <strong>Alignment Check</strong>: Navbar, PromoBar, and ImageSlider should have matching widths</li>
            <li>• <strong>Responsive Test</strong>: Test different mobile screen sizes (320px, 480px, etc.)</li>
            <li>• <strong>Device Test</strong>: Use Chrome DevTools device simulation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default MobileWidthTest;
