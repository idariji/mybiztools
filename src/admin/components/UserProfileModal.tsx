/**
 * User Profile Modal - Detailed Billing Profile View
 * Shows subscription info, usage vs limits, payment history
 */

import { useState } from 'react';
import { X, AlertTriangle, TrendingUp, Calendar, CreditCard, Shield } from 'lucide-react';

interface UserFeatureUsage {
  feature: string;
  used: number;
  limit: number;
  resetDate?: string;
  isOverused?: boolean;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    email: string;
    plan: 'Free' | 'Pro' | 'Enterprise';
    status: 'Active' | 'Expired' | 'Cancelled' | 'Suspended';
    billingCycle: 'Monthly' | 'Annual';
    subscriptionStart: string;
    subscriptionEnd: string;
    lastPaymentDate: string;
    paymentMethod: string;
    autoRenew: boolean;
    totalSpent: number;
    signupDate: string;
  };
  onUpgrade?: (userId: string) => void;
  onDowngrade?: (userId: string) => void;
  onExtend?: (userId: string) => void;
  onSuspend?: (userId: string) => void;
}

export function UserProfileModal({
  isOpen,
  onClose,
  user,
  onUpgrade,
  onDowngrade,
  onExtend,
  onSuspend
}: UserProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'subscription' | 'usage' | 'payments' | 'warnings'>('subscription');
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('');

  // Plan limits — actual usage counters require a backend API call
  const getUsageData = (): UserFeatureUsage[] => {
    if (user.plan === 'Free') {
      return [
        { feature: 'Invoices', used: 0, limit: 5 },
        { feature: 'Receipts', used: 0, limit: 5 },
        { feature: 'Quotations', used: 0, limit: 5 },
        { feature: 'Team Members', used: 0, limit: 1 },
      ];
    } else if (user.plan === 'Pro') {
      return [
        { feature: 'Invoices', used: 0, limit: -1 },
        { feature: 'Receipts', used: 0, limit: -1 },
        { feature: 'Quotations', used: 0, limit: -1 },
        { feature: 'Team Members', used: 0, limit: 10 },
        { feature: 'API Calls (Monthly)', used: 0, limit: 100000 },
      ];
    } else {
      return [
        { feature: 'Invoices', used: 0, limit: -1 },
        { feature: 'Receipts', used: 0, limit: -1 },
        { feature: 'Quotations', used: 0, limit: -1 },
        { feature: 'Team Members', used: 0, limit: -1 },
        { feature: 'API Calls (Monthly)', used: 0, limit: -1 },
      ];
    }
  };

  // Mock warning signals
  const getWarnings = () => {
    const warnings = [];
    const today = new Date(user.subscriptionEnd);
    const daysUntilExpiry = Math.ceil((today.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 3 && daysUntilExpiry > 0) {
      warnings.push({
        level: 'warning',
        message: `Subscription expires in ${daysUntilExpiry} days. Consider extending or renewing.`,
      });
    }
    
    if (user.status === 'Suspended') {
      warnings.push({
        level: 'critical',
        message: 'Account is suspended. Resolve issues before reactivation.',
      });
    }

    // Simulate abuse detection
    if (user.plan === 'Free' && getUsageData().some(u => u.used >= (u.limit || 999))) {
      warnings.push({
        level: 'warning',
        message: 'Free account hitting limits repeatedly. Consider monitoring for abuse.',
      });
    }

    if (user.totalSpent === 0 && new Date().getTime() - new Date(user.signupDate).getTime() > 30 * 24 * 60 * 60 * 1000) {
      warnings.push({
        level: 'info',
        message: 'Churn risk: No payments in 30+ days.',
      });
    }

    return warnings;
  };

  const planColors = {
    Free: 'bg-gray-100 text-gray-800',
    Pro: 'bg-blue-100 text-blue-800',
    Enterprise: 'bg-purple-100 text-purple-800'
  };

  const statusColors = {
    Active: 'bg-green-100 text-green-800',
    Expired: 'bg-yellow-100 text-yellow-800',
    Cancelled: 'bg-red-100 text-red-800',
    Suspended: 'bg-red-100 text-red-800'
  };

  const warnings = getWarnings();
  const usageData = getUsageData();

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600 text-sm mt-1">{user.email}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Status Badges */}
          <div className="px-6 pt-6 flex gap-2 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${planColors[user.plan]}`}>
              {user.plan} Plan
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[user.status]}`}>
              {user.status}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              {user.billingCycle} Billing
            </span>
          </div>

          {/* Warnings Section */}
          {warnings.length > 0 && (
            <div className="px-6 pt-4 space-y-2">
              {warnings.map((warning, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    warning.level === 'critical'
                      ? 'bg-red-50 border border-red-200'
                      : warning.level === 'warning'
                      ? 'bg-yellow-50 border border-yellow-200'
                      : 'bg-blue-50 border border-blue-200'
                  }`}
                >
                  <AlertTriangle
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      warning.level === 'critical'
                        ? 'text-red-600'
                        : warning.level === 'warning'
                        ? 'text-yellow-600'
                        : 'text-blue-600'
                    }`}
                  />
                  <p
                    className={`text-sm ${
                      warning.level === 'critical'
                        ? 'text-red-800'
                        : warning.level === 'warning'
                        ? 'text-yellow-800'
                        : 'text-blue-800'
                    }`}
                  >
                    {warning.message}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200 px-6 mt-6">
            <div className="flex gap-8">
              {['subscription', 'usage', 'payments', 'warnings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Subscription Start</p>
                      <p className="font-medium text-gray-900">{user.subscriptionStart}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Subscription End</p>
                      <p className="font-medium text-gray-900">{user.subscriptionEnd}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-medium text-gray-900">{user.paymentMethod}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Auto-Renew</p>
                      <p className="font-medium text-gray-900">{user.autoRenew ? 'Enabled' : 'Disabled'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Total Spent</p>
                      <p className="font-medium text-gray-900">₦{user.totalSpent.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Last Payment</p>
                      <p className="font-medium text-gray-900">{user.lastPaymentDate}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t pt-6 space-y-3">
                  <h3 className="font-semibold text-gray-900">Admin Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setSelectedAction('upgrade');
                        setShowActionModal(true);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                    >
                      Upgrade Plan
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAction('downgrade');
                        setShowActionModal(true);
                      }}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm font-medium"
                    >
                      Downgrade Plan
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAction('extend');
                        setShowActionModal(true);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                    >
                      Extend Subscription
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAction('suspend');
                        setShowActionModal(true);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                    >
                      Suspend Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Usage Tab */}
            {activeTab === 'usage' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Usage vs Limits</h3>
                  <span className="text-xs text-gray-400">Live counters require API sync</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Feature</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900 text-sm">Used</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900 text-sm">Limit</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900 text-sm">Usage %</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900 text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usageData.map((item, idx) => {
                        const usagePercent = item.limit === -1 ? 0 : Math.round((item.used / item.limit) * 100);
                        const isOverLimit = item.limit !== -1 && item.used > item.limit;
                        const isWarning = item.limit !== -1 && usagePercent >= 80;

                        return (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-900 font-medium">{item.feature}</td>
                            <td className="py-3 px-4 text-sm text-right text-gray-600">{item.used.toLocaleString()}</td>
                            <td className="py-3 px-4 text-sm text-right text-gray-600">
                              {item.limit === -1 ? 'Unlimited' : item.limit.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-sm text-right">
                              {item.limit === -1 ? '—' : `${usagePercent}%`}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {isOverLimit ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                                  Over Limit
                                </span>
                              ) : isWarning ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                                  Warning
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                  OK
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Reset Button */}
                <button
                  onClick={() => {
                    setSelectedAction('reset-usage');
                    setShowActionModal(true);
                  }}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                >
                  Reset Usage Counters
                </button>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Payment History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Plan</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-gray-500 text-sm">
                          <CreditCard className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          No payment records found for this user.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Warnings Tab */}
            {activeTab === 'warnings' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Abuse & Risk Signals</h3>
                {warnings.length > 0 ? (
                  <div className="space-y-3">
                    {warnings.map((warning, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 p-4 rounded-lg border ${
                          warning.level === 'critical'
                            ? 'bg-red-50 border-red-200'
                            : warning.level === 'warning'
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <AlertTriangle
                          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            warning.level === 'critical'
                              ? 'text-red-600'
                              : warning.level === 'warning'
                              ? 'text-yellow-600'
                              : 'text-blue-600'
                          }`}
                        />
                        <p
                          className={`text-sm ${
                            warning.level === 'critical'
                              ? 'text-red-800'
                              : warning.level === 'warning'
                              ? 'text-yellow-800'
                              : 'text-blue-800'
                          }`}
                        >
                          {warning.message}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">No warnings or abuse signals detected.</p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Action Confirmation Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                Confirm {selectedAction === 'upgrade' ? 'Upgrade' : selectedAction === 'downgrade' ? 'Downgrade' : selectedAction === 'extend' ? 'Extension' : selectedAction === 'suspend' ? 'Suspension' : 'Reset Usage'}
              </h3>
              <p className="text-gray-600 text-sm mt-2">
                {selectedAction === 'upgrade' && `Upgrade ${user.name} from ${user.plan} to the next plan?`}
                {selectedAction === 'downgrade' && `Downgrade ${user.name} from ${user.plan} to the previous plan? This takes effect at cycle end.`}
                {selectedAction === 'extend' && `Extend ${user.name}'s subscription by 30 days?`}
                {selectedAction === 'suspend' && `Suspend ${user.name}'s account? They will lose access to all features.`}
                {selectedAction === 'reset-usage' && `Reset ${user.name}'s usage counters? This will clear all current usage metrics.`}
              </p>
            </div>
            <div className="p-6 space-y-3">
              <textarea
                placeholder="Reason for this action (required)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowActionModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowActionModal(false);
                  // Execute action
                  if (selectedAction === 'upgrade' && onUpgrade) onUpgrade(user.id);
                  if (selectedAction === 'downgrade' && onDowngrade) onDowngrade(user.id);
                  if (selectedAction === 'extend' && onExtend) onExtend(user.id);
                  if (selectedAction === 'suspend' && onSuspend) onSuspend(user.id);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
