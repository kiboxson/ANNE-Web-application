import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts } from "../context/ProductsContext";
import { useFlashProducts } from "../context/FlashProductsContext";
import storageService from "../services/storage";
import axios from "axios";
import { API_BASE_URL_EXPORT } from '../config/api';
import EmailTest from "./EmailTest";
import PayHereConfig from "./PayHereConfig";

export default function AdminPanel({ onBack, isAdmin = false }) {
  const [tab, setTab] = useState("products");

  // Shared products state
  const { products, addProduct: ctxAddProduct, removeProduct: ctxRemoveProduct, refreshProducts } = useProducts();
  const { flashProducts, addFlashProduct: ctxAddFlashProduct, removeFlashProduct: ctxRemoveFlashProduct, refreshFlashProducts } = useFlashProducts();
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackFilter, setFeedbackFilter] = useState('all');
  const [communityContent, setCommunityContent] = useState({});
  const [communitySection, setCommunitySection] = useState('stats');
  const [editingCommunity, setEditingCommunity] = useState(null);

  const [form, setForm] = useState({ title: "", price: "", stock: "", category: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [filter, setFilter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Flash sale state
  const [flashForm, setFlashForm] = useState({ title: "", price: "", stock: "", category: "", discount: "", startsAt: "", endsAt: "" });
  const [flashImageFile, setFlashImageFile] = useState(null);
  const [flashImagePreview, setFlashImagePreview] = useState("");
  const [isFlashSubmitting, setIsFlashSubmitting] = useState(false);
  const [cloudName, setCloudName] = useState(() => {
    try { return localStorage.getItem('CLOUDINARY_CLOUD_NAME') || ''; } catch { return ''; }
  });
  const [uploadPreset, setUploadPreset] = useState(() => {
    try { return localStorage.getItem('CLOUDINARY_UPLOAD_PRESET') || ''; } catch { return ''; }
  });

  // Chat state
  const [chatSessions, setChatSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [adminMessage, setAdminMessage] = useState("");

  function saveCloudinaryConfig(e) {
    e.preventDefault();
    try {
      localStorage.setItem('CLOUDINARY_CLOUD_NAME', cloudName.trim());
      localStorage.setItem('CLOUDINARY_UPLOAD_PRESET', uploadPreset.trim());
      alert('Cloudinary config saved. You can upload images now.');
    } catch (err) {
      alert('Failed to save Cloudinary config to localStorage.');
    }
  }

  const filteredProducts = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [products, filter]);


  async function addProduct(e) {
    e.preventDefault();
    const title = form.title.trim();
    const price = Number(form.price);
    const stock = Number(form.stock);
    const category = form.category.trim() || "General";

    if (!title || isNaN(price) || isNaN(stock)) return;

    setIsSubmitting(true);

    try {
      // Validate image file if provided
      if (imageFile) {
        const validation = storageService.validateImageFile(imageFile);
        if (!validation.isValid) {
          alert(validation.error);
          setIsSubmitting(false);
          return;
        }
      }

      // Add product with image upload handled by ProductsContext
      await ctxAddProduct({ title, price, stock, category, imageFile });

      // Refresh products to ensure both admin panel and home page are updated
      await refreshProducts();

      // Reset form on success
      setForm({ title: "", price: "", stock: "", category: "" });
      setImageFile(null);
      if (imagePreview) {
        storageService.revokePreviewUrl(imagePreview);
      }
      setImagePreview("");
      
      console.log('Product added successfully, products refreshed');
    } catch (error) {
      console.error('Failed to add product:', error);
      alert(`Failed to add product: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  function deleteProduct(id) {
    ctxRemoveProduct(id);
  }

  // migrateProducts removed


  // Chat functions
  useEffect(() => {
    if (tab === "chat") {
      loadChatSessions();
      const interval = setInterval(loadChatSessions, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [tab]);

  // Load users when users tab is selected
  useEffect(() => {
    if (tab === "users") {
      loadUsers();
    }
  }, [tab]);

  // Load orders when orders tab is selected
  useEffect(() => {
    if (tab === "orders") {
      loadOrders();
    }
  }, [tab]);

  // Load feedback when feedback tab is selected
  useEffect(() => {
    if (tab === "feedback") {
      loadFeedback();
    }
  }, [tab]);

  // Load community content when community tab is selected
  useEffect(() => {
    if (tab === "community") {
      loadCommunityContent();
    }
  }, [tab]);

  useEffect(() => {
    if (selectedSession) {
      loadChatMessages(selectedSession);
      const interval = setInterval(() => loadChatMessages(selectedSession), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedSession]);

  async function loadChatSessions() {
    try {
      const response = await axios.get(`${API_BASE_URL_EXPORT}/api/chat-sessions`);
      setChatSessions(response.data);
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
    }
  }

  async function loadChatMessages(sessionId) {
    try {
      const response = await axios.get(`${API_BASE_URL_EXPORT}/api/chat/${sessionId}`);
      setChatMessages(response.data);
      // Mark messages as read
      await axios.put(`${API_BASE_URL_EXPORT}/api/chat/${sessionId}/read`);
    } catch (error) {
      console.error('Failed to load chat messages:', error);
    }
  }

  async function sendAdminMessage() {
    if (!adminMessage.trim() || !selectedSession) return;
    
    try {
      await axios.post(`${API_BASE_URL_EXPORT}/api/chat`, {
        message: adminMessage.trim(),
        sender: 'admin',
        senderName: 'Admin Support',
        sessionId: selectedSession
      });
      
      setAdminMessage("");
      loadChatMessages(selectedSession);
    } catch (error) {
      console.error('Failed to send admin message:', error);
    }
  }

  // User management functions
  async function loadUsers() {
    try {
      const response = await axios.get(`${API_BASE_URL_EXPORT}/api/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  }

  async function toggleUserRole(userId) {
    try {
      const user = users.find(u => u.userId === userId);
      if (!user) return;
      
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      
      await axios.put(`${API_BASE_URL_EXPORT}/api/users/${userId}/role`, { role: newRole });
      
      // Update local state
      setUsers(prev => 
        prev.map(u => u.userId === userId ? { ...u, role: newRole } : u)
      );
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  }

  // Order management functions
  async function loadOrders() {
    try {
      const response = await axios.get(`${API_BASE_URL_EXPORT}/api/orders`);
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  }

  async function updateOrderStatus(orderId, newStatus) {
    try {
      await axios.put(`${API_BASE_URL_EXPORT}/api/orders/${orderId}/status`, { status: newStatus });
      
      // If order is being cancelled, send cancellation email
      if (newStatus === 'cancelled') {
        const order = orders.find(o => o.orderId === orderId);
        if (order) {
          try {
            await axios.post(`${API_BASE_URL_EXPORT}/api/send-cancellation-email`, {
              orderId: order.orderId,
              customerName: order.customerName,
              customerEmail: order.customerEmail,
              totalAmount: order.totalAmount,
              items: order.items,
              orderDate: order.orderDate
            });
            console.log('✅ Cancellation email sent successfully');
          } catch (emailError) {
            console.error('❌ Failed to send cancellation email:', emailError);
            // Don't block the status update if email fails
          }
        }
      }
      
      // Update local state
      setOrders(prev => 
        prev.map(order => 
          order.orderId === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );
      
      // Show success message
      if (newStatus === 'cancelled') {
        window.alert(`Order #${orderId} cancelled successfully! Cancellation email sent to customer.`);
      } else {
        window.alert(`Order #${orderId} status updated to ${newStatus} successfully!`);
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      window.alert('Failed to update order status: ' + error.message);
    }
  }

  // Feedback management functions
  async function loadFeedback() {
    try {
      const response = await axios.get(`${API_BASE_URL_EXPORT}/api/feedback`);
      if (response.data.success) {
        setFeedbacks(response.data.feedbacks);
      }
    } catch (error) {
      console.error('Failed to load feedback:', error);
    }
  }

  async function updateFeedbackStatus(feedbackId, newStatus) {
    try {
      await axios.patch(`${API_BASE_URL_EXPORT}/api/feedback/${feedbackId}`, { status: newStatus });
      
      // Update local state
      setFeedbacks(prev => 
        prev.map(fb => 
          fb._id === feedbackId 
            ? { ...fb, status: newStatus }
            : fb
        )
      );
      
      window.alert(`Feedback ${newStatus} successfully!`);
    } catch (error) {
      console.error('Failed to update feedback status:', error);
      window.alert('Failed to update feedback status: ' + error.message);
    }
  }

  async function deleteFeedback(feedbackId) {
    if (!window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL_EXPORT}/api/feedback/${feedbackId}`);
      
      // Remove from local state
      setFeedbacks(prev => prev.filter(fb => fb._id !== feedbackId));
      
      window.alert('Feedback deleted successfully!');
    } catch (error) {
      console.error('Failed to delete feedback:', error);
      window.alert('Failed to delete feedback: ' + error.message);
    }
  }

  // Filter feedbacks based on status
  const filteredFeedbacks = useMemo(() => {
    if (feedbackFilter === 'all') return feedbacks;
    return feedbacks.filter(fb => fb.status === feedbackFilter);
  }, [feedbacks, feedbackFilter]);

  // Community content management functions
  async function loadCommunityContent() {
    try {
      const response = await axios.get(`${API_BASE_URL_EXPORT}/api/community`);
      if (response.data.success) {
        setCommunityContent(response.data.sections);
      }
    } catch (error) {
      console.error('Failed to load community content:', error);
    }
  }

  async function updateCommunitySection(section, content) {
    try {
      await axios.put(`${API_BASE_URL_EXPORT}/api/community/${section}`, { content });
      
      // Update local state
      setCommunityContent(prev => ({
        ...prev,
        [section]: { content, updatedAt: new Date() }
      }));
      
      window.alert(`${section} section updated successfully!`);
      setEditingCommunity(null);
    } catch (error) {
      console.error('Failed to update community section:', error);
      window.alert('Failed to update section: ' + error.message);
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pt-20 sm:pt-24 bg-[#07080d] min-h-[calc(100vh-64px)] font-dmsans text-[#e8eaf2]">
      {!isAdmin ? (
        <div className="bg-[#12141e] border border-[#1e2130] rounded-2xl p-6 text-center max-w-md mx-auto shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
            <h1 className="text-lg sm:text-xl font-syne font-bold text-[#e8eaf2]">Not authorized</h1>
            <button className="px-3 py-1.5 rounded-lg bg-[#161921] border border-[#1e2130] text-[#6b7094] hover:text-[#e8eaf2] text-sm transition-colors" onClick={onBack}>Back</button>
          </div>
          <p className="text-[#6b7094] text-xs sm:text-sm">You do not have permission to access the admin panel.</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-0">
            <h1 className="text-2xl sm:text-3xl font-syne font-bold text-[#e8eaf2]">Admin Panel</h1>
            <div className="flex items-center gap-2">
              <button
                className="px-4 py-2 rounded-lg bg-[#161921] border border-[#1e2130] text-[#6b7094] hover:text-[#e8eaf2] text-sm sm:text-base font-medium transition-colors"
                onClick={onBack}
              >
                Back
              </button>
            </div>
          </div>

          {/* Cloudinary Config */}
          <form onSubmit={saveCloudinaryConfig} className="bg-yellow-500/5 border border-yellow-500/20 text-[#e8eaf2] rounded-2xl p-4 mb-6 shadow-sm">
            <div className="text-sm font-semibold text-yellow-400 mb-3">Cloudinary Configuration</div>
            <div className="grid md:grid-cols-3 gap-3 items-end">
              <div className="flex flex-col">
                <label className="text-xs text-[#6b7094] mb-1 font-semibold uppercase tracking-wider">Cloud Name</label>
                <input
                  className="bg-[#0f1118] border border-[#1e2130] text-[#e8eaf2] focus:border-yellow-500/50 outline-none rounded-lg px-3 py-2 text-sm"
                  value={cloudName}
                  onChange={(e) => setCloudName(e.target.value)}
                  placeholder="e.g. dgpocgkx3"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-[#6b7094] mb-1 font-semibold uppercase tracking-wider">Upload Preset (Unsigned)</label>
                <input
                  className="bg-[#0f1118] border border-[#1e2130] text-[#e8eaf2] focus:border-yellow-500/50 outline-none rounded-lg px-3 py-2 text-sm"
                  value={uploadPreset}
                  onChange={(e) => setUploadPreset(e.target.value)}
                  placeholder="your_unsigned_preset"
                />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full px-4 py-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-medium text-sm transition-colors">Save</button>
              </div>
            </div>
            <div className="text-xs text-[#6b7094] mt-3">
              Status: {cloudName && uploadPreset ? <span className="text-green-400 font-bold">Configured</span> : <span className="text-red-400 font-bold">Missing values</span>}
            </div>
          </form>

          {/* Tabs */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6 sm:mb-8 bg-[#12141e] border border-[#1e2130] p-1.5 rounded-xl w-fit">
            {[
              { key: "products", label: "Products" },
              { key: "orders", label: "Orders" },
              { key: "users", label: "Users" },
              { key: "flash", label: "Flash Sale" },
              { key: "feedback", label: "⭐ Feedback" },
              { key: "community", label: "👥 Community" },
              { key: "chat", label: "Live Chat" },
              { key: "email", label: "📧 Email Setup" },
              { key: "payhere", label: "💳 PayHere Config" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-semibold transition-all ${
                  tab === t.key ? "bg-[#6c63ff] text-white border-[#6c63ff] shadow-[0_0_12px_rgba(108,99,255,0.25)]" : "bg-[#12141e] text-[#6b7094] border-[#1e2130] hover:text-[#e8eaf2] hover:border-[#6b7094]/30"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {tab === "products" && (
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
            {/* Add product (admins only) */}
            {isAdmin ?
            <form
              onSubmit={addProduct}
              className="grid md:grid-cols-5 gap-3 items-end bg-[#12141e] border border-[#1e2130] p-4 rounded-xl shadow-sm"
            >
              
              <div className="flex flex-col">
                <label className="text-xs text-[#6b7094] mb-1 font-semibold uppercase tracking-wider">Title</label>
                <input
                  className="bg-[#0f1118] border border-[#1e2130] rounded-lg px-2.5 py-2 text-sm text-[#e8eaf2] focus:border-[#6c63ff] outline-none"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Product title"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-[#6b7094] mb-1 font-semibold uppercase tracking-wider">Price</label>
                <input
                  type="number"
                  className="bg-[#0f1118] border border-[#1e2130] rounded-lg px-2.5 py-2 text-sm text-[#e8eaf2] focus:border-[#6c63ff] outline-none"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-[#6b7094] mb-1 font-semibold uppercase tracking-wider">Stock</label>
                <input
                  type="number"
                  className="bg-[#0f1118] border border-[#1e2130] rounded-lg px-2.5 py-2 text-sm text-[#e8eaf2] focus:border-[#6c63ff] outline-none"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="0"
                  min="0"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-[#6b7094] mb-1 font-semibold uppercase tracking-wider">Category</label>
                <input
                  className="bg-[#0f1118] border border-[#1e2130] rounded-lg px-2.5 py-2 text-sm text-[#e8eaf2] focus:border-[#6c63ff] outline-none"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Category"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-[#6b7094] mb-1 font-semibold uppercase tracking-wider">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="bg-[#0f1118] border border-[#1e2130] rounded-lg px-2.5 py-1.5 text-xs text-[#e8eaf2] focus:border-[#6c63ff] outline-none"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    setImageFile(file || null);
                    if (imagePreview) {
                      storageService.revokePreviewUrl(imagePreview);
                    }
                    if (file) {
                      const previewUrl = storageService.createPreviewUrl(file);
                      setImagePreview(previewUrl);
                    } else {
                      setImagePreview("");
                    }
                  }}
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full px-3 py-2 rounded-lg text-white font-semibold text-sm transition-all ${
                  isSubmitting ? "bg-gray-700 cursor-not-allowed opacity-60" : "bg-[#6c63ff] hover:opacity-90 shadow-[0_0_12px_rgba(108,99,255,0.25)]"
                }`}
              >
                {isSubmitting ? "Adding..." : "Add"}
              </button>
            </form>:""}

            {imagePreview && (
              <div className="mt-2">
                <div className="text-xs text-[#6b7094] mb-1">Preview</div>
                <img src={imagePreview} alt="preview" className="h-24 w-24 object-cover rounded border border-[#1e2130]" />
              </div>
            )}

            {/* Filters */}
            <div className="flex items-center justify-between">
              <input
                className="bg-[#12141e] border border-[#1e2130] rounded-lg px-3 py-2 w-64 text-[#e8eaf2] focus:border-[#6c63ff] outline-none text-sm"
                placeholder="Search products..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              <div className="text-sm text-[#6b7094] font-medium">{filteredProducts.length} items</div>
            </div>

            {/* Product list */}
            <div className="overflow-x-auto border border-[#1e2130] rounded-xl bg-[#12141e]">
              <table className="min-w-full text-sm text-[#e8eaf2]">
                <thead className="bg-[#0f1118] text-[#6b7094] border-b border-[#1e2130] text-xs uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="text-left px-4 py-3">Title</th>
                    <th className="text-left px-4 py-3">Category</th>
                    <th className="text-left px-4 py-3">Price</th>
                    <th className="text-left px-4 py-3">Stock</th>
                    <th className="text-right px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="border-t border-[#1e2130] hover:bg-[#161921] transition-colors">
                      <td className="px-4 py-3 font-medium">{p.title}</td>
                      <td className="px-4 py-3 text-[#6b7094]">{p.category}</td>
                      <td className="px-4 py-3 text-[#43e97b]">${p.price}</td>
                      <td className="px-4 py-3">{p.stock}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          className="px-3 py-1.5 rounded-lg bg-[#ff6584]/10 text-[#ff6584] hover:bg-[#ff6584]/20 border border-[#ff6584]/30 font-semibold text-xs transition-colors"
                          onClick={() => deleteProduct(p.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {tab === "flash" && (
          <motion.div
            key="flash"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Flash Sale Control Panel */}
            <div className="bg-[#12141e] border border-[#1e2130] rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-syne font-bold text-white mb-4">⚡ Flash Sale Control Panel</h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                {/* Quick Start Flash Sale */}
                <div className="bg-[#0f1118] border border-[#1e2130] p-4 rounded-xl">
                  <h4 className="font-syne font-semibold text-[#e8eaf2] mb-3 text-sm uppercase tracking-wider">🚀 Quick Start</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        const now = new Date();
                        const end = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
                        setFlashForm({
                          ...flashForm,
                          startsAt: now.toISOString().slice(0, 16),
                          endsAt: end.toISOString().slice(0, 16)
                        });
                      }}
                      className="w-full px-3 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 text-xs font-semibold transition-colors"
                    >
                      Start 1 Hour Sale
                    </button>
                    <button
                      onClick={() => {
                        const now = new Date();
                        const end = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
                        setFlashForm({
                          ...flashForm,
                          startsAt: now.toISOString().slice(0, 16),
                          endsAt: end.toISOString().slice(0, 16)
                        });
                      }}
                      className="w-full px-3 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 text-xs font-semibold transition-colors"
                    >
                      Start 24 Hour Sale
                    </button>
                  </div>
                </div>

                {/* Schedule Flash Sale */}
                <div className="bg-[#0f1118] border border-[#1e2130] p-4 rounded-xl">
                  <h4 className="font-syne font-semibold text-[#e8eaf2] mb-3 text-sm uppercase tracking-wider">📅 Schedule Sale</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        tomorrow.setHours(9, 0, 0, 0); // 9 AM tomorrow
                        const end = new Date(tomorrow.getTime() + 12 * 60 * 60 * 1000); // 12 hours
                        setFlashForm({
                          ...flashForm,
                          startsAt: tomorrow.toISOString().slice(0, 16),
                          endsAt: end.toISOString().slice(0, 16)
                        });
                      }}
                      className="w-full px-3 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 text-xs font-semibold transition-colors"
                    >
                      Tomorrow 9 AM
                    </button>
                    <button
                      onClick={() => {
                        const weekend = new Date();
                        weekend.setDate(weekend.getDate() + (6 - weekend.getDay())); // Next Saturday
                        weekend.setHours(10, 0, 0, 0);
                        const end = new Date(weekend.getTime() + 48 * 60 * 60 * 1000); // Weekend sale
                        setFlashForm({
                          ...flashForm,
                          startsAt: weekend.toISOString().slice(0, 16),
                          endsAt: end.toISOString().slice(0, 16)
                        });
                      }}
                      className="w-full px-3 py-2 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-lg hover:bg-orange-500/20 text-xs font-semibold transition-colors"
                    >
                      Weekend Sale
                    </button>
                  </div>
                </div>

                {/* Emergency Controls */}
                <div className="bg-[#0f1118] border border-[#1e2130] p-4 rounded-xl">
                  <h4 className="font-syne font-semibold text-[#e8eaf2] mb-3 text-sm uppercase tracking-wider">🚨 Emergency Controls</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        if (window.confirm('Stop all active flash sales immediately?')) {
                          // Set all flash sales to end now
                          const now = new Date().toISOString().slice(0, 16);
                          setFlashForm({
                            ...flashForm,
                            endsAt: now
                          });
                          window.alert('All flash sales will be stopped when you add/update items');
                        }
                      }}
                      className="w-full px-3 py-2 bg-[#ff6584]/15 text-[#ff6584] border border-[#ff6584]/35 rounded-lg hover:bg-[#ff6584]/25 text-xs font-bold transition-colors"
                    >
                      🛑 Stop All Sales
                    </button>
                    <button
                      onClick={() => {
                        setFlashForm({
                          ...flashForm,
                          startsAt: "",
                          endsAt: "",
                          discount: ""
                        });
                      }}
                      className="w-full px-3 py-2 bg-[#161921] border border-[#1e2130] text-[#6b7094] hover:text-[#e8eaf2] rounded-lg text-xs font-semibold transition-colors"
                    >
                      Clear Timing
                    </button>
                  </div>
                </div>
              </div>

              {/* Current Flash Sale Status */}
              {(flashForm.startsAt || flashForm.endsAt) && (
                <div className="mt-4 p-4 bg-[#6c63ff]/5 border border-[#6c63ff]/20 rounded-xl">
                  <h4 className="font-semibold text-white mb-2 text-sm">📊 Current Flash Sale Settings</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    {flashForm.startsAt && (
                      <div>
                        <span className="text-[#6b7094] font-medium mr-1.5">Start:</span> <span className="text-[#e8eaf2]">{new Date(flashForm.startsAt).toLocaleString()}</span>
                      </div>
                    )}
                    {flashForm.endsAt && (
                      <div>
                        <span className="text-[#6b7094] font-medium mr-1.5">End:</span> <span className="text-[#e8eaf2]">{new Date(flashForm.endsAt).toLocaleString()}</span>
                      </div>
                    )}
                    {flashForm.discount && (
                      <div>
                        <span className="text-[#6b7094] font-medium mr-1.5">Discount:</span> <span className="text-[#e8eaf2]">{flashForm.discount}%</span>
                      </div>
                    )}
                    {flashForm.startsAt && flashForm.endsAt && (
                      <div>
                        <span className="text-[#6b7094] font-medium mr-1.5">Duration:</span> <span className="text-[#e8eaf2]">{
                          Math.round((new Date(flashForm.endsAt) - new Date(flashForm.startsAt)) / (1000 * 60 * 60))
                        } hours</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Add flash product */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const title = flashForm.title.trim();
                const price = Number(flashForm.price);
                const stock = Number(flashForm.stock);
                const category = flashForm.category.trim() || 'General';
                const discount = flashForm.discount ? Number(flashForm.discount) : null;
                const startsAt = flashForm.startsAt || null;
                const endsAt = flashForm.endsAt || null;
                if (!title || isNaN(price) || isNaN(stock)) return;
                setIsFlashSubmitting(true);
                const pid = `${title}-${Date.now()}`;
                try {
                  let imageUrl = null;
                  if (flashImageFile) {
                    const validation = storageService.validateImageFile(flashImageFile);
                    if (!validation.isValid) { alert(validation.error); setIsFlashSubmitting(false); return; }
                    imageUrl = await storageService.uploadFlashImage(flashImageFile, pid);
                  }
                  
                  // Use FlashProductsContext to add the product (like regular products)
                  await ctxAddFlashProduct({ 
                    id: pid, 
                    title, 
                    price, 
                    stock, 
                    category, 
                    image: imageUrl, 
                    discount, 
                    startsAt, 
                    endsAt 
                  });
                  // Ensure latest list across app
                  await refreshFlashProducts();
                  
                  setFlashForm({ title: "", price: "", stock: "", category: "", discount: "", startsAt: "", endsAt: "" });
                  setFlashImageFile(null);
                  if (flashImagePreview) storageService.revokePreviewUrl(flashImagePreview);
                  setFlashImagePreview("");
                  
                  console.log('Flash product added successfully, flash products refreshed');
                } catch (err) {
                  console.error('Failed to add flash product:', err);
                  alert(`Failed to add flash product: ${err.message}`);
                } finally {
                  setIsFlashSubmitting(false);
                }
              }}
              className="grid md:grid-cols-6 gap-3 items-end bg-[#12141e] border border-[#1e2130] p-4 rounded-xl shadow-sm"
            >
              <div className="flex flex-col">
                <label className="text-xs text-[#6b7094] mb-1 font-semibold uppercase tracking-wider">Title</label>
                <input className="bg-[#0f1118] border border-[#1e2130] rounded-lg px-2.5 py-2 text-sm text-[#e8eaf2] focus:border-[#6c63ff] outline-none" value={flashForm.title} onChange={(e)=>setFlashForm({...flashForm, title:e.target.value})} required disabled={isFlashSubmitting} />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-[#6b7094] mb-1 font-semibold uppercase tracking-wider">Price</label>
                <input type="number" className="bg-[#0f1118] border border-[#1e2130] rounded-lg px-2.5 py-2 text-sm text-[#e8eaf2] focus:border-[#6c63ff] outline-none" value={flashForm.price} onChange={(e)=>setFlashForm({...flashForm, price:e.target.value})} min="0" step="0.01" required disabled={isFlashSubmitting} />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-[#6b7094] mb-1 font-semibold uppercase tracking-wider">Stock</label>
                <input type="number" className="bg-[#0f1118] border border-[#1e2130] rounded-lg px-2.5 py-2 text-sm text-[#e8eaf2] focus:border-[#6c63ff] outline-none" value={flashForm.stock} onChange={(e)=>setFlashForm({...flashForm, stock:e.target.value})} min="0" required disabled={isFlashSubmitting} />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-[#6b7094] mb-1 font-semibold uppercase tracking-wider">Discount (%)</label>
                <input type="number" className="bg-[#0f1118] border border-[#1e2130] rounded-lg px-2.5 py-2 text-sm text-[#e8eaf2] focus:border-[#6c63ff] outline-none" value={flashForm.discount} onChange={(e)=>setFlashForm({...flashForm, discount:e.target.value})} min="0" max="100" disabled={isFlashSubmitting} />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-[#6b7094] mb-1 font-semibold uppercase tracking-wider">Starts At</label>
                <input type="datetime-local" className="bg-[#0f1118] border border-[#1e2130] rounded-lg px-2.5 py-2 text-sm text-[#e8eaf2] focus:border-[#6c63ff] outline-none" value={flashForm.startsAt} onChange={(e)=>setFlashForm({...flashForm, startsAt:e.target.value})} disabled={isFlashSubmitting} />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-[#6b7094] mb-1 font-semibold uppercase tracking-wider">Ends At</label>
                <input type="datetime-local" className="bg-[#0f1118] border border-[#1e2130] rounded-lg px-2.5 py-2 text-sm text-[#e8eaf2] focus:border-[#6c63ff] outline-none" value={flashForm.endsAt} onChange={(e)=>setFlashForm({...flashForm, endsAt:e.target.value})} disabled={isFlashSubmitting} />
              </div>
              <div className="flex flex-col md:col-span-2">
                <label className="text-xs text-[#6b7094] mb-1 font-semibold uppercase tracking-wider">Category</label>
                <input className="bg-[#0f1118] border border-[#1e2130] rounded-lg px-2.5 py-2 text-sm text-[#e8eaf2] focus:border-[#6c63ff] outline-none" value={flashForm.category} onChange={(e)=>setFlashForm({...flashForm, category:e.target.value})} disabled={isFlashSubmitting} />
              </div>
              <div className="flex flex-col md:col-span-2">
                <label className="text-xs text-[#6b7094] mb-1 font-semibold uppercase tracking-wider">Image</label>
                <input type="file" accept="image/*" className="bg-[#0f1118] border border-[#1e2130] rounded-lg px-2.5 py-1.5 text-xs text-[#e8eaf2] focus:border-[#6c63ff] outline-none" disabled={isFlashSubmitting}
                  onChange={(e)=>{
                    const file = e.target.files && e.target.files[0];
                    setFlashImageFile(file||null);
                    if (flashImagePreview) storageService.revokePreviewUrl(flashImagePreview);
                    if (file) setFlashImagePreview(storageService.createPreviewUrl(file)); else setFlashImagePreview("");
                  }}
                />
              </div>
              <button type="submit" disabled={isFlashSubmitting} className={`w-full px-3 py-2 rounded-lg text-white font-semibold text-sm transition-all ${isFlashSubmitting? 'bg-gray-700 cursor-not-allowed opacity-60':'bg-[#6c63ff] hover:opacity-90 shadow-[0_0_12px_rgba(108,99,255,0.25)]'}`}>{isFlashSubmitting? 'Adding...':'Add Flash Item'}</button>
            </form>

            {flashImagePreview && (
              <div className="mt-2">
                <div className="text-xs text-[#6b7094] mb-1">Preview</div>
                <img src={flashImagePreview} alt="preview" className="h-24 w-24 object-cover rounded border border-[#1e2130]" />
              </div>
            )}

            {/* Flash list */}
            <div className="overflow-x-auto border border-[#1e2130] rounded-xl bg-[#12141e]">
              <table className="min-w-full text-sm text-[#e8eaf2]">
                <thead className="bg-[#0f1118] text-[#6b7094] border-b border-[#1e2130] text-xs uppercase tracking-wider font-semibold font-syne">
                  <tr>
                    <th className="text-left px-4 py-3">Title</th>
                    <th className="text-left px-4 py-3">Category</th>
                    <th className="text-left px-4 py-3">Price</th>
                    <th className="text-left px-4 py-3">Stock</th>
                    <th className="text-left px-4 py-3">Discount</th>
                    <th className="text-left px-4 py-3">Window</th>
                    <th className="text-right px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {flashProducts.map((p) => (
                    <tr key={p.id} className="border-t border-[#1e2130] hover:bg-[#161921] transition-colors">
                      <td className="px-4 py-3 font-medium">{p.title}</td>
                      <td className="px-4 py-3 text-[#6b7094]">{p.category}</td>
                      <td className="px-4 py-3 text-[#43e97b]">${p.price}</td>
                      <td className="px-4 py-3">{p.stock}</td>
                      <td className="px-4 py-3 font-semibold text-orange-400">{p.discount ?? '-'}%</td>
                      <td className="px-4 py-3 text-xs text-[#6b7094]">{p.startsAt || '-'} → {p.endsAt || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <button className="px-3 py-1.5 rounded-lg bg-[#ff6584]/10 text-[#ff6584] hover:bg-[#ff6584]/20 border border-[#ff6584]/30 font-semibold text-xs transition-colors"
                          onClick={async ()=>{
                            try{
                              await ctxRemoveFlashProduct(p.id);
                              await refreshFlashProducts();
                              console.log('Flash product deleted successfully');
                            }catch(err){
                              console.error('Failed to delete flash product', err);
                              alert(`Failed to delete: ${err.message}`);
                            }
                          }}
                        >Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {tab === "orders" && (
          <motion.div
            key="orders"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No orders found
              </div>
            ) : (
              <div className="overflow-x-auto border rounded">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-2 sm:px-3 py-2">Order ID</th>
                      <th className="text-left px-2 sm:px-3 py-2">Customer</th>
                      <th className="text-left px-2 sm:px-3 py-2">Items</th>
                      <th className="text-left px-2 sm:px-3 py-2">Total</th>
                      <th className="text-left px-2 sm:px-3 py-2">Status</th>
                      <th className="text-left px-2 sm:px-3 py-2">Date</th>
                      <th className="text-right px-2 sm:px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.orderId} className="border-t hover:bg-gray-50">
                        <td className="px-2 sm:px-3 py-2">
                          <span className="font-mono text-xs">{order.orderId}</span>
                        </td>
                        <td className="px-2 sm:px-3 py-2">
                          <div>
                            <div className="font-medium">{order.customerName}</div>
                            <div className="text-xs text-gray-500">{order.customerEmail}</div>
                            {order.userId && (
                              <div className="text-xs text-blue-600 font-mono">
                                ID: {order.userId.slice(0, 8)}...
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-2 sm:px-3 py-2">
                          <div className="text-xs">
                            {order.items.length} item{order.items.length > 1 ? 's' : ''}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[120px]">
                            {order.items.slice(0, 2).map(item => item.title).join(', ')}
                            {order.items.length > 2 && ` +${order.items.length - 2} more`}
                          </div>
                        </td>
                        <td className="px-2 sm:px-3 py-2">
                          <span className="font-semibold text-xs sm:text-sm">${order.totalAmount.toFixed(2)}</span>
                        </td>
                        <td className="px-2 sm:px-3 py-2">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                            className={`px-1 sm:px-2 py-1 rounded text-xs border ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                              order.status === 'shipped' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                              order.status === 'delivered' ? 'bg-green-100 text-green-800 border-green-300' :
                              'bg-red-100 text-red-800 border-red-300'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-xs">
                            {new Date(order.orderDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(order.orderDate).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-2 sm:px-3 py-2 text-right">
                          <div className="flex flex-col sm:flex-row gap-1">
                            <button
                              onClick={() => {
                                const details = `Order: ${order.orderId}\nCustomer: ${order.customerName}\nItems: ${order.items.map(i => `${i.title} x${i.quantity}`).join(', ')}\nTotal: $${order.totalAmount.toFixed(2)}\nStatus: ${order.status}\nShipping: ${order.shippingAddress.street}, ${order.shippingAddress.city}`;
                                window.alert(details);
                              }}
                              className="px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 text-xs whitespace-nowrap"
                            >
                              View
                            </button>
                            {order.status !== 'cancelled' && order.status !== 'delivered' && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to cancel order ${order.orderId}?\n\nThis will send a cancellation email to ${order.customerEmail}`)) {
                                    updateOrderStatus(order.orderId, 'cancelled');
                                  }
                                }}
                                className="px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-xs whitespace-nowrap"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {tab === "users" && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="overflow-x-auto border rounded">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2">Username</th>
                    <th className="text-left px-3 py-2">Email</th>
                    <th className="text-left px-3 py-2">User ID</th>
                    <th className="text-left px-3 py-2">Role</th>
                    <th className="text-right px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.userId || u._id} className="border-t">
                      <td className="px-3 py-2">{u.username}</td>
                      <td className="px-3 py-2">{u.email}</td>
                      <td className="px-3 py-2">
                        <span className="font-mono text-xs text-blue-600">
                          {u.userId || "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          u.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          className="px-2 py-1 rounded bg-gray-900 text-white hover:bg-black"
                          onClick={() => toggleUserRole(u.userId)}
                        >
                          Toggle Role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {tab === "feedback" && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Header with filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">⭐ Customer Feedback Management</h3>
                <p className="text-sm text-gray-600 mt-1">Manage testimonials displayed on the home page</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Filter:</label>
                <select
                  value={feedbackFilter}
                  onChange={(e) => setFeedbackFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="all">All ({feedbacks.length})</option>
                  <option value="published">Published ({feedbacks.filter(f => f.status === 'published').length})</option>
                  <option value="pending">Pending ({feedbacks.filter(f => f.status === 'pending').length})</option>
                  <option value="reviewed">Reviewed ({feedbacks.filter(f => f.status === 'reviewed').length})</option>
                </select>
              </div>
            </div>

             {/* Feedback Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-[#12141e] border border-[#1e2130] rounded-xl p-4">
                <div className="text-2xl font-syne font-bold text-[#e8eaf2]">{feedbacks.length}</div>
                <div className="text-sm text-[#6b7094] font-medium">Total Feedback</div>
              </div>
              <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                <div className="text-2xl font-syne font-bold text-green-400">
                  {feedbacks.filter(f => f.status === 'published').length}
                </div>
                <div className="text-sm text-green-400/80 font-medium">Published</div>
              </div>
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
                <div className="text-2xl font-syne font-bold text-yellow-400">
                  {feedbacks.filter(f => f.status === 'pending').length}
                </div>
                <div className="text-sm text-yellow-400/80 font-medium">Pending Review</div>
              </div>
              <div className="bg-[#6c63ff]/5 border border-[#6c63ff]/20 rounded-xl p-4">
                <div className="text-2xl font-syne font-bold text-[#6c63ff]">
                  {feedbacks.length > 0 ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) : '0.0'}
                </div>
                <div className="text-sm text-[#6c63ff]/80 font-medium">Avg Rating</div>
              </div>
            </div>

            {/* Feedback List */}
            {filteredFeedbacks.length === 0 ? (
              <div className="text-center py-12 bg-[#12141e] border border-[#1e2130] rounded-xl">
                <div className="text-4xl mb-3">📝</div>
                <div className="text-[#e8eaf2] font-semibold">No feedback found</div>
                <div className="text-sm text-[#6b7094] mt-1">
                  {feedbackFilter !== 'all' ? 'Try changing the filter' : 'Customer feedback will appear here'}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFeedbacks.map((feedback) => (
                  <div
                    key={feedback._id}
                    className="bg-[#12141e] border border-[#1e2130] rounded-xl p-4 hover:border-[#6c63ff] transition-all shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6c63ff] to-[#c850c0] flex items-center justify-center text-white text-2xl font-bold">
                          {feedback.name.charAt(0).toUpperCase()}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="font-semibold text-[#e8eaf2]">{feedback.name}</h4>
                            <p className="text-sm text-[#6b7094]">{feedback.email}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-lg ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-600'}`}>
                                ⭐
                              </span>
                            ))}
                            <span className="ml-2 text-xs font-semibold text-[#6b7094]">
                              {feedback.rating}/5
                            </span>
                          </div>
                        </div>

                        <p className="text-[#e8eaf2] mb-3 italic">"{feedback.feedback}"</p>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#6b7094]">
                          <span>📅 {new Date(feedback.submittedAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>🕐 {new Date(feedback.submittedAt).toLocaleTimeString()}</span>
                          <span>•</span>
                          <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                            feedback.status === 'published' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            feedback.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                            'bg-[#6c63ff]/10 text-[#6c63ff] border border-[#6c63ff]/20'
                          }`}>
                            {feedback.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex sm:flex-col gap-2 justify-center">
                        {feedback.status !== 'published' && (
                          <button
                            onClick={() => updateFeedbackStatus(feedback._id, 'published')}
                            className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 text-xs font-semibold whitespace-nowrap transition-colors"
                            title="Publish to home page"
                          >
                            ✓ Publish
                          </button>
                        )}
                        {feedback.status === 'published' && (
                          <button
                            onClick={() => updateFeedbackStatus(feedback._id, 'pending')}
                            className="px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/20 text-xs font-semibold whitespace-nowrap transition-colors"
                            title="Unpublish from home page"
                          >
                            ⏸ Unpublish
                          </button>
                        )}
                        <button
                          onClick={() => deleteFeedback(feedback._id)}
                          className="px-3 py-1.5 rounded-lg bg-[#ff6584]/10 text-[#ff6584] border border-[#ff6584]/30 hover:bg-[#ff6584]/20 text-xs font-semibold whitespace-nowrap transition-colors"
                          title="Delete feedback"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Help Text */}
            <div className="bg-[#6c63ff]/5 border border-[#6c63ff]/20 rounded-xl p-4">
              <h4 className="font-semibold text-white mb-2 text-sm">ℹ️ How it works</h4>
              <ul className="text-sm text-[#6b7094] space-y-1 font-medium">
                <li>• <strong>Published</strong> feedback appears in the "Voices of Satisfaction" section on the home page</li>
                <li>• <strong>Pending</strong> feedback is hidden from public view</li>
                <li>• Click "Publish" to make feedback visible to customers</li>
                <li>• Click "Unpublish" to hide feedback from the home page</li>
                <li>• Delete removes feedback permanently from the database</li>
              </ul>
            </div>
          </motion.div>
        )}

        {tab === "community" && (
          <motion.div
            key="community"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="bg-[#12141e] border border-[#1e2130] rounded-xl p-6 shadow-sm">
              <h3 className="text-2xl font-syne font-bold text-[#e8eaf2] mb-2">👥 Community Page Management</h3>
              <p className="text-sm text-[#6b7094] font-medium">Edit all sections of the Community page from here</p>
            </div>

            {/* Section Selector */}
            <div className="bg-[#12141e] border border-[#1e2130] rounded-xl p-4">
              <label className="block text-sm font-semibold text-[#e8eaf2] mb-3">Select Section to Edit:</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { key: 'stats', label: '📊 Stats', icon: '📊' },
                  { key: 'about', label: '📖 About Us', icon: '📖' },
                  { key: 'team', label: '👨‍💼 Team Members', icon: '👨‍💼' },
                  { key: 'testimonials', label: '💬 Testimonials', icon: '💬' },
                  { key: 'contact', label: '📞 Contact Info', icon: '📞' }
                ].map(section => (
                  <button
                    key={section.key}
                    onClick={() => {
                      setCommunitySection(section.key);
                      setEditingCommunity(communityContent[section.key]?.content || null);
                    }}
                    className={`px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                      communitySection === section.key
                        ? 'bg-[#6c63ff] text-white border-[#6c63ff] shadow-[0_0_12px_rgba(108,99,255,0.25)]'
                        : 'bg-[#161921] text-[#6b7094] border-[#1e2130] hover:border-[#6b7094] hover:text-[#e8eaf2]'
                    }`}
                  >
                    <div className="text-2xl mb-1">{section.icon}</div>
                    <div className="text-xs">{section.label.replace(/^[^\s]+ /, '')}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Editor */}
            <div className="bg-[#12141e] border border-[#1e2130] rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-syne font-bold text-[#e8eaf2]">
                  {communitySection === 'stats' && '📊 Statistics Section'}
                  {communitySection === 'about' && '📖 About Us Section'}
                  {communitySection === 'team' && '👨‍💼 Team Members Section'}
                  {communitySection === 'testimonials' && '💬 Testimonials Section'}
                  {communitySection === 'contact' && '📞 Contact Information'}
                </h4>
                {communityContent[communitySection] && (
                  <span className="text-xs text-[#6b7094]">
                    Last updated: {new Date(communityContent[communitySection].updatedAt).toLocaleString()}
                  </span>
                )}
              </div>

              {/* JSON Editor */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#6b7094] mb-2 uppercase tracking-wider text-xs">
                    Content (JSON Format)
                  </label>
                  <textarea
                    value={editingCommunity ? (typeof editingCommunity === 'string' ? editingCommunity : JSON.stringify(editingCommunity, null, 2)) : (communityContent[communitySection]?.content ? JSON.stringify(communityContent[communitySection].content, null, 2) : '{}')}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setEditingCommunity(parsed);
                      } catch (err) {
                        // Invalid JSON, just update the text
                        setEditingCommunity(e.target.value);
                      }
                    }}
                    rows={20}
                    className="w-full px-4 py-3 bg-[#0f1118] border border-[#1e2130] rounded-lg font-mono text-sm text-[#e8eaf2] focus:border-[#6c63ff] outline-none"
                    placeholder="Enter JSON content..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (typeof editingCommunity === 'string') {
                        try {
                          const parsed = JSON.parse(editingCommunity);
                          updateCommunitySection(communitySection, parsed);
                        } catch (err) {
                          window.alert('Invalid JSON format. Please check your syntax.');
                        }
                      } else {
                        updateCommunitySection(communitySection, editingCommunity);
                      }
                    }}
                    className="px-6 py-3 bg-[#6c63ff] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-[0_0_12px_rgba(108,99,255,0.25)]"
                  >
                    💾 Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditingCommunity(communityContent[communitySection]?.content || null);
                    }}
                    className="px-6 py-3 bg-[#161921] text-[#6b7094] border border-[#1e2130] rounded-lg font-semibold hover:text-[#e8eaf2] transition-colors"
                  >
                    ↺ Reset
                  </button>
                </div>
              </div>

              {/* Help Text */}
              <div className="mt-6 bg-[#6c63ff]/5 border border-[#6c63ff]/20 rounded-xl p-4">
                <h5 className="font-semibold text-white mb-2">💡 Section Guidelines:</h5>
                <div className="text-sm text-[#6b7094] space-y-2">
                  {communitySection === 'stats' && (
                    <div>
                      <p className="font-medium mb-1">Stats format (array of 4 items):</p>
                      <pre className="bg-[#0f1118] border border-[#1e2130] p-2.5 rounded-lg text-xs text-[#e8eaf2] overflow-x-auto">
{`[
  { "label": "Happy Customers", "value": "50K+" },
  { "label": "Years of Excellence", "value": "8+" },
  { "label": "Countries Served", "value": "25+" },
  { "label": "Products Sold", "value": "1M+" }
]`}
                      </pre>
                    </div>
                  )}
                  {communitySection === 'about' && (
                    <div>
                      <p className="font-medium mb-1">About section format:</p>
                      <pre className="bg-[#0f1118] border border-[#1e2130] p-2.5 rounded-lg text-xs text-[#e8eaf2] overflow-x-auto">
{`{
  "title": "Who We Are",
  "paragraphs": ["First paragraph...", "Second paragraph..."],
  "values": ["Customer-First", "Innovation-Driven", "Quality-Focused"],
  "image": "https://..."
}`}
                      </pre>
                    </div>
                  )}
                  {communitySection === 'team' && (
                    <div>
                      <p className="font-medium mb-1">Team members format (array):</p>
                      <pre className="bg-[#0f1118] border border-[#1e2130] p-2.5 rounded-lg text-xs text-[#e8eaf2] overflow-x-auto">
{`[
  {
    "id": 1,
    "name": "John Doe",
    "role": "CEO",
    "image": "https://...",
    "bio": "Description...",
    "expertise": ["Skill 1", "Skill 2"]
  }
]`}
                      </pre>
                    </div>
                  )}
                  {communitySection === 'testimonials' && (
                    <div>
                      <p className="font-medium mb-1">Testimonials format (array):</p>
                      <pre className="bg-[#0f1118] border border-[#1e2130] p-2.5 rounded-lg text-xs text-[#e8eaf2] overflow-x-auto">
{`[
  {
    "id": 1,
    "name": "Customer Name",
    "role": "Regular Customer",
    "image": "https://...",
    "text": "Testimonial text...",
    "rating": 5
  }
]`}
                      </pre>
                    </div>
                  )}
                  {communitySection === 'contact' && (
                    <div>
                      <p className="font-medium mb-1">Contact info format:</p>
                      <pre className="bg-[#0f1118] border border-[#1e2130] p-2.5 rounded-lg text-xs text-[#e8eaf2] overflow-x-auto">
{`{
  "address": "123 Main St, City, Country",
  "phone": "+1234567890",
  "email": "contact@example.com",
  "officeImage": "https://..."
}`}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {tab === "chat" && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="grid md:grid-cols-3 gap-4 h-[480px]">
              {/* Chat Sessions List */}
              <div className="border border-[#1e2130] rounded-xl overflow-hidden bg-[#12141e] flex flex-col">
                <div className="bg-[#0f1118] px-4 py-3 border-b border-[#1e2130]">
                  <h3 className="font-syne font-semibold text-sm text-[#e8eaf2]">Active Chats ({chatSessions.length})</h3>
                </div>
                <div className="overflow-y-auto flex-1 divide-y divide-[#1e2130]">
                  {chatSessions.length === 0 ? (
                    <div className="p-8 text-center text-[#6b7094] text-sm font-medium">
                      No active chats
                    </div>
                  ) : (
                    chatSessions.map((session) => (
                      <div
                        key={session._id}
                        onClick={() => setSelectedSession(session._id)}
                        className={`p-4 cursor-pointer transition-colors ${
                          selectedSession === session._id ? 'bg-[#6c63ff]/10 text-white' : 'hover:bg-[#161921] text-[#e8eaf2]'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-semibold text-sm">
                                {session.senderName || 'Anonymous'}
                              </div>
                              {session.userId && (
                                <span className="bg-green-500/10 text-green-400 text-[10px] px-2 py-0.5 rounded font-semibold border border-green-500/20">
                                  Registered
                                </span>
                              )}
                            </div>
                            {session.userId && (
                              <div className="text-[10px] text-[#6b7094] font-mono mb-1">
                                ID: {session.userId.slice(0, 8)}...
                              </div>
                            )}
                            <div className="text-xs text-[#6b7094] truncate">
                              {session.lastMessage}
                            </div>
                            <div className="text-[10px] text-[#6b7094]/80 mt-1">
                              {new Date(session.lastTimestamp).toLocaleString()}
                            </div>
                          </div>
                          {session.unreadCount > 0 && (
                            <span className="bg-[#ff6584] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-2">
                              {session.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="md:col-span-2 border border-[#1e2130] rounded-xl overflow-hidden bg-[#12141e] flex flex-col">
                {selectedSession ? (
                  <>
                    <div className="bg-[#0f1118] px-4 py-3 border-b border-[#1e2130]">
                      <h3 className="font-syne font-semibold text-sm text-[#e8eaf2]">Chat Session: {selectedSession.slice(-8)}</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0c0d14] min-h-[250px]">
                      {chatMessages.length === 0 ? (
                        <div className="text-center text-[#6b7094] text-sm my-auto">
                          No messages yet
                        </div>
                      ) : (
                        chatMessages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] px-3.5 py-2.5 rounded-lg text-sm ${
                              msg.sender === 'admin' 
                                ? 'bg-[#6c63ff] text-white rounded-br-none' 
                                : 'bg-[#161921] text-[#e8eaf2] border border-[#1e2130] rounded-bl-none'
                            }`}>
                              <div className="text-[10px] opacity-80 mb-0.5 font-semibold">{msg.senderName}</div>
                              <div>{msg.message}</div>
                              <div className="text-[10px] opacity-60 mt-1 text-right">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="border-t border-[#1e2130] p-4 bg-[#12141e]">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Type your response..."
                          value={adminMessage}
                          onChange={(e) => setAdminMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") sendAdminMessage();
                          }}
                          className="flex-1 bg-[#0f1118] border border-[#1e2130] rounded-lg px-4 py-2.5 text-sm text-[#e8eaf2] focus:border-[#6c63ff] outline-none"
                        />
                        <button
                          onClick={sendAdminMessage}
                          disabled={!adminMessage.trim()}
                          className="px-5 py-2.5 rounded-lg bg-[#6c63ff] text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 shadow-[0_0_12px_rgba(108,99,255,0.25)]"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-[#6b7094] font-medium bg-[#12141e] p-8">
                    Select a chat session to view messages
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {tab === "email" && (
          <motion.div
            key="email"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <EmailTest onBack={() => setTab("products")} />
          </motion.div>
        )}

        {tab === "payhere" && (
          <motion.div
            key="payhere"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <PayHereConfig onBack={() => setTab("products")} />
          </motion.div>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
}
