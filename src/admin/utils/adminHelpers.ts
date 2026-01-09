/**
 * Admin Dashboard Utilities
 * Helper functions for admin operations
 */

import { PlanName, SubscriptionStatus, AdminUser } from '../types/admin';

// ============================================================================
// FORMAT UTILITIES
// ============================================================================

export const AdminFormatters = {
  /**
   * Format plan name to display string
   */
  formatPlanName(plan: PlanName): string {
    const map: Record<PlanName, string> = {
      free: 'Free',
      pro: 'Pro',
      enterprise: 'Enterprise'
    };
    return map[plan] || plan;
  },

  /**
   * Format subscription status
   */
  formatStatus(status: SubscriptionStatus): string {
    const map: Record<SubscriptionStatus, string> = {
      active: 'Active',
      past_due: 'Past Due',
      cancelled: 'Cancelled',
      suspended: 'Suspended'
    };
    return map[status] || status;
  },

  /**
   * Format currency (Naira)
   */
  formatCurrency(amount: number, currency: string = 'NGN'): string {
    if (currency === 'NGN' || currency === 'naira') {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2
      }).format(amount);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  },

  /**
   * Format date time
   */
  formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  },

  /**
   * Format date only
   */
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  },

  /**
   * Format relative time
   */
  formatTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);

    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
  }
};

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export const AdminValidators = {
  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  /**
   * Validate phone format
   */
  isValidPhone(phone: string): boolean {
    return /^\+?[0-9]{10,}$/.test(phone.replace(/[\s-]/g, ''));
  },

  /**
   * Validate amount
   */
  isValidAmount(amount: number): boolean {
    return amount > 0 && !isNaN(amount);
  },

  /**
   * Validate refund amount
   */
  isValidRefundAmount(
    originalAmount: number,
    refundAmount: number
  ): boolean {
    return (
      refundAmount > 0 &&
      refundAmount <= originalAmount &&
      !isNaN(refundAmount)
    );
  }
};

// ============================================================================
// PERMISSION UTILITIES
// ============================================================================

export const AdminPermissionHelpers = {
  /**
   * Check if admin can perform action on resource
   */
  canPerformAction(admin: AdminUser, action: string, resource: string): boolean {
    // In production, check against RBAC system
    return true;
  },

  /**
   * Check if admin can view sensitive data
   */
  canViewSensitiveData(admin: AdminUser): boolean {
    return ['super_admin', 'billing_admin'].includes(admin.role);
  },

  /**
   * Get readable permission name
   */
  getPermissionName(action: string): string {
    const map: Record<string, string> = {
      view: 'View',
      edit: 'Edit',
      delete: 'Delete',
      override: 'Override',
      suspend: 'Suspend',
      refund: 'Refund'
    };
    return map[action] || action;
  }
};

// ============================================================================
// DATA PROCESSING UTILITIES
// ============================================================================

export const AdminDataProcessors = {
  /**
   * Calculate percentage change
   */
  calculatePercentageChange(previous: number, current: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  },

  /**
   * Calculate average
   */
  calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  },

  /**
   * Calculate median
   */
  calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  },

  /**
   * Group by key
   */
  groupBy<T>(items: T[], key: keyof T): Record<string, T[]> {
    return items.reduce(
      (acc, item) => {
        const groupKey = String(item[key]);
        if (!acc[groupKey]) {
          acc[groupKey] = [];
        }
        acc[groupKey].push(item);
        return acc;
      },
      {} as Record<string, T[]>
    );
  },

  /**
   * Sort by key
   */
  sortBy<T>(items: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    return [...items].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }
};

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

export const AdminExporters = {
  /**
   * Export data as CSV
   */
  exportAsCSV<T>(
    data: T[],
    filename: string,
    headers?: (keyof T)[]
  ): void {
    if (data.length === 0) return;

    const cols = headers || (Object.keys(data[0]) as (keyof T)[]);
    const csv = [
      cols.join(','),
      ...data.map((row) =>
        cols
          .map((col) => {
            const value = row[col];
            const stringValue = String(value);
            return stringValue.includes(',')
              ? `"${stringValue}"`
              : stringValue;
          })
          .join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Export data as JSON
   */
  exportAsJSON<T>(data: T[], filename: string): void {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
};

// ============================================================================
// NOTIFICATION UTILITIES
// ============================================================================

export const AdminNotifications = {
  /**
   * Show success notification
   */
  showSuccess(message: string): void {
    console.log('✓ Success:', message);
    // In production, use toast notification library
  },

  /**
   * Show error notification
   */
  showError(message: string): void {
    console.error('✗ Error:', message);
    // In production, use toast notification library
  },

  /**
   * Show warning notification
   */
  showWarning(message: string): void {
    console.warn('⚠ Warning:', message);
    // In production, use toast notification library
  },

  /**
   * Show info notification
   */
  showInfo(message: string): void {
    console.info('ℹ Info:', message);
    // In production, use toast notification library
  }
};
