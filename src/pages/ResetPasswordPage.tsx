import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { Input } from '../components/auth/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../utils/useToast';
import { ToastContainer } from '../components/ui/Toast';
import { authService } from '../services/authService';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toasts, addToast, removeToast } = useToast();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setTokenError(true);
    }
  }, [token]);

  const validatePassword = (password: string) => {
    return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be 8+ chars with uppercase, number, and symbol';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0 && token) {
      setIsLoading(true);
      try {
        const result = await authService.resetPassword(token, formData.password);
        if (result.success) {
          addToast('Password reset successfully!', 'success');
          setSuccess(true);
          setTimeout(() => navigate('/login'), 2000);
        } else {
          addToast(result.message || 'Failed to reset password', 'error');
        }
      } catch (err) {
        addToast('Failed to reset password. Please try again.', 'error');
      } finally {
        setIsLoading(false);
      }
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
          {tokenError ? (
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#0B132B] mb-2">Invalid Reset Link</h2>
              <p className="text-slate-600 mb-6">
                This password reset link is invalid or has expired.
              </p>
              <button
                onClick={() => navigate('/forgot-password')}
                className="text-[#5BC0BE] font-semibold hover:underline"
              >
                Request a New Link
              </button>
            </div>
          ) : !success ? (
            <>
              <h2 className="text-3xl font-bold text-[#0B132B] mb-2">Reset Password</h2>
              <p className="text-slate-600 mb-8">Enter your new password</p>

              <form onSubmit={handleSubmit}>
                <Input
                  label="New Password"
                  type="password"
                  icon={<Lock size={20} />}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  error={errors.password}
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  icon={<Lock size={20} />}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  error={errors.confirmPassword}
                />

                <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Password must contain:</p>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                      ✓ At least 8 characters
                    </li>
                    <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                      ✓ One uppercase letter
                    </li>
                    <li className={/[0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                      ✓ One number
                    </li>
                    <li className={/[!@#$%^&*]/.test(formData.password) ? 'text-green-600' : ''}>
                      ✓ One special character
                    </li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#5BC0BE] to-[#3da5a3] hover:from-[#4aafad] hover:to-[#2e8a88] text-white font-bold py-4 rounded-xl shadow-lg disabled:opacity-50"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#0B132B] mb-2">Password Reset!</h2>
              <p className="text-slate-600 mb-6">
                Your password has been successfully reset.
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
