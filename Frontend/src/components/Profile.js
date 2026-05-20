import React, { useState } from "react";
import { motion } from "framer-motion";
import { updateUsername } from "../services/auth";

export default function Profile({ user, onBack, onLogout, onUserChange, onOrdersClick }) {
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user?.username || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!user) return;
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setError("Username cannot be empty");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const updated = await updateUsername(trimmed);
      onUserChange && onUserChange(updated);
      setEditing(false);
    } catch (e) {
      setError(e?.message || "Failed to update username");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pt-20 sm:pt-24 bg-[#07080d] min-h-[calc(100vh-64px)] font-dmsans text-[#e8eaf2]">
      <div className="flex items-center justify-between mb-8 gap-4 max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-syne font-bold text-[#e8eaf2]">Your Profile</h1>
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

      <div className="bg-[#12141e] border border-[#1e2130] rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 shadow-[0_4px_25px_rgba(0,0,0,0.2)] max-w-4xl mx-auto">
        <div className="w-20 h-20 rounded-full bg-[#6c63ff] text-white flex items-center justify-center text-3xl font-bold shrink-0">
          {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="flex-1 w-full">
          {!editing ? (
            <>
              <div className="text-xl font-syne font-bold text-[#e8eaf2]">{user?.username || "User"}</div>
              <div className="text-[#6b7094] mt-1">{user?.email || "unknown@example.com"}</div>
              {user?.userId && (
                <div className="text-xs text-[#6c63ff] font-mono mt-2 break-all bg-[#0f1118] border border-[#1e2130] px-2.5 py-1.5 rounded-lg inline-block">
                  ID: {user.userId}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-2 max-w-md mx-auto sm:mx-0 w-full text-left">
              <label className="text-xs font-semibold text-[#6b7094] uppercase tracking-wider">Username</label>
              <input
                className="bg-[#0f1118] border border-[#1e2130] rounded-lg px-3 py-2 text-[#e8eaf2] focus:outline-none focus:border-[#6c63ff] w-full"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                disabled={saving}
              />
              {error && <div className="text-sm text-[#ff6584] mt-1">{error}</div>}
              <div className="flex gap-2 mt-2">
                <motion.button
                  className="px-4 py-2 rounded-lg bg-[#6c63ff] text-white font-medium text-sm hover:opacity-90 transition-opacity"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </motion.button>
                <motion.button
                  className="px-4 py-2 rounded-lg bg-[#161921] border border-[#1e2130] text-[#6b7094] hover:text-[#e8eaf2] font-medium text-sm transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setEditing(false);
                    setNameInput(user?.username || "");
                    setError("");
                  }}
                  disabled={saving}
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          )}
        </div>
        {!editing && (
          <div className="flex sm:flex-col items-center gap-3 w-full sm:w-auto justify-center mt-4 sm:mt-0 shrink-0">
            <motion.button
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-[#161921] border border-[#1e2130] text-[#6b7094] hover:text-[#e8eaf2] font-medium text-sm transition-colors text-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setEditing(true)}
              disabled={!user}
            >
              Edit
            </motion.button>
            <motion.button
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-[#ff6584]/10 text-[#ff6584] hover:bg-[#ff6584]/20 border border-[#ff6584]/30 font-medium text-sm transition-colors text-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLogout}
            >
              Logout
            </motion.button>
          </div>
        )}
      </div>

      <div className="mt-12 max-w-4xl mx-auto">
        <h2 className="text-xl font-syne font-bold mb-4 text-[#e8eaf2]">Account</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 bg-[#12141e] border border-[#1e2130] rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
            <div className="text-xs font-semibold text-[#6b7094] uppercase tracking-wider mb-2">Username</div>
            <div className="font-medium text-[#e8eaf2] text-md">{user?.username || "—"}</div>
          </div>
          <div className="p-5 bg-[#12141e] border border-[#1e2130] rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
            <div className="text-xs font-semibold text-[#6b7094] uppercase tracking-wider mb-2">Email</div>
            <div className="font-medium text-[#e8eaf2] text-md">{user?.email || "—"}</div>
          </div>
          <div className="p-5 bg-[#12141e] border border-[#1e2130] rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
            <div className="text-xs font-semibold text-[#6b7094] uppercase tracking-wider mb-2">User ID</div>
            <div className="font-medium font-mono text-sm text-[#e8eaf2]">
              {user?.userId ? (
                <div className="flex items-center justify-between gap-2 break-all bg-[#0f1118] border border-[#1e2130] px-3 py-1.5 rounded-lg w-full">
                  <span className="text-[#6c63ff] font-semibold">{user.userId}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(user.userId);
                      alert("User ID copied to clipboard!");
                    }}
                    className="text-xs text-[#6b7094] hover:text-[#e8eaf2]"
                    title="Copy User ID"
                  >
                    📋
                  </button>
                </div>
              ) : (
                "—"
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 max-w-4xl mx-auto">
        <h2 className="text-xl font-syne font-bold mb-4 text-[#e8eaf2]">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <button
            onClick={onOrdersClick}
            className="p-6 bg-[#12141e] border border-[#1e2130] rounded-2xl hover:border-[#6c63ff] hover:shadow-[0_8px_30px_rgba(108,99,255,0.1)] transition-all text-left group"
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform w-fit">📦</div>
            <div className="font-syne font-bold text-lg text-[#e8eaf2] mb-1">View My Orders</div>
            <div className="text-sm text-[#6b7094]">Check your order history, delivery details, and receipts.</div>
          </button>
          <button
            onClick={onBack}
            className="p-6 bg-[#12141e] border border-[#1e2130] rounded-2xl hover:border-[#6c63ff] hover:shadow-[0_8px_30px_rgba(108,99,255,0.1)] transition-all text-left group"
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform w-fit">🛍️</div>
            <div className="font-syne font-bold text-lg text-[#e8eaf2] mb-1">Continue Shopping</div>
            <div className="text-sm text-[#6b7094]">Browse our templates, customize features, and design your site.</div>
          </button>
        </div>
      </div>
    </div>
  );
}
