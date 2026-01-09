/**
 * Usage Tracking Service
 * Monitors feature usage against plan limits and detects abuse
 */

export interface FeatureUsage {
  feature: string;
  used: number;
  limit: number | null; // null = unlimited
  resetDate?: string;
  isOverused: boolean;
  usagePercent: number;
  status: 'ok' | 'warning' | 'critical' | 'over-limit';
}

export interface UserUsageMetrics {
  userId: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
  trackingPeriod: 'daily' | 'monthly' | 'yearly';
  lastResetDate: string;
  nextResetDate: string;
  features: FeatureUsage[];
  totalWarnings: number;
  totalCritical: number;
  isOverUsing: boolean;
}

export class UsageTrackingService {
  /**
   * Get user's current usage metrics
   */
  static getUserUsage(userId: string, plan: 'Free' | 'Pro' | 'Enterprise'): UserUsageMetrics {
    // Mock implementation - in production, fetch from database
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const features = this.getMockFeatureUsage(plan);
    const warnings = features.filter((f) => f.status === 'warning').length;
    const critical = features.filter((f) => f.status === 'critical').length;

    return {
      userId,
      plan,
      trackingPeriod: 'monthly',
      lastResetDate: monthStart.toISOString().split('T')[0],
      nextResetDate: monthEnd.toISOString().split('T')[0],
      features,
      totalWarnings: warnings,
      totalCritical: critical,
      isOverUsing: features.some((f) => f.status === 'over-limit' || f.status === 'critical'),
    };
  }

  /**
   * Check if user can perform action based on usage limits
   */
  static canPerformAction(
    userId: string,
    plan: 'Free' | 'Pro' | 'Enterprise',
    feature: string,
    quantity: number = 1
  ): { allowed: boolean; reason?: string } {
    const usage = this.getUserUsage(userId, plan);
    const featureUsage = usage.features.find((f) => f.feature === feature);

    if (!featureUsage) {
      return { allowed: true }; // Feature not tracked
    }

    if (featureUsage.limit === null) {
      return { allowed: true }; // Unlimited
    }

    const newUsage = featureUsage.used + quantity;

    if (newUsage > featureUsage.limit) {
      return {
        allowed: false,
        reason: `Limit reached. Current: ${featureUsage.used}/${featureUsage.limit}, Required: ${quantity}`,
      };
    }

    return { allowed: true };
  }

  /**
   * Reset usage counters for a user
   */
  static resetUsageCounters(userId: string, features?: string[]): void {
    // Mock implementation - in production, update database
    console.log(`Reset usage for user ${userId}${features ? ` for: ${features.join(', ')}` : ''}`);
    
    // Log admin action
    this.logUsageReset(userId, features);
  }

  /**
   * Get usage warnings for a user
   */
  static getUserUsageWarnings(userId: string, plan: 'Free' | 'Pro' | 'Enterprise'): string[] {
    const usage = this.getUserUsage(userId, plan);
    const warnings: string[] = [];

    for (const feature of usage.features) {
      if (feature.status === 'over-limit') {
        warnings.push(`${feature.feature}: OVER LIMIT (${feature.used}/${feature.limit})`);
      } else if (feature.status === 'critical') {
        warnings.push(`${feature.feature}: Approaching limit (${feature.usagePercent}%)`);
      } else if (feature.status === 'warning') {
        warnings.push(`${feature.feature}: Usage at ${feature.usagePercent}%`);
      }
    }

    return warnings;
  }

  /**
   * Detect usage anomalies
   */
  static detectAnomalies(userId: string, plan: 'Free' | 'Pro' | 'Enterprise'): string[] {
    const usage = this.getUserUsage(userId, plan);
    const anomalies: string[] = [];

    // Detect spikes in usage
    if (plan === 'Free' && usage.features.some((f) => f.feature === 'AI Prompts' && f.usagePercent > 80)) {
      anomalies.push('High AI usage on Free plan - potential abuse');
    }

    // Detect frequent limit hits
    if (usage.totalCritical > 3) {
      anomalies.push('User hitting limits repeatedly - monitor for abuse patterns');
    }

    // Detect over-usage
    if (usage.isOverUsing) {
      anomalies.push('Active over-usage detected - enforcement recommended');
    }

    return anomalies;
  }

  /**
   * Get projected usage for end of period
   */
  static getProjectedUsage(
    userId: string,
    plan: 'Free' | 'Pro' | 'Enterprise',
    daysRemaining: number
  ): FeatureUsage[] {
    const usage = this.getUserUsage(userId, plan);
    const now = new Date();
    
    return usage.features.map((feature) => {
      if (feature.limit === null) {
        return feature; // No projection for unlimited
      }

      // Simple linear projection
      const daysElapsed = Math.max(1, 30 - daysRemaining); // Estimate
      const dailyRate = feature.used / daysElapsed;
      const projectedUsage = Math.ceil(dailyRate * 30);

      return {
        ...feature,
        isOverused: projectedUsage > feature.limit,
        usagePercent: Math.min(100, Math.round((projectedUsage / feature.limit) * 100)),
      };
    });
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private static getMockFeatureUsage(plan: 'Free' | 'Pro' | 'Enterprise'): FeatureUsage[] {
    if (plan === 'Free') {
      return [
        this.createFeatureUsage('Invoices', 5, 5),
        this.createFeatureUsage('Receipts', 3, 5),
        this.createFeatureUsage('Quotations', 2, 5),
        this.createFeatureUsage('AI Prompts (Daily)', 45, 50),
        this.createFeatureUsage('Team Members', 1, 1),
        this.createFeatureUsage('Storage (MB)', 85, 100),
      ];
    } else if (plan === 'Pro') {
      return [
        this.createFeatureUsage('Invoices', 342, null),
        this.createFeatureUsage('Receipts', 156, null),
        this.createFeatureUsage('Quotations', 89, null),
        this.createFeatureUsage('AI Prompts (Daily)', 420, 500),
        this.createFeatureUsage('Team Members', 5, 10),
        this.createFeatureUsage('API Calls (Monthly)', 45000, 100000),
        this.createFeatureUsage('Storage (MB)', 1200, 2048),
      ];
    } else {
      return [
        this.createFeatureUsage('Invoices', 1200, null),
        this.createFeatureUsage('Receipts', 890, null),
        this.createFeatureUsage('Quotations', 450, null),
        this.createFeatureUsage('AI Prompts (Daily)', 2000, null),
        this.createFeatureUsage('Team Members', 45, null),
        this.createFeatureUsage('API Calls (Monthly)', 1200000, null),
        this.createFeatureUsage('Storage (MB)', 98000, 102400),
      ];
    }
  }

  private static createFeatureUsage(feature: string, used: number, limit: number | null): FeatureUsage {
    let status: 'ok' | 'warning' | 'critical' | 'over-limit' = 'ok';
    let usagePercent = 0;

    if (limit !== null) {
      usagePercent = Math.round((used / limit) * 100);

      if (used > limit) {
        status = 'over-limit';
      } else if (usagePercent >= 95) {
        status = 'critical';
      } else if (usagePercent >= 80) {
        status = 'warning';
      }
    }

    return {
      feature,
      used,
      limit,
      isOverused: used > (limit || 0),
      usagePercent,
      status,
    };
  }

  private static logUsageReset(userId: string, features?: string[]): void {
    // In production, this would call AdminActionLogger
    console.log('Usage reset logged for audit trail', { userId, features });
  }
}
