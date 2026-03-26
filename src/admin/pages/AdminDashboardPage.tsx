/**
 * Main Admin Dashboard Page
 * Entry point for all admin operations
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Users,
  DollarSign,
  AlertTriangle,
  Settings,
  LogOut,
  Menu,
  X,
  HeadphonesIcon,
  UserCog,
  Bell,
  Hexagon,
  Bell as BellIcon,
  Shield,
  Activity
} from 'lucide-react';
import { useAdminAuth } from '../../../admin-portal/src/contexts/AdminAuthContext';
import { DashboardOverview } from '../components/DashboardOverview';
import { UserBillingManager } from '../components/UserBillingManager';
import { UserManagement } from '../components/UserManagement';
import { AbuseDetectionDashboard } from '../components/AbuseDetectionDashboard';
import { PaymentHistoryViewer } from '../components/PaymentHistoryViewer';
import { CustomerSupport } from '../components/CustomerSupport';

type AdminTab = 'overview' | 'users' | 'user-management' | 'payments' | 'support' | 'abuse' | 'settings';

export function AdminDashboardPage() {
  const { admin, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Map admin user to expected shape
  const user = admin ? {
    firstName: admin.firstName,
    lastName: admin.lastName,
    email: admin.email,
    role: admin.role,
  } : null;

  const navItems: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'user-management', label: 'All Users', icon: Users },
    { id: 'users', label: 'User Billing', icon: UserCog },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'support', label: 'Customer Support', icon: HeadphonesIcon },
    { id: 'abuse', label: 'Abuse Detection', icon: AlertTriangle },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const currentNavItem = navItems.find((item) => item.id === activeTab);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
        onSignOut={logout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <AdminHeader
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          activeTab={activeTab}
          navItems={navItems}
          user={user}
        />

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Page Title */}
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {currentNavItem?.label}
              </h1>
              <div className="h-1 w-16 bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] rounded-full mt-2 mb-1" />
              <p className="text-slate-500 mt-1">
                Manage your platform's billing, subscriptions, and compliance
              </p>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {activeTab === 'overview' && <DashboardOverview />}
                {activeTab === 'user-management' && <UserManagement />}
                {activeTab === 'users' && <UserBillingManager />}
                {activeTab === 'payments' && <PaymentHistoryViewer />}
                {activeTab === 'support' && <CustomerSupport />}
                {activeTab === 'abuse' && <AbuseDetectionDashboard />}
                {activeTab === 'settings' && <AdminSettingsPanel user={user} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

// ============================================================================
// SIDEBAR COMPONENT
// ============================================================================

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: {
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  user: any;
  onSignOut: () => void;
}

function AdminSidebar({
  isOpen,
  onClose,
  navItems,
  activeTab,
  onTabChange,
  user,
  onSignOut
}: AdminSidebarProps) {
  const handleSignOut = onSignOut;

  const initials = user
    ? `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase() || 'A'
    : 'A';

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:relative w-64 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white overflow-y-auto transition-transform z-50 md:z-0 md:translate-x-0 flex flex-col border-r border-white/10`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#FF8A2B] to-[#FF6B00] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
              <Hexagon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">MyBizTools</h1>
              <p className="text-xs text-white/40 leading-tight">Admin Portal</p>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-4 p-1.5 hover:bg-white/10 rounded-lg md:hidden"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  if (window.innerWidth < 768) {
                    onClose();
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FF8A2B]/20 to-[#FF6B00]/10 border border-[#FF8A2B]/30 text-[#FF8A2B] backdrop-blur-sm shadow-lg shadow-[#FF8A2B]/10'
                    : 'text-white/60 hover:bg-white/10 hover:backdrop-blur-sm hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#FF8A2B]' : 'text-white/60'}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          {/* User info */}
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#FF8A2B] to-[#FF6B00] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Admin'}
              </p>
              <p className="text-xs text-white/40 truncate">{user?.role || 'admin'}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// ============================================================================
// HEADER COMPONENT
// ============================================================================

interface AdminHeaderProps {
  onMenuClick: () => void;
  activeTab: AdminTab;
  navItems: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[];
  user: any;
}

function AdminHeader({ onMenuClick, activeTab, navItems, user }: AdminHeaderProps) {
  const currentItem = navItems.find((item) => item.id === activeTab);

  const initials = user
    ? `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase() || 'A'
    : 'A';

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-white/40 shadow-[0_1px_20px_rgba(0,0,0,0.06)] px-6 py-4 shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors md:hidden"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="text-lg font-semibold text-slate-800 hidden sm:block">
            {currentItem?.label}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Bell */}
          <button className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <BellIcon className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User */}
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden sm:block">
              <div className="flex items-center gap-1.5 justify-end">
                <p className="text-sm font-medium text-slate-900">
                  {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Admin User'}
                </p>
                <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full font-semibold">Admin</span>
              </div>
              <p className="text-xs text-slate-500">{user?.role || 'super_admin'}</p>
            </div>
            <div className="w-9 h-9 bg-gradient-to-br from-[#FF8A2B] to-[#FF6B00] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md shadow-orange-500/20">
              {initials}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ============================================================================
// SETTINGS PANEL
// ============================================================================

interface AdminSettingsPanelProps {
  user?: any;
}

function AdminSettingsPanel({ user }: AdminSettingsPanelProps) {
  const [settings, setSettings] = useState({
    email_notifications: true,
    abuse_alerts: true,
    payment_alerts: true,
    daily_reports: true,
    two_factor_enabled: false,
    ip_whitelist: [] as string[]
  });
  const [savedPrefs, setSavedPrefs] = useState(false);
  const [savedSecurity, setSavedSecurity] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Admin Settings */}
      <div className="lg:col-span-2 space-y-6">
        {/* Notification Preferences */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <span className="p-1.5 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg">
              <Bell className="w-5 h-5 text-slate-600" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">Notification Preferences</h2>
          </div>

          <div className="space-y-3">
            <SettingToggle
              label="Email Notifications"
              description="Receive email alerts for important events"
              checked={settings.email_notifications}
              onChange={(checked) =>
                setSettings({ ...settings, email_notifications: checked })
              }
            />
            <SettingToggle
              label="Abuse Alerts"
              description="Get notified of suspicious activity"
              checked={settings.abuse_alerts}
              onChange={(checked) =>
                setSettings({ ...settings, abuse_alerts: checked })
              }
            />
            <SettingToggle
              label="Payment Alerts"
              description="Receive alerts for payment failures"
              checked={settings.payment_alerts}
              onChange={(checked) =>
                setSettings({ ...settings, payment_alerts: checked })
              }
            />
            <SettingToggle
              label="Daily Reports"
              description="Get daily summary reports"
              checked={settings.daily_reports}
              onChange={(checked) =>
                setSettings({ ...settings, daily_reports: checked })
              }
            />
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={() => { setSavedPrefs(true); setTimeout(() => setSavedPrefs(false), 2500); }}
              className="bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] text-white rounded-xl px-5 py-2.5 text-sm font-semibold shadow-lg shadow-orange-500/25 hover:-translate-y-0.5 hover:shadow-orange-500/40 transition-all duration-200"
            >
              Save Preferences
            </button>
            {savedPrefs && <span className="text-sm text-green-600 font-medium">Preferences saved!</span>}
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <span className="p-1.5 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg">
              <Shield className="w-5 h-5 text-slate-600" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">Security Settings</h2>
          </div>

          <div className="space-y-4">
            <SettingToggle
              label="Two-Factor Authentication"
              description="Require 2FA for admin login"
              checked={settings.two_factor_enabled}
              onChange={(checked) =>
                setSettings({ ...settings, two_factor_enabled: checked })
              }
            />

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-sm font-semibold text-slate-900 mb-3">IP Whitelist</p>
              <textarea
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] transition-all duration-200 bg-white text-slate-800 placeholder-slate-400"
                rows={4}
                placeholder="Enter IP addresses (one per line)"
                defaultValue={settings.ip_whitelist.join('\n')}
              />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={() => { setSavedSecurity(true); setTimeout(() => setSavedSecurity(false), 2500); }}
              className="bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] text-white rounded-xl px-5 py-2.5 text-sm font-semibold shadow-lg shadow-orange-500/25 hover:-translate-y-0.5 hover:shadow-orange-500/40 transition-all duration-200"
            >
              Save Security Settings
            </button>
            {savedSecurity && <span className="text-sm text-green-600 font-medium">Security settings saved!</span>}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="p-1.5 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg">
              <UserCog className="w-5 h-5 text-slate-600" />
            </span>
            <h3 className="font-bold text-slate-900">Admin Access</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Role:</span>
              <span className="font-semibold text-slate-900 capitalize">{user?.role?.replace('_', ' ') || 'Super Admin'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Last Login:</span>
              <span className="font-medium text-slate-900">2h ago</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Actions Today:</span>
              <span className="font-medium text-slate-900">24</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="p-1.5 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg">
              <Activity className="w-5 h-5 text-slate-600" />
            </span>
            <h3 className="font-bold text-slate-900">System Status</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">API Health:</span>
              <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700">
                Healthy
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Database:</span>
              <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700">
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Uptime:</span>
              <span className="font-semibold text-slate-900">99.9%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SETTING COMPONENTS
// ============================================================================

interface SettingToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function SettingToggle({
  label,
  description,
  checked,
  onChange
}: SettingToggleProps) {
  return (
    <div className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
      <div>
        <p className="font-medium text-slate-900 text-sm">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 rounded border-slate-300 text-[#FF8A2B] cursor-pointer accent-[#FF8A2B] mt-0.5 shrink-0"
      />
    </div>
  );
}
