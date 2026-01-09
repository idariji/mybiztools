import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, Mail } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useToast } from '../utils/useToast';
import { ToastContainer } from '../components/ui/Toast';
import { authService } from '../services/authService';

export function EmailVerificationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toasts, addToast, removeToast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const verifyEmail = useCallback(async (token: string) => {
    try {
      const result = await authService.verifyEmail(token);

      if (result.success) {
        setStatus('success');
        addToast('Email verified successfully! Redirecting to dashboard...', 'success');
        // Update local user data to reflect verified status
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          localStorage.setItem('user', JSON.stringify({
            ...currentUser,
            emailVerified: true
          }));
        }
        // Auto-redirect to dashboard after 3 seconds
        setTimeout(() => navigate('/dashboard'), 3000);
      } else {
        setStatus('error');
        setErrorMessage(result.message || 'Verification failed. Please try again.');
        addToast(result.message || 'Verification failed', 'error');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setErrorMessage('Unable to connect to server. Please try again later.');
      addToast('Verification failed. Please try again.', 'error');
    }
  }, [navigate, addToast]);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('no-token');
      setErrorMessage('No verification token provided. Please check your email for the verification link.');
      return;
    }

    verifyEmail(token);
  }, [searchParams, verifyEmail]);

  const handleResendVerification = async () => {
    const currentUser = authService.getCurrentUser();
    const email = currentUser?.email;

    if (!email) {
      addToast('Please log in to resend verification email', 'error');
      navigate('/login');
      return;
    }

    setResendLoading(true);
    try {
      const result = await authService.resendVerificationEmail(email);
      if (result.success) {
        setResendSuccess(true);
        addToast('Verification email sent! Please check your inbox.', 'success');
      } else {
        addToast(result.message || 'Failed to resend email', 'error');
      }
    } catch (error) {
      addToast('Failed to resend verification email', 'error');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-[#F0F3F5] to-[#e5e9ed]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border border-white/20 text-center">
            {status === 'loading' && (
              <>
                <Loader className="w-16 h-16 text-[#5BC0BE] mx-auto mb-4 animate-spin" />
                <h2 className="text-2xl font-bold text-[#0B132B] mb-2">Verifying Email...</h2>
                <p className="text-slate-600">Please wait while we verify your email address</p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[#0B132B] mb-2">Email Verified!</h2>
                <p className="text-slate-600 mb-6">
                  Your email has been successfully verified. You can now access your account.
                </p>
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] hover:from-[#1e40af] hover:to-[#2563eb] text-white font-bold py-3 px-8 rounded-xl shadow-lg"
                >
                  Go to Dashboard
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[#0B132B] mb-2">Verification Failed</h2>
                <p className="text-slate-600 mb-6">
                  {errorMessage || 'The verification link is invalid or has expired.'}
                </p>
                {resendSuccess ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <Mail className="w-5 h-5" />
                    <span>Verification email sent! Check your inbox.</span>
                  </div>
                ) : (
                  <Button
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className="bg-gradient-to-r from-[#5BC0BE] to-[#3da5a3] hover:from-[#4aafad] hover:to-[#2e8a88] text-white font-bold py-3 px-8 rounded-xl shadow-lg disabled:opacity-50"
                  >
                    {resendLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      'Resend Verification Email'
                    )}
                  </Button>
                )}
              </>
            )}

            {status === 'no-token' && (
              <>
                <Mail className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[#0B132B] mb-2">No Verification Token</h2>
                <p className="text-slate-600 mb-6">
                  {errorMessage}
                </p>
                <div className="space-y-3">
                  {resendSuccess ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span>Verification email sent! Check your inbox.</span>
                    </div>
                  ) : (
                    <Button
                      onClick={handleResendVerification}
                      disabled={resendLoading}
                      className="w-full bg-gradient-to-r from-[#5BC0BE] to-[#3da5a3] hover:from-[#4aafad] hover:to-[#2e8a88] text-white font-bold py-3 px-8 rounded-xl shadow-lg disabled:opacity-50"
                    >
                      {resendLoading ? (
                        <span className="flex items-center gap-2 justify-center">
                          <Loader className="w-4 h-4 animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        'Resend Verification Email'
                      )}
                    </Button>
                  )}
                  <Button
                    onClick={() => navigate('/login')}
                    variant="outline"
                    className="w-full border-2 border-[#1e3a8a] text-[#1e3a8a] font-bold py-3 px-8 rounded-xl"
                  >
                    Back to Login
                  </Button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
