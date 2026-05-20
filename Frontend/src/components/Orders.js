import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from 'axios';
import { API_BASE_URL_EXPORT } from '../config/api';
import { getCurrentUser } from "../services/auth";

export default function Orders({ onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    if (currentUser?.userId) {
      loadUserOrders(currentUser.userId);
    } else {
      setLoading(false);
    }
  }, []);

  async function loadUserOrders(userId) {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL_EXPORT}/api/orders/user/${userId}`);
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'processing': return 'bg-blue-500/10 text-[#6c63ff] border-[#6c63ff]/20';
      case 'shipped': return 'bg-purple-500/10 text-[#c850c0] border-purple-500/20';
      case 'delivered': return 'bg-green-500/10 text-[#43e97b] border-green-500/20';
      case 'cancelled': return 'bg-red-500/10 text-[#ff6584] border-red-500/20';
      default: return 'bg-gray-500/10 text-[#6b7094] border-gray-500/20';
    }
  }

  function getStatusIcon(status) {
    switch (status) {
      case 'pending': return '⏳';
      case 'processing': return '⚙️';
      case 'shipped': return '🚚';
      case 'delivered': return '✅';
      case 'cancelled': return '❌';
      default: return '📦';
    }
  }

  if (!user) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pt-20 sm:pt-24 bg-[#07080d] min-h-[calc(100vh-64px)] font-dmsans text-[#e8eaf2]">
        <div className="bg-[#12141e] border border-[#1e2130] rounded-2xl shadow-lg p-8 text-center max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4 font-syne text-[#e8eaf2]">Please Login</h2>
          <p className="text-[#6b7094] mb-6">You need to be logged in to view your orders.</p>
          <button
            onClick={onBack}
            className="px-5 py-2.5 bg-[#6c63ff] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pt-20 sm:pt-24 bg-[#07080d] min-h-[calc(100vh-64px)] font-dmsans text-[#e8eaf2]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-syne font-bold text-[#e8eaf2]">My Orders</h1>
        <motion.button
          className="px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          style={{ background: '#161921', border: '1px solid #1e2130', color: '#6b7094' }}
          whileHover={{ scale: 1.02, color: '#e8eaf2' }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
        >
          Back
        </motion.button>
      </div>

      {loading ? (
        <div className="text-center text-[#6b7094] py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6c63ff]"></div>
          <p className="mt-4 font-medium">Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-[#12141e] border border-[#1e2130] rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.3)] max-w-2xl mx-auto">
          <div className="text-5xl mb-4">📦</div>
          <h2 className="text-xl font-syne font-bold text-[#e8eaf2] mb-2">No Orders Yet</h2>
          <p className="text-[#6b7094] mb-6">You haven't placed any orders yet. Start shopping to see your orders here!</p>
          <button
            onClick={onBack}
            className="px-6 py-2.5 bg-[#6c63ff] text-white rounded-lg font-medium hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(108,99,255,0.3)]"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl mx-auto">
          {orders.map((order) => (
            <motion.div
              key={order.orderId}
              className="bg-[#12141e] border border-[#1e2130] rounded-2xl p-6 transition-all hover:border-[#6c63ff] cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedOrder(order)}
            >
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                  <div>
                    <h3 className="font-syne font-bold text-lg text-[#e8eaf2]">Order #{order.orderId}</h3>
                    <p className="text-[#6b7094] text-sm">
                      Placed on {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-1">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                      <span>{getStatusIcon(order.status)}</span>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                    <p className="text-xl font-syne font-bold text-[#43e97b] mt-1">${order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#6b7094] border-t border-[#1e2130] pt-4">
                  <span>📦 {order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                  {order.trackingNumber && (
                    <span className="hidden sm:inline">•</span>
                  )}
                  {order.trackingNumber && (
                    <span>🚚 Tracking: {order.trackingNumber}</span>
                  )}
                  {order.estimatedDelivery && (
                    <span>•</span>
                  )}
                  {order.estimatedDelivery && (
                    <span>📅 Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {order.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center gap-2 bg-[#0f1118] border border-[#1e2130] rounded-lg px-3 py-1.5 text-xs text-[#e8eaf2]">
                      {item.image && (
                        <img src={item.image} alt={item.title} className="w-6 h-6 rounded object-cover" />
                      )}
                      <span className="font-medium">{item.title} <span className="text-[#6c63ff] font-bold">x{item.quantity}</span></span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="bg-[#161921] border border-[#1e2130] rounded-lg px-3 py-1.5 text-xs text-[#6b7094]">
                      +{order.items.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              className="bg-[#12141e] border border-[#1e2130] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1e2130]">
                  <h2 className="text-xl font-syne font-bold text-[#e8eaf2]">Order Details</h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-[#6b7094] hover:text-[#e8eaf2] text-2xl transition-colors"
                  >
                    ×
                  </button>
                </div>

                {/* Order Info */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-[#0f1118] border border-[#1e2130] rounded-xl p-4">
                    <h3 className="font-syne font-bold mb-3 text-[#6c63ff] text-sm uppercase tracking-wider">Order Information</h3>
                    <div className="space-y-2 text-sm text-[#e8eaf2]">
                      <p><strong className="text-[#6b7094]">Order ID:</strong> {selectedOrder.orderId}</p>
                      <p><strong className="text-[#6b7094]">Date:</strong> {new Date(selectedOrder.orderDate).toLocaleString()}</p>
                      <p className="flex items-center"><strong className="text-[#6b7094] mr-2">Status:</strong> 
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(selectedOrder.status)}`}>
                          {getStatusIcon(selectedOrder.status)} {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                        </span>
                      </p>
                      <p><strong className="text-[#6b7094]">Payment:</strong> {selectedOrder.paymentMethod}</p>
                      {selectedOrder.trackingNumber && (
                        <p><strong className="text-[#6b7094]">Tracking:</strong> {selectedOrder.trackingNumber}</p>
                      )}
                      {selectedOrder.estimatedDelivery && (
                        <p><strong className="text-[#6b7094]">Est. Delivery:</strong> {new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#0f1118] border border-[#1e2130] rounded-xl p-4">
                    <h3 className="font-syne font-bold mb-3 text-[#6c63ff] text-sm uppercase tracking-wider">Shipping Address</h3>
                    <div className="text-sm text-[#e8eaf2] space-y-1">
                      <p className="font-semibold">{selectedOrder.customerName || user?.username}</p>
                      <p>{selectedOrder.shippingAddress.street}</p>
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                      <p>{selectedOrder.shippingAddress.zipCode}</p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-8">
                  <h3 className="font-syne font-bold mb-4 text-[#e8eaf2] text-md">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-[#0f1118] border border-[#1e2130] rounded-xl">
                        {item.image && (
                          <img src={item.image} alt={item.title} className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-syne font-bold text-sm sm:text-base text-[#e8eaf2] truncate">{item.title}</h4>
                          <p className="text-xs sm:text-sm text-[#6b7094] mt-0.5">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-syne font-bold text-sm sm:text-base text-[#e8eaf2]">${(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-xs text-[#6b7094]">${item.price.toFixed(2)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-[#1e2130] pt-6 flex justify-between items-center">
                  <span className="text-lg font-syne font-bold text-[#e8eaf2]">Total Amount:</span>
                  <span className="text-2xl font-syne font-bold text-[#43e97b]">${selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
