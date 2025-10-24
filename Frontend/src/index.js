import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import ImageSlider from "./components/ImageSlider";
import PromoBar from "./components/PromoBar";
import reportWebVitals from "./reportWebVitals";
import ClassicNavbar from "./components/ClassicNavbar";
import SideNav from "./components/SideNav";
import FlashSalePage from "./components/Flashsale";
import ProductsSection from "./components/Products";
import AuthModal from "./components/AuthModal";
import FiltersSidebar from "./components/FiltersSidebar";
import Footer from "./components/Footer";
import ClassicHomePage from "./components/ClassicHomePage";
import { logout } from "./services/auth";
import { CartProvider, useCart } from "./context/CartContext";
import { ProductsProvider } from "./context/ProductsContext";
import { FlashProductsProvider } from "./context/FlashProductsContext";
import CartPage from "./components/CartPage";
import Profile from "./components/Profile";
import AdminPanel from "./components/AdminPanel";
import Orders from "./components/Orders";
import Community from "./components/Community";
import { motion, AnimatePresence } from "framer-motion";
import { BrowserRouter } from "react-router-dom";
import Chatbot from "./components/Chatbot";
import auth from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

function AppContent({ user, isAdmin, setUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 0]);
  const [view, setView] = useState("home"); // 'home' | 'cart' | 'profile' | 'admin' | 'orders' | 'community'
  const [filtersOpen, setFiltersOpen] = useState(false);
  const dealsRef = useRef(null);
  
  // Debug: Log current view
  useEffect(() => {
    console.log('🏠 Current view:', view);
  }, [view]);

  const allCategories = [
    "Smartphone",
    "Headphones",
    "Sneakers",
    "Smartwatch",
    "Laptop",
    "Backpack",
    "Camera",
    "Tablet",
    "Smart TV",
    "Bluetooth Speaker",
    "Gaming Console"
  ];


  function toggleCategory(cat) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }
  function clearFilters() {
    setSelectedCategories([]);
    setPriceRange([0, 0]);
    setSearchQuery("");
  }

  return (
    <div>
        {/* Navbar with handlers */}
        <ClassicNavbar
        user={user}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onCartClick={() => setView("cart")}
        onCommunityClick={() => setView("community")}
        onLoginClick={() => {
          setActiveTab("login");
          setIsOpen(true);
        }}
        onSignupClick={() => {
          setActiveTab("signup");
          setIsOpen(true);
        }}
        onLogoutClick={() => {
          logout();
          setUser(null);
        }}
      />

      <div className="flex">
        <SideNav
          onHomeClick={() => setView("home")}
          onCartClick={() => setView("cart")}
          onFiltersClick={() => setFiltersOpen(true)}
          onDealsClick={() => {
            // Reset filters so Flash Sale items aren't hidden
            setSearchQuery("");
            setSelectedCategories([]);
            setPriceRange([0, 0]);
            setView("home");
            setTimeout(() => {
              if (dealsRef.current) {
                dealsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }, 0);
          }}
          onProfileClick={() => setView("profile")}
          onOrdersClick={() => setView("orders")}
          onAdminClick={() => setView("admin")}
          onCommunityClick={() => setView("community")}
          isAdmin={isAdmin}
        />
        <div className="flex-1 min-h-screen">
          {view === "cart" && (
            <div className="w-full">
              <CartPage onBack={() => setView("home")} />
            </div>
          )}
          {view === "profile" && (
            <div className="w-full">
              <Profile
                user={user}
                onBack={() => setView("home")}
                onLogout={() => {
                  logout();
                  setUser(null);
                  setView("home");
                }}
                onUserChange={(u) => setUser(u)}
                onOrdersClick={() => setView("orders")}
              />
            </div>
          )}
          {view === "admin" && (
            <div className="w-full">
              <AdminPanel onBack={() => setView("home")} isAdmin={isAdmin} />
            </div>
          )}
          {view === "orders" && (
            <div className="w-full">
              <Orders onBack={() => setView("home")} />
            </div>
          )}
          {view === "community" && (
            <div className="w-full">
              <Community 
                onBack={() => setView("home")} 
                onContactClick={() => {
                  // You can implement contact modal or redirect to contact form
                  window.location.href = 'mailto:contact@shopease.com';
                }}
              />
            </div>
          )}
          {view === "home" && (
            <ClassicHomePage
              searchQuery={searchQuery}
              selectedCategories={selectedCategories}
              priceRange={priceRange}
              onGrabDeal={() => setView("cart")}
              onBuyNow={() => setView("cart")}
            />
          )}
        </div>
      </div>

      {/* Filters Drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-[60]"
              onClick={() => setFiltersOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.aside
              className="fixed top-0 left-0 bottom-0 w-[320px] max-w-[85vw] bg-white z-[61] shadow-xl overflow-y-auto"
              initial={{ x: -360 }}
              animate={{ x: 0 }}
              exit={{ x: -360 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="font-semibold text-lg">Filters</h2>
                <button
                  className="px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300"
                  onClick={() => setFiltersOpen(false)}
                >
                  Close
                </button>
              </div>
              <div className="p-4">
                <FiltersSidebar
                  categories={allCategories}
                  selectedCategories={selectedCategories}
                  onToggleCategory={(c) => toggleCategory(c)}
                  priceRange={priceRange}
                  onPriceChange={setPriceRange}
                  onClear={() => {
                    clearFilters();
                  }}
                />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AuthModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSuccess={async (u) => {
          setUser(u);
          setIsOpen(false);
          // Cart automatically loads from server when user logs in
          console.log('✅ User logged in, cart will load automatically');
        }}
      />

      <div>
        <Footer onCommunityClick={() => setView("community")} />
      </div>
    </div>
  );
}

function RootApp() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const ADMIN_UID = "eOWzgdSCQDNXPyrorChBbkvaTrZ2";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      const mapped = fbUser
        ? { 
            username: fbUser.displayName || (fbUser.email ? fbUser.email.split("@")[0] : "User"), 
            email: fbUser.email || "",
            userId: fbUser.uid
          }
        : null;
      setUser(mapped);
      setIsAdmin(!!fbUser && fbUser.uid === ADMIN_UID);
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  return (
    <CartProvider user={user}>
      <AppContent user={user} isAdmin={isAdmin} setUser={setUser} />
    </CartProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ProductsProvider>
    <FlashProductsProvider>
      <BrowserRouter>
        <RootApp />
      </BrowserRouter>
    </FlashProductsProvider>
  </ProductsProvider>
);

reportWebVitals();
