import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!result.success || !result.data) {
        setError(result.message || 'Login failed. Please try again.');
        return;
      }

      const { admin, token } = result.data;

      // Store token and admin profile so authService.getCurrentUser() works
      localStorage.setItem('adminAuthToken', token);
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify({
        id: admin.id,
        email: admin.email,
        firstName: admin.name,
        lastName: '',
        businessName: null,
        emailVerified: true,
        current_plan: 'enterprise',
        role: admin.role,
      }));

      navigate('/admin');
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/10 blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -15, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-slate-600/30 to-slate-700/20 blur-[100px]"
        />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4"
      >
        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-[#FF8A2B] to-[#FF6B00] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">MyBizTools Admin</h1>
          <p className="text-white/50 text-sm mt-1 text-center">Restricted access. Authorized personnel only.</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-start gap-2 bg-red-500/20 border border-red-500/40 text-red-300 rounded-xl px-4 py-3 text-sm">
            <Lock className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-white/70 text-xs font-semibold uppercase tracking-wider mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              placeholder="admin@example.com"
              className="w-full bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-[#FF8A2B]/60 focus:ring-2 focus:ring-[#FF8A2B]/20 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-white/70 text-xs font-semibold uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-[#FF8A2B]/60 focus:ring-2 focus:ring-[#FF8A2B]/20 rounded-xl px-4 py-3 pr-12 text-sm outline-none transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] hover:from-[#FF6B00] hover:to-[#E55A00] text-white rounded-xl py-3 font-semibold shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign In to Admin'
            )}
          </button>
        </form>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-white/40 hover:text-white/70 text-sm transition-colors">
            ← Back to App
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
