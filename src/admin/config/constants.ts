/**
 * Admin System Configuration & Constants
 * Centralized configuration for admin operations
 */

import { PlanName, AdminRole, AbuseType, AbuseSeverity } from '../types/admin';

// ============================================================================
// PLAN CONFIGURATION
// ============================================================================

export const PLAN_FEATURES = {
  free: {
    invoices: 5,
    quotations: 5,
    receipts: 10,
    payslips: 2,
    business_cards: 1,
    storage_mb: 100,
    email_sharing: 1,
    api_requests: 0,
    budgets: 1,
    expenses: 20,
    social_posts: 5,
    team_members: 1,
    dedai_queries: 10
  },
  pro: {
    invoices: null, // unlimited
    quotations: null,
    receipts: null,
    payslips: null,
    business_cards: 5,
    storage_mb: 2048,
    email_sharing: null,
    api_requests: 100,
    budgets: 5,
    expenses: null,
    social_posts: 50,
    team_members: 1,
    dedai_queries: 500
  },
  enterprise: {
    invoices: null,
    quotations: null,
    receipts: null,
    payslips: null,
    business_cards: null,
    storage_mb: 102400, // 100 GB
    email_sharing: null,
    api_requests: 10000,
    budgets: null,
    expenses: null,
    social_posts: null,
    team_members: null,
    dedai_queries: null
  }
};

// ============================================================================
// PRICING CONFIGURATION
// ============================================================================

export const PLAN_PRICING = {
  free: {
    monthly: 0,
    yearly: 0,
    currency: 'USD'
  },
  pro: {
    monthly: 9.99,
    yearly: 99.99,
    currency: 'USD'
  },
  enterprise: {
    monthly: null, // Custom pricing
    yearly: null,
    currency: 'USD'
  }
};

// ============================================================================
// DETAILED ABUSE THRESHOLDS & DETECTION
// ============================================================================

export const ABUSE_THRESHOLDS = {
  // Quota abuse - when user hits limits repeatedly
  quotaAbuse: {
    threshold: 0.95, // 95% of limit
    timeWindowDays: 7,
    hitCountThreshold: 3, // Flag if hits limit 3+ times in window
    severity: 'medium' as const,
  },
  
  // Payment fraud detection
  paymentFraud: {
    failedPaymentThreshold: 3, // 3 failed payments
    timeWindowHours: 24,
    severityPerFailure: 'high' as const,
    flagImmediately: true,
  },

  // API abuse on free tier
  apiAbuse: {
    requestsPerHour: 1000,
    requestsPerDay: 10000,
    timeWindowMinutes: 60,
    severity: 'high' as const,
  },

  // Multiple free accounts from same IP/location
  freeAccountSpam: {
    accountsPerIP: 5,
    accountsPerLocation: 10,
    timeWindowDays: 7,
    severity: 'high' as const,
  },

  // AI request abuse on free plan
  aiAbuse: {
    queriesPerDay: 50,
    queriesPerMonth: 1000,
    severity: 'medium' as const,
  },

  // Deletion loops - resetting usage by deleting documents
  deletionLoops: {
    deletionCountThreshold: 5,
    timeWindowDays: 7,
    severity: 'high' as const,
  },

  // Churn risk signals
  churnRisk: {
    noDaysBeforeChurnFlag: 30,
    paymentFailureBeforeChurn: 2,
    severity: 'warning' as const,
  },

  // Suspicious activity patterns
  suspiciousActivity: {
    geoLocationChangeThreshold: 3, // flag if location changes 3+ times in 24h
    deviceChangeThreshold: 5,
    ipChangeThreshold: 10,
    timeWindowHours: 24,
    severity: 'medium' as const,
  },
};

// ============================================================================
// ROLE CONFIGURATION
// ============================================================================

export const ROLE_CONFIG: Record<AdminRole, {
  label: string;
  description: string;
  level: number;
  color: string;
}> = {
  super_admin: {
    label: 'Super Admin',
    description: 'Full platform access and permissions',
    level: 4,
    color: 'bg-red-100 text-red-800'
  },
  billing_admin: {
    label: 'Billing Admin',
    description: 'Manage subscriptions, payments, and billing',
    level: 3,
    color: 'bg-blue-100 text-blue-800'
  },
  support_admin: {
    label: 'Support Admin',
    description: 'Limited user management and support',
    level: 2,
    color: 'bg-green-100 text-green-800'
  },
  viewer: {
    label: 'Viewer',
    description: 'Read-only access to dashboard',
    level: 1,
    color: 'bg-gray-100 text-gray-800'
  }
};

// ============================================================================
// ABUSE DETECTION THRESHOLDS
// ============================================================================
// (Already defined above - removed duplicate)

// ============================================================================
// ABUSE TYPE CONFIGURATION
// ============================================================================

export const ABUSE_TYPE_CONFIG: Record<AbuseType, {
  label: string;
  description: string;
  icon: string;
  defaultSeverity: AbuseSeverity;
}> = {
  quota_abuse: {
    label: 'Quota Abuse',
    description: 'User exceeding monthly usage limits',
    icon: '📊',
    defaultSeverity: 'medium'
  },
  payment_fraud: {
    label: 'Payment Fraud',
    description: 'Suspicious payment patterns detected',
    icon: '💳',
    defaultSeverity: 'critical'
  },
  api_abuse: {
    label: 'API Abuse',
    description: 'Excessive API requests detected',
    icon: '⚡',
    defaultSeverity: 'high'
  },
  terms_violation: {
    label: 'Terms Violation',
    description: 'User violating terms of service',
    icon: '⚖️',
    defaultSeverity: 'high'
  },
  suspicious_activity: {
    label: 'Suspicious Activity',
    description: 'Unusual account activity detected',
    icon: '🔍',
    defaultSeverity: 'medium'
  }
};

// ============================================================================
// SEVERITY LEVELS
// ============================================================================

export const SEVERITY_CONFIG: Record<AbuseSeverity, {
  label: string;
  color: string;
  bgColor: string;
  action: string;
  autoSuspend: boolean;
}> = {
  low: {
    label: 'Low',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    action: 'Monitor',
    autoSuspend: false
  },
  medium: {
    label: 'Medium',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    action: 'Investigate',
    autoSuspend: false
  },
  high: {
    label: 'High',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    action: 'Review Soon',
    autoSuspend: false
  },
  critical: {
    label: 'Critical',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    action: 'Immediate Action',
    autoSuspend: true
  }
};

// ============================================================================
// ACTION RETENTION PERIODS
// ============================================================================

export const RETENTION_PERIODS = {
  AUDIT_LOGS_YEARS: 7,
  PAYMENT_RECORDS_YEARS: 7,
  ABUSE_REPORTS_YEARS: 5,
  USER_ACTIVITY_MONTHS: 12,
  TEMPORARY_OVERRIDES_MAX_MONTHS: 12
};

// ============================================================================
// RATE LIMITS & CONSTRAINTS
// ============================================================================

export const RATE_LIMITS = {
  MAX_DAILY_REFUNDS: 50000, // $50,000 per day
  MAX_SINGLE_REFUND: 10000, // $10,000 per refund
  MAX_PLAN_CHANGES_PER_DAY: 100,
  MAX_QUOTA_RESETS_PER_DAY: 50,
  MAX_SUSPENDED_USERS_DAILY: 100,
  API_RATE_LIMIT_ADMIN: 1000 // requests per minute
};

// ============================================================================
// NOTIFICATION TEMPLATES
// ============================================================================

export const NOTIFICATION_TEMPLATES = {
  PLAN_UPGRADED: {
    subject: 'Your plan has been upgraded',
    template: 'plan_upgraded'
  },
  PLAN_DOWNGRADED: {
    subject: 'Your plan has been downgraded',
    template: 'plan_downgraded'
  },
  ACCOUNT_SUSPENDED: {
    subject: 'Your account has been suspended',
    template: 'account_suspended'
  },
  REFUND_PROCESSED: {
    subject: 'Refund processed',
    template: 'refund_processed'
  },
  QUOTA_WARNING: {
    subject: 'You are approaching your usage limit',
    template: 'quota_warning'
  },
  ABUSE_INVESTIGATION: {
    subject: 'We are investigating unusual activity',
    template: 'abuse_investigation'
  }
};

// ============================================================================
// DASHBOARD DEFAULTS
// ============================================================================

export const DASHBOARD_DEFAULTS = {
  ITEMS_PER_PAGE: 20,
  MAX_ITEMS_PER_PAGE: 100,
  DATE_RANGE_DEFAULT_DAYS: 30,
  REFRESH_INTERVAL_SECONDS: 60,
  CHART_UPDATE_INTERVAL_SECONDS: 300
};

// ============================================================================
// EXPORT CONFIGURATION
// ============================================================================

export const EXPORT_CONFIG = {
  MAX_EXPORT_ROWS: 10000,
  SUPPORTED_FORMATS: ['csv', 'json', 'pdf'],
  DEFAULT_FORMAT: 'csv',
  COMPRESSION: true
};

// ============================================================================
// EMAIL CONFIGURATION
// ============================================================================

export const EMAIL_CONFIG = {
  FROM_EMAIL: 'admin@biztool.com',
  FROM_NAME: 'MyBizTools Admin',
  SUPPORT_EMAIL: 'support@biztool.com',
  BILLING_EMAIL: 'billing@biztool.com',
  REPLY_TO: 'support@biztool.com'
};

// ============================================================================
// COMPLIANCE & POLICY
// ============================================================================

export const COMPLIANCE_CONFIG = {
  MFA_REQUIRED_FOR_SUPER_ADMIN: true,
  IP_WHITELIST_ENABLED: false,
  SESSION_TIMEOUT_MINUTES: 30,
  PASSWORD_EXPIRY_DAYS: 90,
  REQUIRE_APPROVAL_FOR_REFUNDS_OVER: 1000,
  REQUIRE_APPROVAL_FOR_DELETIONS: true,
  LOG_SENSITIVE_DATA: false, // GDPR compliance
  PII_MASKING_ENABLED: true
};

// ============================================================================
// FEATURE MONITORING & WARNINGS
// ============================================================================

export const FEATURE_MONITORING = {
  // Warn when user approaches limits
  usageWarningThreshold: 0.8, // 80% of limit triggers warning
  usageCriticalThreshold: 0.95, // 95% triggers critical alert
  
  // Daily quota reset time (UTC)
  dailyQuotaResetHour: 0,
  
  // Monthly quota reset time
  monthlyQuotaResetDay: 1,
  monthlyQuotaResetHour: 0,
  
  // Yearly quota reset time
  yearlyQuotaResetDay: 1,
  yearlyQuotaResetMonth: 0, // January
  yearlyQuotaResetHour: 0,
};

// ============================================================================
// SUBSCRIPTION EXPIRY MONITORING
// ============================================================================

export const EXPIRY_MONITORING = {
  // Days before expiry to start warning
  warningDays: 14,
  criticalDays: 3,
  
  // Auto downgrade settings
  autoDowngradeToFreeOnExpiry: true,
  autoDowngradeNotificationDays: [14, 7, 3, 1],
  
  // Grace period after expiry
  gracePeriodDays: 0, // 0 = immediate downgrade
  
  // Renewal reminders
  sendRenewalReminder: true,
  renewalReminderDays: [7, 3, 1],
};

// ============================================================================
// ADMIN ACTION IMPACT WARNINGS
// ============================================================================

export const ACTION_WARNINGS = {
  // Downgrade warnings
  downgradeWarnings: {
    'pro-to-free': [
      'User will lose team member access (Pro supports multiple team members)',
      'API requests will be disabled',
      'Advanced features will be locked',
      'User will be notified automatically'
    ],
    'enterprise-to-pro': [
      'Custom domain access will be removed',
      'Priority support will be downgraded',
      'Advanced analytics will be disabled'
    ],
    'enterprise-to-free': [
      'All paid features will be disabled',
      'User data will be preserved but access restricted',
      'This is a major downgrade - consider offering discount instead'
    ]
  },

  // Suspension warnings
  suspensionWarnings: [
    'User will lose access to all features immediately',
    'Scheduled exports will be cancelled',
    'API tokens will be invalidated',
    'Data will remain but inaccessible',
    'Consider sending notification with reason'
  ],

  // Deletion warnings
  deletionWarnings: [
    'This action is PERMANENT and cannot be undone',
    'All user data will be deleted',
    'Audit logs for this user will be retained for compliance',
    'Customer will not be automatically notified'
  ]
};

// ============================================================================
// ENTITLEMENT ENFORCEMENT RULES
// ============================================================================

export const ENTITLEMENT_RULES = {
  // Free plan restrictions
  free: {
    canCreateTeam: false,
    canUploadCustomLogo: false,
    canExportAPI: false,
    canUseDedaiAdvanced: false,
    maxConcurrentUsers: 1,
    canAccessAnalytics: false,
    supportLevel: 'community'
  },

  // Pro plan features
  pro: {
    canCreateTeam: true,
    canUploadCustomLogo: true,
    canExportAPI: true,
    canUseDedaiAdvanced: true,
    maxConcurrentUsers: 5,
    canAccessAnalytics: true,
    supportLevel: 'priority'
  },

  // Enterprise plan features
  enterprise: {
    canCreateTeam: true,
    canUploadCustomLogo: true,
    canExportAPI: true,
    canUseDedaiAdvanced: true,
    maxConcurrentUsers: null, // Unlimited
    canAccessAnalytics: true,
    supportLevel: '24/7-dedicated'
  }
};

// ============================================================================
// PROMO & OVERRIDE RULES
// ============================================================================

export const PROMO_RULES = {
  // Auto-expiry of overrides
  autoExpireOverrides: true,
  
  // Maximum concurrent overrides per user
  maxOverridesPerUser: 3,
  
  // Stacking rules
  allowStackingDiscounts: false,
  allowStackingPlans: false,
  
  // Audit requirements
  requireReasonForOverride: true,
  requireApprovalForOver100: true,
};

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const API_ENDPOINTS = {
  SUBSCRIPTIONS: '/api/admin/subscriptions',
  PAYMENTS: '/api/admin/payments',
  USERS: '/api/admin/users',
  ABUSE_REPORTS: '/api/admin/abuse-reports',
  AUDIT_LOGS: '/api/admin/audit-logs',
  ANALYTICS: '/api/admin/analytics',
  SETTINGS: '/api/admin/settings'
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get plan feature limit
 */
export function getPlanFeatureLimit(plan: PlanName, feature: keyof typeof PLAN_FEATURES.free): number | null {
  return PLAN_FEATURES[plan][feature] as number | null;
}

/**
 * Check if plan is higher tier
 */
export function isPlanUpgrade(fromPlan: PlanName, toPlan: PlanName): boolean {
  const hierarchy: Record<PlanName, number> = {
    free: 0,
    pro: 1,
    enterprise: 2
  };
  return hierarchy[toPlan] > hierarchy[fromPlan];
}

/**
 * Get next plan tier
 */
export function getNextPlanTier(currentPlan: PlanName): PlanName | null {
  const next: Record<PlanName, PlanName | null> = {
    free: 'pro',
    pro: 'enterprise',
    enterprise: null
  };
  return next[currentPlan];
}

/**
 * Get previous plan tier
 */
export function getPreviousPlanTier(currentPlan: PlanName): PlanName | null {
  const prev: Record<PlanName, PlanName | null> = {
    free: null,
    pro: 'free',
    enterprise: 'pro'
  };
  return prev[currentPlan];
}

/**
 * Calculate refund amount
 */
export function calculateRefundAmount(
  originalAmount: number,
  daysUsed: number,
  totalDaysInCycle: number
): number {
  const dailyRate = originalAmount / totalDaysInCycle;
  const refundAmount = dailyRate * (totalDaysInCycle - daysUsed);
  return Math.round(refundAmount * 100) / 100; // Round to 2 decimals
}

/**
 * Format plan name with pricing
 */
export function formatPlanWithPrice(plan: PlanName, cycle: 'monthly' | 'yearly' = 'monthly'): string {
  const pricing = PLAN_PRICING[plan];
  const amount = cycle === 'monthly' ? pricing.monthly : pricing.yearly;

  if (amount === null) {
    return `${plan.charAt(0).toUpperCase() + plan.slice(1)} (Custom Pricing)`;
  }

  if (amount === 0) {
    return `${plan.charAt(0).toUpperCase() + plan.slice(1)} (Free)`;
  }

  return `${plan.charAt(0).toUpperCase() + plan.slice(1)} - $${amount}/${cycle === 'monthly' ? 'mo' : 'yr'}`;
}
