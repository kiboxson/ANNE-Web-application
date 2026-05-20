import LoginForm from "./LoginForm.js";
import SignupForm from "./SignupForm";
import { AnimatePresence, motion } from "framer-motion";

function AuthModal({ isOpen, onClose, activeTab, setActiveTab, onSuccess }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Modal card */}
          <motion.div
            className="relative bg-[#12141e] border border-[#1e2130] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] w-96 p-6 text-[#e8eaf2]"
            role="dialog"
            aria-modal="true"
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#6b7094] hover:text-[#e8eaf2] transition-colors"
            >
              ✕
            </button>

            {/* Tabs */}
            <div className="flex mb-6 border-b border-[#1e2130]">
              <button
                className={`flex-1 py-2 font-syne font-semibold text-sm transition-all ${
                  activeTab === "login"
                    ? "border-b-2 border-[#6c63ff] text-white"
                    : "text-[#6b7094] hover:text-[#e8eaf2]"
                }`}
                onClick={() => setActiveTab("login")}
              >
                Login
              </button>
              <button
                className={`flex-1 py-2 font-syne font-semibold text-sm transition-all ${
                  activeTab === "signup"
                    ? "border-b-2 border-[#6c63ff] text-white"
                    : "text-[#6b7094] hover:text-[#e8eaf2]"
                }`}
                onClick={() => setActiveTab("signup")}
              >
                Signup
              </button>
            </div>

            {activeTab === "login" ? (
              <LoginForm onSuccess={onSuccess} />
            ) : (
              <SignupForm onSuccess={onSuccess} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AuthModal
