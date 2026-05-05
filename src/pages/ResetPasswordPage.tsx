import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, CheckCircle, KeyRound } from 'lucide-react';
import { Input } from '../components/auth/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../utils/useToast';
import { ToastContainer } from '../components/ui/Toast';
import { authService } from '../services/authService';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toasts, addToast, removeToast } = useToast();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const emailFromParams = searchParams.get('email');
    if (emailFromParams) setEmail(emailFromParams);
  }, [searchParams]);

  const validatePassword = (pw: string) =>
    pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[!@#$%^&*]/.test(pw);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!otp || otp.length !== 6) {
      newErrors.otp = 'Enter the 6-digit code from your email';
    }
    if (!validatePassword(password)) {
      newErrors.password = 'Password must be 8+ chars with uppercase, number, and symbol';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      const result = await authService.resetPassword(email, otp, password);
      if (result.success) {
        addToast('Password reset successfully!', 'success');
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2500);
      } else {
        addToast(result.message || 'Failed to reset password', 'error');
      }
    } catch {
      addToast('Failed to reset password. Please try again.', 'error');
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
            {success ? (
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[#0B132B] mb-2">Password Reset!</h2>
                <p className="text-slate-600 mb-6">
                  Your password has been successfully reset. Redirecting to login…
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="text-[#5BC0BE] font-semibold hover:underline"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                    <KeyRound className="w-7 h-7 text-[#1e3a8a]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#0B132B]">Reset Password</h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Enter the 6-digit code sent to your email and choose a new password
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Email Address"
                    type="email"
                    icon={<Mail size={20} />}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                    placeholder="you@example.com"
                  />

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className={`w-full text-center text-2xl font-bold tracking-[0.5em] px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                        errors.otp
                          ? 'border-red-400 focus:border-red-500'
                          : 'border-slate-200 focus:border-[#5BC0BE]'
                      }`}
                    />
                    {errors.otp && (
                      <p className="text-red-500 text-xs mt-1">{errors.otp}</p>
                    )}
                  </div>

                  <Input
                    label="New Password"
                    type="password"
                    icon={<Lock size={20} />}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    icon={<Lock size={20} />}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={errors.confirmPassword}
                  />

                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Password requirements:</p>
                    <ul className="text-xs text-slate-500 space-y-1">
                      {[
                        [password.length >= 8, 'At least 8 characters'],
                        [/[A-Z]/.test(password), 'One uppercase letter'],
                        [/[0-9]/.test(password), 'One number'],
                        [/[!@#$%^&*]/.test(password), 'One special character (!@#$%^&*)'],
                      ].map(([met, label]) => (
                        <li key={label as string} className={met ? 'text-green-600' : ''}>
                          {met ? '✓' : '○'} {label as string}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#5BC0BE] to-[#3da5a3] hover:from-[#4aafad] hover:to-[#2e8a88] text-white font-bold py-4 rounded-xl shadow-lg disabled:opacity-50"
                  >
                    {isLoading ? 'Resetting…' : 'Reset Password'}
                  </Button>

                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="w-full text-sm text-slate-500 hover:text-[#5BC0BE] transition-colors"
                  >
                    Didn't receive a code? Request again
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
