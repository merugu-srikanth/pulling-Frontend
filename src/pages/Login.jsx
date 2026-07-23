import { useState } from "react";
import { Lock, Mail, AlertCircle, Eye, EyeOff } from "lucide-react";
import { authAPI } from "../services/auth";
import toast from "react-hot-toast";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.login(email, password);
      const { token, user } = res.data;

      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminUser", JSON.stringify(user));
      
      toast.success(`Welcome back, ${user.name}!`);
      
      // Dispatch event to trigger state updates in other components
      window.dispatchEvent(new Event("authChanged"));
      
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || "Login failed. Please check your credentials.";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      {/* Background blobs for premium glassmorphism effect */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md bg-slate-800/40 border border-slate-700/50 backdrop-blur-md rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Logo / Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-indigo-600 items-center justify-center shadow-lg shadow-indigo-500/30">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white font-sans tracking-tight">Admin Gateway</h1>
          <p className="text-sm text-slate-400 font-medium font-sans">
            Please log in with your credentials to proceed.
          </p>
        </div>

        {/* Credentials reminder */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-400 font-sans space-y-1">
            <p className="font-bold text-slate-300">Default Super Admin Account:</p>
            <p>Email: <span className="font-mono text-indigo-300 font-semibold select-all">superadmin@company.com</span></p>
            <p>Password: <span className="font-mono text-indigo-300 font-semibold select-all">Password@123</span></p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="admin@company.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-850/50 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-sans"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-850/50 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-sans"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-indigo-600/20 mt-2"
          >
            {loading ? "Logging in..." : "Access Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
