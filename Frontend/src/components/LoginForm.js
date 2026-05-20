import { useEffect, useState } from "react";
import { login } from "../services/auth";
import auth from "../firebase";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/home");
      }
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }
    try {
      setLoading(true);
      const user = await login({ email, password });
      onSuccess && onSuccess(user);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error ? (
        <div className="text-[#ff6584] text-sm font-semibold bg-[#ff6584]/10 border border-[#ff6584]/20 px-3 py-2 rounded-lg" role="alert">{error}</div>
      ) : null}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-2.5 bg-[#0f1118] border border-[#1e2130] rounded-lg text-[#e8eaf2] placeholder-[#6b7094] focus:border-[#6c63ff] outline-none transition-colors"
      />
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2.5 bg-[#0f1118] border border-[#1e2130] rounded-lg text-[#e8eaf2] placeholder-[#6b7094] focus:border-[#6c63ff] outline-none pr-10 transition-colors"
        />
        <button
          type="button"
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={() => setShowPassword((s) => !s)}
          className="absolute inset-y-0 right-3 flex items-center text-[#6b7094] hover:text-[#e8eaf2] transition-colors"
        >
          {showPassword ? (
            // Eye-off icon
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-5.5-10-7 0-.67 1.014-2.327 2.955-3.94M6.31 6.31C8.018 5.154 9.95 5 12 5c5.523 0 10 5.5 10 7 0 .617-.84 2.067-2.45 3.6M3 3l18 18" />
            </svg>
          ) : (
            // Eye icon
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#6c63ff] text-white py-2.5 rounded-lg hover:opacity-90 transition-all font-semibold font-syne disabled:opacity-60 shadow-[0_0_12px_rgba(108,99,255,0.25)]"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}

export default LoginForm

