/**
 * Main Admin Dashboard Page
 * Entry point for all admin operations
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  UserCog
} from 'lucide-react';
import { authService } from '../../services/authService';
import { DashboardOverview } from '../components/DashboardOverview';
import { UserBillingManager } from '../components/UserBillingManager';
import { UserManagement } from '../components/UserManagement';
import { AbuseDetectionDashboard } from '../components/AbuseDetectionDashboard';
import { PaymentHistoryViewer } from '../components/PaymentHistoryViewer';
import { CustomerSupport } from '../components/CustomerSupport';

type AdminTab = 'overview' | 'users' | 'user-management' | 'payments' | 'support' | 'abuse' | 'settings';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    setIsLoading(false);
  }, [navigate]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const navItems: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'user-management', label: 'All Users', icon: Users },
    { id: 'users', label: 'User Billing', icon: UserCog },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'support', label: 'Customer Support', icon: HeadphonesIcon },
    { id: 'abuse', label: 'Abuse Detection', icon: AlertTriangle },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          activeTab={activeTab}
        />

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Page Title */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {navItems.find((item) => item.id === activeTab)?.label}
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your platform's billing, subscriptions, and compliance
              </p>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && <DashboardOverview />}
            {activeTab === 'user-management' && <UserManagement />}
            {activeTab === 'users' && <UserBillingManager />}
            {activeTab === 'payments' && <PaymentHistoryViewer />}
            {activeTab === 'support' && <CustomerSupport />}
            {activeTab === 'abuse' && <AbuseDetectionDashboard />}
            {activeTab === 'settings' && <AdminSettingsPanel />}
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
}

function AdminSidebar({
  isOpen,
  onClose,
  navItems,
  activeTab,
  onTabChange
}: AdminSidebarProps) {
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
        } fixed md:relative w-64 h-screen bg-gray-900 text-white overflow-y-auto transition-transform z-50 md:z-0`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold">MyBizTools</h1>
          <p className="text-xs text-gray-400 mt-1">Admin Dashboard</p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                // Only close sidebar on mobile
                if (window.innerWidth < 768) {
                  onClose();
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
            <LogOut className="w-5 h-5" />
            Sign Out
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
}

function AdminHeader({ onMenuClick, activeTab }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-4">
          {/* User Info */}
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">super_admin</p>
          </div>

          {/* Avatar */}
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            A
          </div>
        </div>
      </div>
    </header>
  );
}

// ============================================================================
// SETTINGS PANEL
// ============================================================================

function AdminSettingsPanel() {
  const [settings, setSettings] = useState({
    email_notifications: true,
    abuse_alerts: true,
    payment_alerts: true,
    daily_reports: true,
    two_factor_enabled: false,
    ip_whitelist: []
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Admin Settings */}
      <div className="lg:col-span-2 space-y-6">
        {/* Notification Preferences */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Notification Preferences
          </h2>

          <div className="space-y-4">
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
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Security Settings
          </h2>

          <div className="space-y-4">
            <SettingToggle
              label="Two-Factor Authentication"
              description="Require 2FA for admin login"
              checked={settings.two_factor_enabled}
              onChange={(checked) =>
                setSettings({ ...settings, two_factor_enabled: checked })
              }
            />

            <div className="p-4 bg-gray-50 rounded border border-gray-200">
              <p className="text-sm font-medium text-gray-900 mb-3">
                IP Whitelist
              </p>
              <textarea
                className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Enter IP addresses (one per line)"
                defaultValue={settings.ip_whitelist.join('\n')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Admin Access</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Role:</span>
              <span className="font-medium text-gray-900">Super Admin</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Login:</span>
              <span className="font-medium text-gray-900">2h ago</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Actions Today:</span>
              <span className="font-medium text-gray-900">24</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Health:</span>
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                Healthy
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database:</span>
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Uptime:</span>
              <span className="font-medium text-gray-900">99.9%</span>
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
    <div className="flex items-start justify-between p-4 bg-gray-50 rounded border border-gray-200">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-600 mt-1">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 rounded border-gray-300 text-blue-600 cursor-pointer"
      />
    </div>
  );
}
