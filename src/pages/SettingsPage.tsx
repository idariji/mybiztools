import React, { useState } from 'react';
import { Save, Lock, Bell, Globe, Palette, Database, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '../utils/useToast';

export const SettingsPage: React.FC = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    language: 'en',
    currency: 'NGN',
    theme: 'light',
    autoSave: true,
    twoFactor: false
  });

  const handleToggle = (key: string) => {
    setSettings({ ...settings, [key]: !settings[key as keyof typeof settings] });
  };

  const handleChange = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = () => {
    localStorage.setItem('settings', JSON.stringify(settings));
    addToast('Settings saved successfully!', 'success');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your application preferences</p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-100 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="p-1.5 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg">
              <Bell className="w-5 h-5 text-slate-600" />
            </span>
            Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive email updates about your account</p>
              </div>
              <button
                onClick={() => handleToggle('emailNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                  settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-600">Receive push notifications in your browser</p>
              </div>
              <button
                onClick={() => handleToggle('pushNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                  settings.pushNotifications ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Marketing Emails</p>
                <p className="text-sm text-gray-600">Receive updates about new features and offers</p>
              </div>
              <button
                onClick={() => handleToggle('marketingEmails')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                  settings.marketingEmails ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    settings.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-100 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="p-1.5 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg">
              <Globe className="w-5 h-5 text-slate-600" />
            </span>
            Preferences
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                value={settings.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="sw">Swahili</option>
                <option value="ha">Hausa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="NGN">Nigerian Naira (₦)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="GHS">Ghanaian Cedi (₵)</option>
                <option value="KES">Kenyan Shilling (KSh)</option>
                <option value="ZAR">South African Rand (R)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-100 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="p-1.5 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg">
              <Palette className="w-5 h-5 text-slate-600" />
            </span>
            Appearance
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => handleChange('theme', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="light">Light</option>
              <option value="dark" disabled>Dark (Coming Soon)</option>
              <option value="auto" disabled>Auto (Coming Soon)</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-100 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="p-1.5 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg">
              <Database className="w-5 h-5 text-slate-600" />
            </span>
            Data & Storage
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Auto-save Documents</p>
                <p className="text-sm text-gray-600">Automatically save drafts as you work</p>
              </div>
              <button
                onClick={() => handleToggle('autoSave')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                  settings.autoSave ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    settings.autoSave ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={() => {
                  if (window.confirm('This will delete all locally saved documents and settings. Are you sure?')) {
                    const keysToRemove = ['invoice-drafts', 'quotation-drafts', 'receipt-drafts', 'payslip-drafts', 'budget-entries', 'settings', 'current-invoice', 'current-quotation', 'current-receipt', 'current-payslip'];
                    keysToRemove.forEach(k => localStorage.removeItem(k));
                    addToast('All local data cleared successfully.', 'success');
                  }
                }}
                className="flex items-center gap-2 text-red-600 hover:text-white hover:bg-red-500 font-medium px-4 py-2 rounded-lg border border-red-200 hover:border-red-500 transition-all duration-200"
              >
                Clear All Local Data
              </button>
              <p className="text-sm text-gray-600 mt-1">Remove all saved documents and settings</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-100 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="p-1.5 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg">
              <Shield className="w-5 h-5 text-slate-600" />
            </span>
            Security
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Add an extra layer of security (Coming Soon)</p>
              </div>
              <button
                disabled
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 opacity-50 cursor-not-allowed"
              >
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
              </button>
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={() => navigate('/forgot-password')}
                className="flex items-center gap-2 text-blue-600 hover:text-white hover:bg-blue-600 font-medium px-4 py-2 rounded-lg border border-blue-200 hover:border-blue-600 transition-all duration-200"
              >
                <Lock size={18} />
                Change Password
              </button>
              <p className="text-sm text-gray-600 mt-1">Update your password regularly for security</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 font-medium transition-all duration-200"
        >
          <Save size={20} />
          Save All Settings
        </button>
      </div>
    </motion.div>
  );
};
