import React, { useState, useEffect } from 'react';
import { User, Mail, Building, Calendar, Shield } from 'lucide-react';
import { authService } from '../services/authService';

export const AccountPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [docCounts, setDocCounts] = useState({ invoices: 0, quotations: 0, receipts: 0, payslips: 0 });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // Load document counts from localStorage
    const invoices = JSON.parse(localStorage.getItem('invoice-drafts') || '[]').length;
    const quotations = JSON.parse(localStorage.getItem('quotation-drafts') || '[]').length;
    const receipts = JSON.parse(localStorage.getItem('receipt-drafts') || '[]').length;
    const payslips = JSON.parse(localStorage.getItem('payslip-drafts') || '[]').length;
    setDocCounts({ invoices, quotations, receipts, payslips });
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Account</h1>
        <p className="text-gray-600 mt-1">View your account information</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name || 'User'}</h2>
            <p className="text-sm text-gray-600 mt-1">{user?.email || 'user@mybiztools.app'}</p>
            {user?.businessName && (
              <p className="text-sm text-gray-500 mt-2">{user.businessName}</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium text-gray-900">{user?.name || 'Not set'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Email Address</p>
                  <p className="font-medium text-gray-900">{user?.email || 'Not set'}</p>
                </div>
              </div>

              {user?.businessName && (
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Business Name</p>
                    <p className="font-medium text-gray-900">{user.businessName}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-medium text-gray-900">
                    {user?.loginTime ? new Date(user.loginTime).toLocaleDateString() : 'Today'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Account Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Account Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-blue-600">{docCounts.invoices + docCounts.quotations + docCounts.receipts + docCounts.payslips}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Invoices</p>
                <p className="text-2xl font-bold text-green-600">{docCounts.invoices}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Quotations</p>
                <p className="text-2xl font-bold text-orange-600">{docCounts.quotations}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Receipts & Payslips</p>
                <p className="text-2xl font-bold text-purple-600">{docCounts.receipts + docCounts.payslips}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
