import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Hexagon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/apiConfig';

export function GoogleAuthSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setError('Authentication failed. No token received.');
      return;
    }

    async function finishLogin() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        // Handle both { data: { user } } and { data: { ...userFields } } shapes
        const user = data.data?.user ?? data.data ?? null;

        if (data.success && user) {
          const u = user as any;
          if (u.currentPlan && !u.current_plan) u.current_plan = u.currentPlan;
          localStorage.setItem('authToken', token);
          localStorage.setItem('user', JSON.stringify(u));
          refreshUser();
          navigate('/dashboard', { replace: true });
        } else {
          setError('Failed to load your profile. Please try logging in again.');
        }
      } catch {
        setError('Authentication error. Please try again.');
      }
    }

    finishLogin();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F3F5] p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Hexagon className="w-12 h-12 fill-[#FF8A2B] text-[#FF8A2B] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#1e3a8a] mb-2">Sign-in Failed</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] text-white font-bold py-3 px-8 rounded-xl"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F3F5] p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <Hexagon className="w-12 h-12 fill-[#FF8A2B] text-[#FF8A2B] mx-auto mb-6" />
        <h2 className="text-xl font-bold text-[#1e3a8a] mb-2">Completing sign-in…</h2>
        <p className="text-slate-500 mb-6">Please wait while we log you in.</p>
        <div className="flex justify-center">
          <svg className="animate-spin h-8 w-8 text-[#FF8A2B]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
