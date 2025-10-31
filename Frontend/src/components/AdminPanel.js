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
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      {!isAdmin ? (
        <div className="bg-white border rounded p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
            <h1 className="text-lg sm:text-xl font-semibold">Not authorized</h1>
            <button className="px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300 text-sm sm:text-base" onClick={onBack}>Back</button>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm">You do not have permission to access the admin panel.</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
            <h1 className="text-xl sm:text-2xl font-bold">Admin Panel</h1>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300 text-sm sm:text-base"
                onClick={onBack}
              >
                Back
              </button>
            </div>
          </div>

          {/* Cloudinary Config */}
          <form onSubmit={saveCloudinaryConfig} className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
            <div className="text-sm font-medium mb-2">Cloudinary Configuration</div>
            <div className="grid md:grid-cols-3 gap-2 items-end">
              <div className="flex flex-col">
                <label className="text-xs text-gray-600">Cloud Name</label>
                <input
                  className="border rounded px-2 py-1"
                  value={cloudName}
                  onChange={(e) => setCloudName(e.target.value)}
                  placeholder="e.g. dgpocgkx3"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-600">Upload Preset (Unsigned)</label>
                <input
                  className="border rounded px-2 py-1"
                  value={uploadPreset}
                  onChange={(e) => setUploadPreset(e.target.value)}
                  placeholder="your_unsigned_preset"
                />
              </div>
              <div className="flex items-end">
                <button type="submit" className="px-3 py-2 rounded bg-black text-white">Save</button>
              </div>
            </div>
            <div className="text-xs text-gray-600 mt-2">
              Status: {cloudName && uploadPreset ? <span className="text-green-700">Configured</span> : <span className="text-red-700">Missing values</span>}
            </div>
          </form>

          {/* Tabs */}
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
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
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded border text-xs sm:text-sm ${
                  tab === t.key ? "bg-black text-white border-black" : "bg-white text-black border-gray-300"
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
              className="grid md:grid-cols-5 gap-2 items-end bg-white p-3 rounded border"
            >
              
              <div className="flex flex-col">
                <label className="text-xs text-gray-500">Title</label>
                <input
                  className="border rounded px-2 py-1"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Product title"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-500">Price</label>
                <input
                  type="number"
                  className="border rounded px-2 py-1"
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
                <label className="text-xs text-gray-500">Stock</label>
                <input
                  type="number"
                  className="border rounded px-2 py-1"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="0"
                  min="0"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-500">Category</label>
                <input
                  className="border rounded px-2 py-1"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Category"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-500">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="border rounded px-2 py-1"
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
                className={`px-3 py-2 rounded text-white ${
                  isSubmitting ? "bg-gray-500 cursor-not-allowed" : "bg-black hover:bg-gray-800"
                }`}
              >
                {isSubmitting ? "Adding..." : "Add"}
              </button>
            </form>:""}

            {imagePreview && (
              <div className="mt-2">
                <div className="text-xs text-gray-500 mb-1">Preview</div>
                <img src={imagePreview} alt="preview" className="h-24 w-24 object-cover rounded border" />
              </div>
            )}

            {/* Filters */}
            <div className="flex items-center justify-between">
              <input
                className="border rounded px-3 py-2 w-64"
                placeholder="Search products..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              <div className="text-sm text-gray-500">{filteredProducts.length} items</div>
            </div>

            {/* Product list */}
            <div className="overflow-x-auto border rounded">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2">Title</th>
                    <th className="text-left px-3 py-2">Category</th>
                    <th className="text-left px-3 py-2">Price</th>
                    <th className="text-left px-3 py-2">Stock</th>
                    <th className="text-right px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="px-3 py-2">{p.title}</td>
                      <td className="px-3 py-2">{p.category}</td>
                      <td className="px-3 py-2">${p.price}</td>
                      <td className="px-3 py-2">{p.stock}</td>
                      <td className="px-3 py-2 text-right">
                        <button
                          className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
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
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-800 mb-4">⚡ Flash Sale Control Panel</h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                {/* Quick Start Flash Sale */}
                <div className="bg-white p-3 rounded border">
                  <h4 className="font-medium mb-2">🚀 Quick Start</h4>
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
                      className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
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
                      className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Start 24 Hour Sale
                    </button>
                  </div>
                </div>

                {/* Schedule Flash Sale */}
                <div className="bg-white p-3 rounded border">
                  <h4 className="font-medium mb-2">📅 Schedule Sale</h4>
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
                      className="w-full px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
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
                      className="w-full px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
                    >
                      Weekend Sale
                    </button>
                  </div>
                </div>

                {/* Emergency Controls */}
                <div className="bg-white p-3 rounded border">
                  <h4 className="font-medium mb-2">🚨 Emergency Controls</h4>
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
                      className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
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
                      className="w-full px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                    >
                      Clear Timing
                    </button>
                  </div>
                </div>
              </div>

              {/* Current Flash Sale Status */}
              {(flashForm.startsAt || flashForm.endsAt) && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <h4 className="font-medium text-blue-800 mb-2">📊 Current Flash Sale Settings</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    {flashForm.startsAt && (
                      <div>
                        <span className="font-medium">Start:</span> {new Date(flashForm.startsAt).toLocaleString()}
                      </div>
                    )}
                    {flashForm.endsAt && (
                      <div>
                        <span className="font-medium">End:</span> {new Date(flashForm.endsAt).toLocaleString()}
                      </div>
                    )}
                    {flashForm.discount && (
                      <div>
                        <span className="font-medium">Discount:</span> {flashForm.discount}%
                      </div>
                    )}
                    {flashForm.startsAt && flashForm.endsAt && (
                      <div>
                        <span className="font-medium">Duration:</span> {
                          Math.round((new Date(flashForm.endsAt) - new Date(flashForm.startsAt)) / (1000 * 60 * 60))
                        } hours
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
              className="grid md:grid-cols-6 gap-2 items-end bg-white p-3 rounded border"
            >
              <div className="flex flex-col">
                <label className="text-xs text-gray-500">Title</label>
                <input className="border rounded px-2 py-1" value={flashForm.title} onChange={(e)=>setFlashForm({...flashForm, title:e.target.value})} required disabled={isFlashSubmitting} />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-500">Price</label>
                <input type="number" className="border rounded px-2 py-1" value={flashForm.price} onChange={(e)=>setFlashForm({...flashForm, price:e.target.value})} min="0" step="0.01" required disabled={isFlashSubmitting} />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-500">Stock</label>
                <input type="number" className="border rounded px-2 py-1" value={flashForm.stock} onChange={(e)=>setFlashForm({...flashForm, stock:e.target.value})} min="0" required disabled={isFlashSubmitting} />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-500">Discount (%)</label>
                <input type="number" className="border rounded px-2 py-1" value={flashForm.discount} onChange={(e)=>setFlashForm({...flashForm, discount:e.target.value})} min="0" max="100" disabled={isFlashSubmitting} />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-500">Starts At</label>
                <input type="datetime-local" className="border rounded px-2 py-1" value={flashForm.startsAt} onChange={(e)=>setFlashForm({...flashForm, startsAt:e.target.value})} disabled={isFlashSubmitting} />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-500">Ends At</label>
                <input type="datetime-local" className="border rounded px-2 py-1" value={flashForm.endsAt} onChange={(e)=>setFlashForm({...flashForm, endsAt:e.target.value})} disabled={isFlashSubmitting} />
              </div>
              <div className="flex flex-col md:col-span-2">
                <label className="text-xs text-gray-500">Category</label>
                <input className="border rounded px-2 py-1" value={flashForm.category} onChange={(e)=>setFlashForm({...flashForm, category:e.target.value})} disabled={isFlashSubmitting} />
              </div>
              <div className="flex flex-col md:col-span-2">
                <label className="text-xs text-gray-500">Image</label>
                <input type="file" accept="image/*" className="border rounded px-2 py-1" disabled={isFlashSubmitting}
                  onChange={(e)=>{
                    const file = e.target.files && e.target.files[0];
                    setFlashImageFile(file||null);
                    if (flashImagePreview) storageService.revokePreviewUrl(flashImagePreview);
                    if (file) setFlashImagePreview(storageService.createPreviewUrl(file)); else setFlashImagePreview("");
                  }}
                />
              </div>
              <button type="submit" disabled={isFlashSubmitting} className={`px-3 py-2 rounded text-white ${isFlashSubmitting? 'bg-gray-500 cursor-not-allowed':'bg-black hover:bg-gray-800'}`}>{isFlashSubmitting? 'Adding...':'Add Flash Item'}</button>
            </form>

            {flashImagePreview && (
              <div className="mt-2">
                <div className="text-xs text-gray-500 mb-1">Preview</div>
                <img src={flashImagePreview} alt="preview" className="h-24 w-24 object-cover rounded border" />
              </div>
            )}

            {/* Flash list */}
            <div className="overflow-x-auto border rounded">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2">Title</th>
                    <th className="text-left px-3 py-2">Category</th>
                    <th className="text-left px-3 py-2">Price</th>
                    <th className="text-left px-3 py-2">Stock</th>
                    <th className="text-left px-3 py-2">Discount</th>
                    <th className="text-left px-3 py-2">Window</th>
                    <th className="text-right px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {flashProducts.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="px-3 py-2">{p.title}</td>
                      <td className="px-3 py-2">{p.category}</td>
                      <td className="px-3 py-2">${p.price}</td>
                      <td className="px-3 py-2">{p.stock}</td>
                      <td className="px-3 py-2">{p.discount ?? '-'}%</td>
                      <td className="px-3 py-2">{p.startsAt || '-'} → {p.endsAt || '-'}</td>
                      <td className="px-3 py-2 text-right">
                        <button className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
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
              <div className="bg-white border rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">{feedbacks.length}</div>
                <div className="text-sm text-gray-600">Total Feedback</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-700">
                  {feedbacks.filter(f => f.status === 'published').length}
                </div>
                <div className="text-sm text-green-600">Published</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-700">
                  {feedbacks.filter(f => f.status === 'pending').length}
                </div>
                <div className="text-sm text-yellow-600">Pending Review</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-700">
                  {feedbacks.length > 0 ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) : '0.0'}
                </div>
                <div className="text-sm text-blue-600">Avg Rating</div>
              </div>
            </div>

            {/* Feedback List */}
            {filteredFeedbacks.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-4xl mb-3">📝</div>
                <div className="text-gray-600">No feedback found</div>
                <div className="text-sm text-gray-500 mt-1">
                  {feedbackFilter !== 'all' ? 'Try changing the filter' : 'Customer feedback will appear here'}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFeedbacks.map((feedback) => (
                  <div
                    key={feedback._id}
                    className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold">
                          {feedback.name.charAt(0).toUpperCase()}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{feedback.name}</h4>
                            <p className="text-sm text-gray-600">{feedback.email}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-lg ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                ⭐
                              </span>
                            ))}
                            <span className="ml-2 text-sm font-medium text-gray-700">
                              {feedback.rating}/5
                            </span>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-3 italic">"{feedback.feedback}"</p>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span>📅 {new Date(feedback.submittedAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>🕐 {new Date(feedback.submittedAt).toLocaleTimeString()}</span>
                          <span>•</span>
                          <span className={`px-2 py-1 rounded font-medium ${
                            feedback.status === 'published' ? 'bg-green-100 text-green-800' :
                            feedback.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {feedback.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex sm:flex-col gap-2">
                        {feedback.status !== 'published' && (
                          <button
                            onClick={() => updateFeedbackStatus(feedback._id, 'published')}
                            className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700 text-sm font-medium whitespace-nowrap"
                            title="Publish to home page"
                          >
                            ✓ Publish
                          </button>
                        )}
                        {feedback.status === 'published' && (
                          <button
                            onClick={() => updateFeedbackStatus(feedback._id, 'pending')}
                            className="px-3 py-2 rounded bg-yellow-600 text-white hover:bg-yellow-700 text-sm font-medium whitespace-nowrap"
                            title="Unpublish from home page"
                          >
                            ⏸ Unpublish
                          </button>
                        )}
                        <button
                          onClick={() => deleteFeedback(feedback._id)}
                          className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm font-medium whitespace-nowrap"
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">ℹ️ How it works</h4>
              <ul className="text-sm text-blue-800 space-y-1">
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
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">👥 Community Page Management</h3>
              <p className="text-gray-600">Edit all sections of the Community page from here</p>
            </div>

            {/* Section Selector */}
            <div className="bg-white border rounded-lg p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Select Section to Edit:</label>
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
                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                      communitySection === section.key
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <div className="text-2xl mb-1">{section.icon}</div>
                    <div className="text-xs">{section.label.replace(/^[^\s]+ /, '')}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Editor */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-semibold text-gray-900">
                  {communitySection === 'stats' && '📊 Statistics Section'}
                  {communitySection === 'about' && '📖 About Us Section'}
                  {communitySection === 'team' && '👨‍💼 Team Members Section'}
                  {communitySection === 'testimonials' && '💬 Testimonials Section'}
                  {communitySection === 'contact' && '📞 Contact Information'}
                </h4>
                {communityContent[communitySection] && (
                  <span className="text-sm text-gray-500">
                    Last updated: {new Date(communityContent[communitySection].updatedAt).toLocaleString()}
                  </span>
                )}
              </div>

              {/* JSON Editor */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content (JSON Format)
                  </label>
                  <textarea
                    value={editingCommunity ? JSON.stringify(editingCommunity, null, 2) : JSON.stringify(communityContent[communitySection]?.content || {}, null, 2)}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
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
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    💾 Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditingCommunity(communityContent[communitySection]?.content || null);
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    ↺ Reset
                  </button>
                </div>
              </div>

              {/* Help Text */}
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h5 className="font-semibold text-yellow-900 mb-2">💡 Section Guidelines:</h5>
                <div className="text-sm text-yellow-800 space-y-2">
                  {communitySection === 'stats' && (
                    <div>
                      <p className="font-medium mb-1">Stats format (array of 4 items):</p>
                      <pre className="bg-yellow-100 p-2 rounded text-xs overflow-x-auto">
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
                      <pre className="bg-yellow-100 p-2 rounded text-xs overflow-x-auto">
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
                      <pre className="bg-yellow-100 p-2 rounded text-xs overflow-x-auto">
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
                      <pre className="bg-yellow-100 p-2 rounded text-xs overflow-x-auto">
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
                      <pre className="bg-yellow-100 p-2 rounded text-xs overflow-x-auto">
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
            <div className="grid md:grid-cols-3 gap-4 h-96">
              {/* Chat Sessions List */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <h3 className="font-semibold text-sm">Active Chats ({chatSessions.length})</h3>
                </div>
                <div className="overflow-y-auto h-80">
                  {chatSessions.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No active chats
                    </div>
                  ) : (
                    chatSessions.map((session) => (
                      <div
                        key={session._id}
                        onClick={() => setSelectedSession(session._id)}
                        className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                          selectedSession === session._id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-medium text-sm">
                                {session.senderName || 'Anonymous'}
                              </div>
                              {session.userId && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                                  Registered
                                </span>
                              )}
                            </div>
                            {session.userId && (
                              <div className="text-xs text-blue-600 font-mono mb-1">
                                ID: {session.userId.slice(0, 8)}...
                              </div>
                            )}
                            <div className="text-xs text-gray-600 truncate">
                              {session.lastMessage}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(session.lastTimestamp).toLocaleString()}
                            </div>
                          </div>
                          {session.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
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
              <div className="md:col-span-2 border rounded-lg overflow-hidden">
                {selectedSession ? (
                  <>
                    <div className="bg-gray-50 px-4 py-2 border-b">
                      <h3 className="font-semibold text-sm">Chat Session: {selectedSession.slice(-8)}</h3>
                    </div>
                    <div className="h-64 overflow-y-auto p-3 space-y-2">
                      {chatMessages.length === 0 ? (
                        <div className="text-center text-gray-500 text-sm">
                          No messages yet
                        </div>
                      ) : (
                        chatMessages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                              msg.sender === 'admin' 
                                ? 'bg-blue-500 text-white rounded-br-none' 
                                : 'bg-gray-100 text-gray-800 rounded-bl-none'
                            }`}>
                              <div className="text-xs opacity-70 mb-1">{msg.senderName}</div>
                              {msg.message}
                              <div className="text-xs opacity-50 mt-1">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="border-t p-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Type your response..."
                          value={adminMessage}
                          onChange={(e) => setAdminMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") sendAdminMessage();
                          }}
                          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        <button
                          onClick={sendAdminMessage}
                          disabled={!adminMessage.trim()}
                          className="px-4 py-2 rounded-lg bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
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
