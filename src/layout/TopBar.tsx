import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, User, Menu, AlertCircle, FileText, Clock, CheckCircle, X } from 'lucide-react';
import { authService } from '../services/authService';
import { safeGetJSON } from '../utils/storage';
import { normalisePlan, FREE_DOCUMENT_LIMIT } from '../utils/planUtils';

interface TopBarProps {
  onMenuClick?: () => void;
}

interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  link?: string;
}

function buildNotifications(user: any): Notification[] {
  const notes: Notification[] = [];
  const plan = normalisePlan(user?.current_plan);

  // Unverified email
  if (user && !user.emailVerified) {
    notes.push({
      id: 'email-verify',
      type: 'warning',
      title: 'Verify your email',
      message: 'Check your inbox and verify your email address to secure your account.',
    });
  }

  // Incomplete profile
  if (user && (!user.phone || !user.businessName)) {
    notes.push({
      id: 'profile-incomplete',
      type: 'info',
      title: 'Complete your profile',
      message: 'Add your business name and phone number to your profile.',
      link: '/dashboard/profile',
    });
  }

  // Overdue invoices
  const invoices = safeGetJSON<any[]>('invoice-drafts', []);
  const overdue = invoices.filter((inv) => {
    if (inv.status === 'paid') return false;
    return inv.dueDate && new Date(inv.dueDate) < new Date();
  });
  if (overdue.length > 0) {
    notes.push({
      id: 'overdue-invoices',
      type: 'error',
      title: `${overdue.length} overdue invoice${overdue.length > 1 ? 's' : ''}`,
      message: 'You have unpaid invoices past their due date.',
      link: '/dashboard/invoices',
    });
  }

  // Draft documents not yet sent
  const allDrafts = [
    ...invoices,
    ...safeGetJSON<any[]>('quotation-drafts', []),
    ...safeGetJSON<any[]>('receipt-drafts', []),
  ].filter((d) => d.status === 'draft');
  if (allDrafts.length > 0) {
    notes.push({
      id: 'pending-drafts',
      type: 'info',
      title: `${allDrafts.length} unsent draft${allDrafts.length > 1 ? 's' : ''}`,
      message: 'You have documents saved as drafts that haven\'t been sent yet.',
      link: '/dashboard/invoices',
    });
  }

  // Free plan approaching limit
  if (plan === 'free') {
    const totalDocs = [
      ...invoices,
      ...safeGetJSON<any[]>('quotation-drafts', []),
      ...safeGetJSON<any[]>('receipt-drafts', []),
      ...safeGetJSON<any[]>('payslip-drafts', []),
    ].length;
    if (totalDocs >= FREE_DOCUMENT_LIMIT) {
      notes.push({
        id: 'free-limit',
        type: 'warning',
        title: 'Free plan limit reached',
        message: 'Upgrade your plan to create unlimited documents without restrictions.',
        link: '/dashboard/subscription',
      });
    }
  }

  return notes;
}

const NOTE_ICON: Record<string, typeof AlertCircle> = {
  warning: AlertCircle,
  error: Clock,
  info: FileText,
  success: CheckCircle,
};

const NOTE_COLORS: Record<string, string> = {
  warning: 'text-orange-500 bg-orange-50',
  error: 'text-red-500 bg-red-50',
  info: 'text-blue-500 bg-blue-50',
  success: 'text-green-500 bg-green-50',
};

export function TopBar({ onMenuClick }: TopBarProps = {}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('dismissed-notifications') || '[]')); }
    catch { return new Set(); }
  });
  const navigate = useNavigate();
  const notifRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setNotifications(buildNotifications(currentUser));
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const dismissNote = (id: string) => {
    const next = new Set(dismissed).add(id);
    setDismissed(next);
    localStorage.setItem('dismissed-notifications', JSON.stringify([...next]));
  };

  const visibleNotes = notifications.filter((n) => !dismissed.has(n.id));

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-white/40 shadow-[0_1px_20px_rgba(0,0,0,0.06)] px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
      {/* Hamburger — desktop sidebar toggle */}
      <button onClick={onMenuClick} className="hidden lg:block p-2 hover:bg-slate-100/80 rounded-lg active:scale-95 transition-colors">
        <Menu className="w-6 h-6 text-slate-600" />
      </button>
      {/* Mobile: app name */}
      <div className="flex items-center gap-2 lg:hidden">
        <span className="font-bold text-slate-900 text-base">MyBizTools</span>
      </div>

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

      <div className="flex items-center gap-1 sm:gap-3">

        {/* ── Notification bell ── */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowDropdown(false); }}
            className="relative p-2 hover:bg-slate-100/80 rounded-lg transition-colors active:scale-95"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            {visibleNotes.length > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center bg-red-500 rounded-full text-[9px] font-bold text-white px-0.5 leading-none">
                {visibleNotes.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
                {visibleNotes.length > 0 && (
                  <button
                    onClick={() => {
                      const all = new Set([...dismissed, ...notifications.map(n => n.id)]);
                      setDismissed(all);
                      localStorage.setItem('dismissed-notifications', JSON.stringify([...all]));
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {visibleNotes.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-600">You're all caught up!</p>
                  <p className="text-xs text-slate-400 mt-1">No new notifications</p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                  {visibleNotes.map((note) => {
                    const Icon = NOTE_ICON[note.type] || AlertCircle;
                    return (
                      <div key={note.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 group">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${NOTE_COLORS[note.type]}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => {
                            if (note.link) { navigate(note.link); setShowNotifications(false); }
                          }}
                        >
                          <p className="text-sm font-semibold text-slate-800">{note.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{note.message}</p>
                        </div>
                        <button
                          onClick={() => dismissNote(note.id)}
                          className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-100 transition-all flex-shrink-0"
                        >
                          <X className="w-3 h-3 text-slate-400" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── User dropdown ── */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => { setShowDropdown(!showDropdown); setShowNotifications(false); }}
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
