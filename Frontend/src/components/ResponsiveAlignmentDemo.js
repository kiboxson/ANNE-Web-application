import React from 'react';
import Navbar from './Navbar';
import PromoBar from './PromoBar';
import ImageSlider from './ImageSlider';
import '../styles/shared-responsive.css';

function ResponsiveAlignmentDemo() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Responsive Width Alignment Demo
          </h1>
          <p className="text-gray-600">
            All components (Navbar, PromoBar, ImageSlider) now use consistent responsive containers
          </p>
        </div>
      </div>

      {/* Components */}
      <div className="space-y-0">
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
      </div>

      {/* Alignment Indicators */}
      <div className="mt-8 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Navbar Indicator */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              Navbar Container
            </h3>
            <div className="navbar-responsive-container bg-blue-50 border-2 border-blue-200 rounded p-3">
              <div className="text-center text-blue-800 text-sm font-medium">
                navbar-responsive-container
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              • Top navigation bar<br/>
              • Search functionality<br/>
              • User authentication<br/>
              • Mobile menu support
            </div>
          </div>

          {/* PromoBar Indicator */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              PromoBar Container
            </h3>
            <div className="responsive-container bg-yellow-50 border-2 border-yellow-200 rounded p-3">
              <div className="text-center text-yellow-800 text-sm font-medium">
                responsive-container
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              • Promotional offers<br/>
              • Limited time deals<br/>
              • Shipping information<br/>
              • Call-to-action messages
            </div>
          </div>

          {/* ImageSlider Indicator */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              ImageSlider Container
            </h3>
            <div className="slider-responsive-container bg-green-50 border-2 border-green-200 rounded p-3">
              <div className="text-center text-green-800 text-sm font-medium">
                slider-responsive-container
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              • Hero image carousel<br/>
              • Product showcases<br/>
              • Marketing banners<br/>
              • Interactive navigation
            </div>
          </div>
        </div>

        {/* Responsive Breakpoints Info */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Responsive Breakpoints</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">Mobile XS</h4>
              <div className="text-sm text-red-700">
                <div className="font-medium">&lt; 320px</div>
                <div>Padding: 12px</div>
                <div>Max-width: calc(100vw - 24px)</div>
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">Mobile SM</h4>
              <div className="text-sm text-orange-700">
                <div className="font-medium">320px - 479px</div>
                <div>Padding: 16px</div>
                <div>Max-width: calc(100vw - 32px)</div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Mobile LG</h4>
              <div className="text-sm text-yellow-700">
                <div className="font-medium">480px - 767px</div>
                <div>Padding: 20px</div>
                <div>Max-width: calc(100vw - 40px)</div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Tablet+</h4>
              <div className="text-sm text-green-700">
                <div className="font-medium">768px+</div>
                <div>Padding: 24px+</div>
                <div>Max-width: 1280px</div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-center gap-3">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-900">Perfect Alignment Achieved!</h3>
              <p className="text-green-700 mt-1">
                All components now use consistent responsive containers for seamless mobile experience
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResponsiveAlignmentDemo;
