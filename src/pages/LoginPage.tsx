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
      if (isLogin) {
        // Login flow
        const response = await login(formData.email, formData.password);

        if (response.success) {
          addToast(`Welcome back!`, 'success');
          setTimeout(() => navigate('/dashboard'), 1500);
        } else {
          addToast(response.message, 'error');
        }
      } else {
        // Signup flow
        const response = await signup({
          firstName: formData.firstName,
          lastName: formData.lastName,
          businessName: formData.businessName,
          email: formData.email,
          password: formData.password
        });

        if (response.success) {
          addToast(`Welcome, ${formData.firstName}! Your account has been created.`, 'success');
          setTimeout(() => navigate('/dashboard'), 1500);
        } else {
          addToast(response.message, 'error');
        }
      }
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
                    label="Business Name (Optional)"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
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
                className="w-full bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] hover:from-[#1e40af] hover:to-[#2563eb] text-white font-bold py-4 rounded-xl shadow-lg mb-4"
              >
                {isLogin ? 'Login' : 'Create Account'}
              </Button>

              {isLogin && (
                <div className="text-center">
                  <button onClick={() => navigate('/forgot-password')} className="text-sm text-[#FF8A2B] font-semibold hover:underline">
                    Forgot Password?
                  </button>
                </div>
              )}
            </form>
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
