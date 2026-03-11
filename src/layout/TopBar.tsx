import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, User, Menu } from 'lucide-react';
import { authService } from '../services/authService';

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps = {}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-white/40 shadow-[0_1px_20px_rgba(0,0,0,0.06)] px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
      <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-slate-100/80 rounded-lg active:scale-95 transition-colors">
        <Menu className="w-6 h-6 text-slate-600" />
      </button>
      <div className="flex-1 max-w-xl hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50/80 border border-slate-200/60 focus:outline-none focus:bg-white focus:border-[#FF8A2B]/60 focus:ring-2 focus:ring-[#FF8A2B]/20 transition-all duration-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-4">
        <button className="relative p-2 hover:bg-slate-100/80 rounded-lg transition-colors active:scale-95 hidden md:block">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 hover:bg-slate-100/80 rounded-lg transition-colors active:scale-95"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#FF8A2B] to-[#FF6B00] flex items-center justify-center text-white font-bold shadow-md">
              {user?.firstName ? user.firstName.charAt(0).toUpperCase() : <User size={18} />}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-slate-900">
                {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.businessName || 'User'}
              </p>
              <p className="text-xs text-slate-500">{user?.email || 'user@mybiztools.app'}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-600 hidden sm:block" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
              <button
                onClick={() => { navigate('/dashboard/account'); setShowDropdown(false); }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                Account
              </button>
              <button
                onClick={() => { navigate('/dashboard/profile'); setShowDropdown(false); }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                Profile
              </button>
              <button
                onClick={() => { navigate('/dashboard/settings'); setShowDropdown(false); }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                Settings
              </button>
              <hr className="my-2 border-slate-200" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
