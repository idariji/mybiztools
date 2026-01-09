import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Input } from '../components/auth/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../utils/useToast';
import { ToastContainer } from '../components/ui/Toast';
import { authService } from '../services/authService';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await authService.requestPasswordReset(email);
      if (result.success) {
        addToast('Password reset link sent to your email!', 'success');
        setSent(true);
      } else {
        // Still show success message for security (don't reveal if email exists)
        addToast('If an account exists with this email, a reset link will be sent.', 'success');
        setSent(true);
      }
    } catch (err) {
      addToast('Failed to send reset email. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-[#F0F3F5] to-[#e5e9ed]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          {!sent ? (
            <>
              <h2 className="text-3xl font-bold text-[#0B132B] mb-2">Forgot Password?</h2>
              <p className="text-slate-600 mb-8">
                Enter your email and we'll send you a reset link
              </p>

              <form onSubmit={handleSubmit}>
                <Input
                  label="Email Address"
                  type="email"
                  icon={<Mail size={20} />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={error}
                  placeholder="you@example.com"
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#5BC0BE] to-[#3da5a3] hover:from-[#4aafad] hover:to-[#2e8a88] text-white font-bold py-4 rounded-xl shadow-lg mb-4 disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>

                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-[#5BC0BE] transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#0B132B] mb-2">Check Your Email</h2>
              <p className="text-slate-600 mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <button
                onClick={() => navigate('/login')}
                className="text-[#5BC0BE] font-semibold hover:underline"
              >
                Return to Login
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
    </>
  );
}
