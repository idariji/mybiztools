/**
 * Admin Warnings System
 * Displays intelligent alerts based on user behavior and risk signals
 */

import { AlertTriangle, Zap, Eye, Shield } from 'lucide-react';

export interface AdminWarning {
  id: string;
  userId: string;
  userName: string;
  email: string;
  severity: 'info' | 'warning' | 'critical';
  type: 'expiry' | 'abuse' | 'churn' | 'fraud' | 'overuse' | 'suspicious';
  message: string;
  action?: string;
  timestamp: string;
  dismissed: boolean;
}

interface AdminWarningsProps {
  warnings: AdminWarning[];
  onDismiss?: (warningId: string) => void;
  onAction?: (warningId: string, action: string) => void;
}

export function AdminWarnings({ warnings, onDismiss, onAction }: AdminWarningsProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5" />;
      case 'warning':
        return <Zap className="w-5 h-5" />;
      default:
        return <Eye className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'expiry':
        return 'Subscription Expiry';
      case 'abuse':
        return 'Abuse Signal';
      case 'churn':
        return 'Churn Risk';
      case 'fraud':
        return 'Fraud Alert';
      case 'overuse':
        return 'Limit Exceeded';
      case 'suspicious':
        return 'Suspicious Activity';
      default:
        return 'Alert';
    }
  };

  const getActionColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  const activeWarnings = warnings.filter((w) => !w.dismissed);

  if (activeWarnings.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-center text-gray-500">
          <Shield className="w-5 h-5 mr-2" />
          <p className="text-sm">No active warnings. System is operating normally.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activeWarnings.map((warning) => (
        <div
          key={warning.id}
          className={`flex items-start justify-between gap-4 p-4 rounded-lg border ${getSeverityColor(
            warning.severity
          )}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getSeverityIcon(warning.severity)}
            </div>
            <div>
              <h4 className="font-semibold text-sm">
                {getTypeLabel(warning.type)} - {warning.userName}
              </h4>
              <p className="text-sm mt-1 opacity-90">{warning.message}</p>
              <p className="text-xs mt-2 opacity-75">{warning.email} • {warning.timestamp}</p>
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            {warning.action && (
              <button
                onClick={() => onAction?.(warning.id, warning.action!)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition ${getActionColor(
                  warning.severity
                )}`}
              >
                Take Action
              </button>
            )}
            <button
              onClick={() => onDismiss?.(warning.id)}
              className="px-3 py-1.5 rounded text-xs font-medium bg-gray-300 hover:bg-gray-400 text-gray-800 transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Smart warning generator utility
 */
export class AdminWarningGenerator {
  static generateWarnings(users: any[]): AdminWarning[] {
    const warnings: AdminWarning[] = [];
    const now = new Date();

    users.forEach((user) => {
      // Expiry warnings
      const expiryDate = new Date(user.subscriptionEnd);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry > 0 && daysUntilExpiry <= 3) {
        warnings.push({
          id: `expiry-${user.id}`,
          userId: user.id,
          userName: user.name,
          email: user.email,
          severity: daysUntilExpiry <= 1 ? 'critical' : 'warning',
          type: 'expiry',
          message: `${user.name}'s ${user.plan} subscription expires in ${daysUntilExpiry} day(s). Consider contacting them to renew.`,
          action: 'extend-subscription',
          timestamp: new Date().toISOString(),
          dismissed: false,
        });
      }

      // Churn risk warnings
      if (user.totalSpent === 0 && new Date(user.signupDate) < new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)) {
        warnings.push({
          id: `churn-${user.id}`,
          userId: user.id,
          userName: user.name,
          email: user.email,
          severity: 'warning',
          type: 'churn',
          message: `${user.name} signed up 30+ days ago but hasn't made any payments. High churn risk.`,
          action: 'contact-user',
          timestamp: new Date().toISOString(),
          dismissed: false,
        });
      }

      // Abuse warnings: only flag when documentCount is provided by the API
      if (user.plan === 'Free' && user.documentCount != null && user.documentCount >= 5) {
        warnings.push({
          id: `abuse-${user.id}`,
          userId: user.id,
          userName: user.name,
          email: user.email,
          severity: 'warning',
          type: 'abuse',
          message: `${user.name} has reached the free plan document limit (${user.documentCount}/5). Consider prompting them to upgrade.`,
          action: 'flag-account',
          timestamp: new Date().toISOString(),
          dismissed: false,
        });
      }

      // Suspicious activity warnings
      if (user.status === 'Suspended') {
        warnings.push({
          id: `suspicious-${user.id}`,
          userId: user.id,
          userName: user.name,
          email: user.email,
          severity: 'critical',
          type: 'suspicious',
          message: `${user.name}'s account is SUSPENDED. Review abuse detection logs and contact before reactivation.`,
          action: 'review-account',
          timestamp: new Date().toISOString(),
          dismissed: false,
        });
      }
    });

    return warnings;
  }

  static getWarningStats(warnings: AdminWarning[]) {
    return {
      total: warnings.filter((w) => !w.dismissed).length,
      critical: warnings.filter((w) => !w.dismissed && w.severity === 'critical').length,
      warnings: warnings.filter((w) => !w.dismissed && w.severity === 'warning').length,
      info: warnings.filter((w) => !w.dismissed && w.severity === 'info').length,
    };
  }
}
