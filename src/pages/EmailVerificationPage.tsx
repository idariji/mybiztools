import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader, Mail } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useToast } from '../utils/useToast';
import { ToastContainer } from '../components/ui/Toast';
import { authService } from '../services/authService';

export function EmailVerificationPage() {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const currentUser = authService.getCurrentUser();
  const [email, setEmail] = useState(currentUser?.email || '');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleVerify = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || otp.length !== 6) {
      addToast('Enter your email and the 6-digit code', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.verifyEmailOtp(email, otp);
      if (result.success) {
        setSuccess(true);
        addToast('Email verified! Redirecting to dashboard…', 'success');
        setTimeout(() => navigate('/dashboard'), 2500);
      } else {
        addToast(result.message || 'Invalid or expired code. Please try again.', 'error');
      }
    } catch {
      addToast('Unable to connect to server. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [email, otp, addToast, navigate]);

  const handleResend = async () => {
    if (!email) {
      addToast('Enter your email address first', 'error');
      return;
    }
    setResendLoading(true);
    try {
      const result = await authService.resendVerificationEmail(email);
      if (result.success) {
        addToast('Verification code sent! Check your inbox.', 'success');
      } else {
        addToast(result.message || 'Failed to resend code', 'error');
      }
    } catch {
      addToast('Failed to resend verification code', 'error');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-[#F0F3F5] to-[#e5e9ed]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20 text-center">
            {success ? (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[#0B132B] mb-2">Email Verified!</h2>
                <p className="text-slate-600 mb-6">
                  Your email has been verified. Redirecting to dashboard…
                </p>
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] text-white font-bold py-3 px-8 rounded-xl shadow-lg"
                >
                  Go to Dashboard
                </Button>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-7 h-7 text-[#FF8A2B]" />
                </div>
                <h2 className="text-2xl font-bold text-[#0B132B] mb-1">Verify Your Email</h2>
                <p className="text-slate-500 text-sm mb-6">
                  Enter the 6-digit code we sent to your email address
                </p>

                <form onSubmit={handleVerify} className="text-left space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#FF8A2B] focus:outline-none"
                    />
                  </div>

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
                      className="w-full text-center text-3xl font-bold tracking-[0.5em] px-4 py-4 border-2 border-slate-200 rounded-xl focus:border-[#FF8A2B] focus:outline-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] text-white font-bold py-4 rounded-xl shadow-lg disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        Verifying…
                      </span>
                    ) : (
                      'Verify Email'
                    )}
                  </Button>
                </form>

                <button
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="mt-4 text-sm text-[#FF8A2B] font-semibold hover:underline disabled:opacity-50"
                >
                  {resendLoading ? 'Sending…' : "Didn't get the code? Resend"}
                </button>

                <button
                  onClick={() => navigate('/login')}
                  className="block mt-3 text-sm text-slate-400 hover:text-slate-600 mx-auto"
                >
                  Back to Login
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
