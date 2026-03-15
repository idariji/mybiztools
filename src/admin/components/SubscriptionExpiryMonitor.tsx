/**
 * Subscription Expiry & Abuse Monitoring Panel
 * Real-time monitoring of subscriptions, expirations, and abuse signals
 */

import { useState } from 'react';
import { Calendar, AlertTriangle, Clock, TrendingDown, Eye } from 'lucide-react';

interface ExpiringSubscription {
  id: string;
  name: string;
  email: string;
  plan: string;
  expiresIn: number; // days
  status: 'expiring-soon' | 'expired' | 'downgraded';
}

interface AbuseSignal {
  id: string;
  userId: string;
  userName: string;
  email: string;
  signalType: 'free-account-spam' | 'quota-abuse' | 'deletion-loops' | 'ai-abuse' | 'payment-fraud';
  severity: 'low' | 'medium' | 'high';
  count: number;
  lastOccurrence: string;
  action: string;
}

interface SubscriptionExpiryMonitorProps {
  expiringSubscriptions?: ExpiringSubscription[];
  abuseSignals?: AbuseSignal[];
  onExtendSubscription?: (userId: string) => void;
  onReviewAccount?: (userId: string) => void;
  onFlagAccount?: (userId: string) => void;
}

export function SubscriptionExpiryMonitor({
  expiringSubscriptions = [],
  abuseSignals = [],
  onExtendSubscription,
  onReviewAccount,
  onFlagAccount
}: SubscriptionExpiryMonitorProps) {
  const [expandedSection, setExpandedSection] = useState<'expiry' | 'abuse' | null>('expiry');

  // Group expiring subscriptions by status
  const expiringThreeDays = expiringSubscriptions.filter((s) => s.expiresIn <= 3 && s.expiresIn > 0);
  const expiredToday = expiringSubscriptions.filter((s) => s.expiresIn <= 0);
  const recentlyDowngraded = expiringSubscriptions.filter((s) => s.status === 'downgraded');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-orange-100 text-orange-800 border-orange-300';
    }
  };

  const getSignalLabel = (type: string) => {
    switch (type) {
      case 'free-account-spam':
        return 'Multiple Free Accounts from Same IP';
      case 'quota-abuse':
        return 'Quota Limit Abuse (Repeated Hits)';
      case 'deletion-loops':
        return 'Repeated Deletion to Reset Usage';
      case 'ai-abuse':
        return 'Excessive AI Requests on Free Plan';
      case 'payment-fraud':
        return 'Payment Fraud Signal';
      default:
        return 'Abuse Signal';
    }
  };

  return (
    <div className="space-y-6">
      {/* Expiry Monitoring Section */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setExpandedSection(expandedSection === 'expiry' ? null : 'expiry')}
          className="w-full px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-b border-gray-200 flex items-center justify-between transition"
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Subscription Expiry Monitor</h2>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            (expiringThreeDays.length + expiredToday.length) > 0
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {expiringThreeDays.length + expiredToday.length} Active
          </span>
        </button>

        {expandedSection === 'expiry' && (
          <div className="p-6 space-y-6">
            {/* Expiring in 3 Days */}
            {expiringThreeDays.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  Expiring in 3 Days ({expiringThreeDays.length})
                </h3>
                <div className="space-y-2">
                  {expiringThreeDays.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{sub.name}</p>
                        <p className="text-sm text-gray-600">{sub.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {sub.plan} Plan • Expires in {sub.expiresIn} day(s)
                        </p>
                      </div>
                      <button
                        onClick={() => onExtendSubscription?.(sub.id)}
                        className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-medium transition"
                      >
                        Extend Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expired Today */}
            {expiredToday.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Expired Today ({expiredToday.length})
                </h3>
                <div className="space-y-2">
                  {expiredToday.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{sub.name}</p>
                        <p className="text-sm text-gray-600">{sub.email}</p>
                        <p className="text-xs text-red-600 mt-1">Account automatically downgraded to Free plan</p>
                      </div>
                      <button
                        onClick={() => onExtendSubscription?.(sub.id)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition"
                      >
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recently Downgraded */}
            {recentlyDowngraded.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-orange-600" />
                  Recently Downgraded ({recentlyDowngraded.length})
                </h3>
                <div className="space-y-2">
                  {recentlyDowngraded.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{sub.name}</p>
                        <p className="text-sm text-gray-600">{sub.email}</p>
                        <p className="text-xs text-gray-500 mt-1">Downgraded from {sub.plan} • Contact to re-engage</p>
                      </div>
                      <button
                        onClick={() => onExtendSubscription?.(sub.id)}
                        className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-medium transition"
                      >
                        Offer Promo
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {expiringThreeDays.length === 0 && expiredToday.length === 0 && recentlyDowngraded.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No subscriptions expiring in the next 3 days. All subscriptions are current.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Abuse Monitoring Section */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setExpandedSection(expandedSection === 'abuse' ? null : 'abuse')}
          className="w-full px-6 py-4 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border-b border-gray-200 flex items-center justify-between transition"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-bold text-gray-900">Abuse Detection & Warnings</h2>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            abuseSignals.length > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {abuseSignals.length} Signal{abuseSignals.length !== 1 ? 's' : ''}
          </span>
        </button>

        {expandedSection === 'abuse' && (
          <div className="p-6">
            {abuseSignals.length > 0 ? (
              <div className="space-y-3">
                {abuseSignals.map((signal) => (
                  <div
                    key={signal.id}
                    className={`p-4 rounded-lg border ${getSeverityColor(signal.severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{getSignalLabel(signal.signalType)}</h4>
                        <p className="text-sm mt-1">{signal.userName} ({signal.email})</p>
                        <p className="text-xs mt-2 opacity-75">
                          Detected {signal.count}x • Last: {signal.lastOccurrence}
                        </p>
                        <div className="mt-2 p-2 bg-black/10 rounded text-xs">
                          <strong>Recommended Action:</strong> {signal.action}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => onReviewAccount?.(signal.userId)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition whitespace-nowrap"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => onFlagAccount?.(signal.userId)}
                          className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs font-medium transition whitespace-nowrap"
                        >
                          Flag
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No abuse signals detected. System is operating normally.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm font-medium">Expiring Soon</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{expiringThreeDays.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm font-medium">Expired Today</p>
          <p className="text-2xl font-bold text-red-600 mt-2">{expiredToday.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm font-medium">Abuse Signals</p>
          <p className="text-2xl font-bold text-orange-600 mt-2">{abuseSignals.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm font-medium">Downgraded</p>
          <p className="text-2xl font-bold text-yellow-600 mt-2">{recentlyDowngraded.length}</p>
        </div>
      </div>
    </div>
  );
}
