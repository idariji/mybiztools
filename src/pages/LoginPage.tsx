import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, FileText, Receipt, Calculator, Bot, Hexagon, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '../components/auth/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../utils/useToast';
import { ToastContainer } from '../components/ui/Toast';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, addToast, removeToast } = useToast();
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [retryIn, setRetryIn] = useState(0);
  const [showOtp, setShowOtp] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // Auto-switch to signup tab if ?signup=true in URL
  useEffect(() => {
    if (new URLSearchParams(location.search).get('signup') === 'true') {
      setIsLogin(false);
    }
  }, [location.search]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!isLogin) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
      if (!validatePassword(formData.password)) {
        newErrors.password = 'Password must be 8+ chars with uppercase, number, and symbol';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!formData.agreeTerms) {
        newErrors.agreeTerms = 'You must agree to terms';
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        const doAuth = async () => {
          if (isLogin) {
            return login(formData.email, formData.password);
          } else {
            return signup({
              firstName: formData.firstName,
              lastName: formData.lastName,
              businessName: formData.businessName,
              email: formData.email,
              password: formData.password
            });
          }
        };

        let response = await doAuth();

        // Server sleeping on Render free tier — auto-retry with countdown
        if (!response.success && response.message.includes('Failed to connect')) {
          addToast('Server is starting up. Retrying in 30 seconds…', 'info');
          let count = 30;
          setRetryIn(count);
          const interval = setInterval(() => {
            count -= 1;
            setRetryIn(count);
            if (count <= 0) clearInterval(interval);
          }, 1000);
          await new Promise(res => setTimeout(res, 30000));
          clearInterval(interval);
          setRetryIn(0);
          response = await doAuth();
        }

        if (response.success) {
          if (isLogin) {
            addToast('Welcome back!', 'success');
            setTimeout(() => navigate('/dashboard'), 1500);
          } else {
            setSignupEmail(formData.email);
            setShowOtp(true);
            addToast(`A 6-digit code was sent to ${formData.email}`, 'info');
          }
        } else {
          addToast(response.message, 'error');
        }
      } finally {
        setLoading(false);
        setRetryIn(0);
      }
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { addToast('Enter the 6-digit code', 'error'); return; }
    setOtpLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupEmail, otp }),
      });
      const data = await res.json();
      if (data.success) {
        // Store token + user so dashboard loads correctly
        if (data.data?.token) {
          localStorage.setItem('authToken', data.data.token);
        }
        if (data.data?.user) {
          localStorage.setItem('user', JSON.stringify(data.data.user));
        }
        addToast('Email verified! Welcome to MyBizTools.', 'success');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        addToast(data.message || 'Invalid or expired code', 'error');
      }
    } catch {
      addToast('Could not reach server. Try again.', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupEmail }),
      });
      const data = await res.json();
      addToast(data.success ? 'New code sent!' : (data.message || 'Failed to resend'), data.success ? 'success' : 'error');
    } catch {
      addToast('Could not reach server.', 'error');
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1e3a8a] via-[#1e40af] to-[#1e3a8a] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-[#FF8A2B] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#FF6B00] rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <Hexagon className="w-12 h-12 fill-[#FF8A2B] text-[#FF8A2B]" />
            <span className="text-3xl font-bold">MyBizTools</span>
          </div>

          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Welcome to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00]">
              MyBizTools
            </span>
          </h1>

          <p className="text-xl text-slate-300 mb-12 max-w-md">
            Your all-in-one suite for business documents, planning, taxes, and AI assistance.
          </p>

          <div className="grid grid-cols-2 gap-6">
            {[
              { icon: FileText, label: 'Invoices' },
              { icon: Receipt, label: 'Receipts' },
              { icon: Calculator, label: 'Tax Tools' },
              { icon: Bot, label: 'AI Assistant' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <item.icon className="w-6 h-6 text-[#FF8A2B]" />
                <span className="font-medium">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-[#F0F3F5] relative min-h-screen">
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 sm:top-8 sm:left-8 flex items-center gap-2 text-slate-600 hover:text-[#FF8A2B] transition-colors font-semibold text-sm sm:text-base"
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Back to Home</span>
          <span className="sm:hidden">Back</span>
        </button>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mt-16 sm:mt-0"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
            {/* OTP Verification Screen */}
            {showOtp ? (
              <div>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-7 h-7 text-[#FF8A2B]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#1e3a8a]">Verify your email</h2>
                  <p className="text-sm text-slate-500 mt-1">We sent a 6-digit code to <strong>{signupEmail}</strong></p>
                </div>
                <form onSubmit={handleVerifyOtp}>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full text-center text-3xl font-bold tracking-[0.5em] px-4 py-4 border-2 border-slate-200 rounded-xl focus:border-[#FF8A2B] focus:outline-none mb-4"
                  />
                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] text-white font-bold py-4 rounded-xl shadow-lg mb-3"
                  >
                    {otpLoading ? 'Verifying…' : 'Verify Email'}
                  </button>
                </form>
                <div className="text-center">
                  <button onClick={handleResendOtp} className="text-sm text-[#FF8A2B] font-semibold hover:underline">
                    Didn't get the code? Resend
                  </button>
                </div>
              </div>
            ) : (
            <>
            {/* Tabs */}
            <div className="flex gap-2 mb-8 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  isLogin
                    ? 'bg-white text-[#1e3a8a] shadow-md'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  !isLogin
                    ? 'bg-white text-[#1e3a8a] shadow-md'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      error={errors.firstName}
                    />
                    <Input
                      label="Last Name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      error={errors.lastName}
                    />
                  </div>
                  <Input
                    label="Business Name"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    error={errors.businessName}
                  />
                </>
              )}

              <Input
                label="Email"
                type="email"
                icon={<Mail size={20} />}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
              />

              <Input
                label="Password"
                type="password"
                icon={<Lock size={20} />}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={errors.password}
              />

              {!isLogin && (
                <>
                  <Input
                    label="Confirm Password"
                    type="password"
                    icon={<Lock size={20} />}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    error={errors.confirmPassword}
                  />

                  <div className="mb-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.agreeTerms}
                        onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                        className="mt-1 w-5 h-5 rounded border-2 border-slate-300 text-[#FF8A2B] focus:ring-[#FF8A2B]"
                      />
                      <span className="text-sm text-slate-600">
                        I agree to the{' '}
                        <Link to="/terms" target="_blank" className="text-[#FF8A2B] font-semibold hover:underline">
                          Terms & Conditions
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" target="_blank" className="text-[#FF8A2B] font-semibold hover:underline">
                          Privacy Policy
                        </Link>
                      </span>
                    </label>
                    {errors.agreeTerms && <p className="text-red-500 text-sm mt-1">{errors.agreeTerms}</p>}
                  </div>
                </>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] hover:from-[#1e40af] hover:to-[#2563eb] text-white font-bold py-4 rounded-xl shadow-lg mb-4"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    {retryIn > 0 ? `Retrying in ${retryIn}s…` : 'Please wait…'}
                  </span>
                ) : (isLogin ? 'Login' : 'Create Account')}
              </Button>

              {isLogin && (
                <div className="text-center">
                  <button onClick={() => navigate('/forgot-password')} className="text-sm text-[#FF8A2B] font-semibold hover:underline">
                    Forgot Password?
                  </button>
                </div>
              )}
            </form>
          </>
          )}
          </div>

          <p className="text-center text-sm text-slate-600 mt-6">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#FF8A2B] font-semibold hover:underline"
            >
              {isLogin ? 'Create One' : 'Login'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
    </>
  );
}
