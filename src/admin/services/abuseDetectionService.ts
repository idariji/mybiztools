/**
 * Admin Abuse Detection & Management Service
 * Detects and manages abuse patterns and violations
 */

import {
  AbuseReport,
  AbuseSeverity,
  AbuseStatus,
  UsageTracking,
  AdminUser
} from '../types/admin';
import { AdminActionLogger } from './adminActionLogger';

// ============================================================================
// ABUSE DETECTION SERVICE
// ============================================================================

export class AbuseDetectionService {
  
  // Abuse detection thresholds
  private static readonly QUOTA_ABUSE_THRESHOLD = 0.95; // 95% of limit
  private static readonly API_ABUSE_THRESHOLD = 1000; // requests/hour

  /**
   * Detect quota abuse pattern
   */
  static async detectQuotaAbuse(
    userId: string,
    usageData: UsageTracking[],
    limits: Record<string, number>
  ): Promise<AbuseReport | null> {
    let abusiveFeatures: string[] = [];

    for (const usage of usageData) {
      const limit = limits[usage.feature_name];
      if (limit && usage.usage_count > limit * this.QUOTA_ABUSE_THRESHOLD) {
        abusiveFeatures.push(`${usage.feature_name} (${usage.usage_count}/${limit})`);
      }
    }

    if (abusiveFeatures.length === 0) {
      return null;
    }

    return {
      id: this.generateReportId(),
      user_id: userId,
      abuse_type: 'quota_abuse',
      severity: abusiveFeatures.length > 2 ? 'high' : 'medium',
      status: 'open',
      description: `User approaching quota limits on: ${abusiveFeatures.join(', ')}`,
      evidence: {
        features_affected: abusiveFeatures,
        detected_at: new Date().toISOString()
      },
      detected_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  /**
   * Detect payment fraud pattern
   */
  static async detectPaymentFraud(
    userId: string,
    opts: {
      failed_attempts: number;
      failed_in_hours: number;
      amount_deviation?: number;
    }
  ): Promise<AbuseReport | null> {
    // Multiple failed payment attempts in short time
    if (opts.failed_attempts >= 3 && opts.failed_in_hours <= 24) {
      return {
        id: this.generateReportId(),
        user_id: userId,
        abuse_type: 'payment_fraud',
        severity: opts.failed_attempts >= 5 ? 'critical' : 'high',
        status: 'open',
        description: `${opts.failed_attempts} failed payment attempts in ${opts.failed_in_hours} hours`,
        evidence: {
          failed_attempts: opts.failed_attempts,
          timeframe_hours: opts.failed_in_hours,
          amount_deviation: opts.amount_deviation
        },
        detected_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      };
    }

    return null;
  }

  /**
   * Detect API abuse pattern
   */
  static async detectApiAbuse(
    userId: string,
    requestsPerHour: number,
    opts?: {
      error_rate?: number;
      same_endpoint_threshold?: number;
    }
  ): Promise<AbuseReport | null> {
    if (requestsPerHour > this.API_ABUSE_THRESHOLD) {
      return {
        id: this.generateReportId(),
        user_id: userId,
        abuse_type: 'api_abuse',
        severity: requestsPerHour > this.API_ABUSE_THRESHOLD * 2 ? 'critical' : 'high',
        status: 'open',
        description: `Excessive API requests: ${requestsPerHour} requests/hour`,
        evidence: {
          requests_per_hour: requestsPerHour,
          threshold: this.API_ABUSE_THRESHOLD,
          error_rate: opts?.error_rate,
          same_endpoint_requests: opts?.same_endpoint_threshold
        },
        detected_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      };
    }

    return null;
  }

  /**
   * Detect suspicious activity patterns
   */
  static async detectSuspiciousActivity(
    userId: string,
    opts: {
      multiple_ip_changes?: number;
      location_anomaly?: boolean;
      device_changes?: number;
      unusual_time_access?: boolean;
    }
  ): Promise<AbuseReport | null> {
    const suspiciousFactors = Object.values(opts).filter(Boolean).length;

    if (suspiciousFactors >= 2) {
      return {
        id: this.generateReportId(),
        user_id: userId,
        abuse_type: 'suspicious_activity',
        severity: suspiciousFactors >= 3 ? 'high' : 'medium',
        status: 'open',
        description: `Suspicious activity detected: ${suspiciousFactors} anomalies`,
        evidence: {
          ip_changes: opts.multiple_ip_changes,
          location_anomaly: opts.location_anomaly,
          device_changes: opts.device_changes,
          unusual_time: opts.unusual_time_access
        },
        detected_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      };
    }

    return null;
  }

  /**
   * Detect terms of service violation
   */
  static async detectTermsViolation(
    userId: string,
    violationType: 'reselling' | 'content_abuse' | 'unauthorized_use' | 'data_mining',
    description: string,
    evidence?: Record<string, any>
  ): Promise<AbuseReport> {
    return {
      id: this.generateReportId(),
      user_id: userId,
      abuse_type: 'terms_violation',
      severity: 'high',
      status: 'open',
      description: description,
      evidence: {
        violation_type: violationType,
        ...evidence
      },
      detected_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  // =========================================================================
  // ABUSE REPORT MANAGEMENT
  // =========================================================================

  /**
   * Start investigation on abuse report
   */
  static async investigateReport(
    adminUser: AdminUser,
    reportId: string,
    initialNotes: string,
    ipAddress?: string
  ): Promise<AbuseReport> {
    await AdminActionLogger.logAbuseAction(
      adminUser,
      reportId,
      'investigate',
      initialNotes,
      ipAddress
    );

    console.log(`[ABUSE] Started investigation on report ${reportId}`);

    // In production, update report status to 'investigating'
    return {
      id: reportId,
      user_id: 'user-id',
      abuse_type: 'quota_abuse',
      severity: 'high',
      status: 'investigating',
      description: 'Investigation in progress',
      detected_at: new Date(),
      assigned_to: adminUser.id,
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  /**
   * Resolve abuse report
   */
  static async resolveReport(
    adminUser: AdminUser,
    reportId: string,
    decision: 'confirmed' | 'unconfirmed',
    resolutionNotes: string,
    actions?: {
      suspend_user?: boolean;
      refund_payment?: boolean;
      reset_quotas?: boolean;
      send_warning?: boolean;
    },
    ipAddress?: string
  ): Promise<AbuseReport> {
    await AdminActionLogger.logAbuseAction(
      adminUser,
      reportId,
      'resolve',
      `Decision: ${decision}. Actions: ${JSON.stringify(actions)}. Notes: ${resolutionNotes}`,
      ipAddress
    );

    const actionsList = actions
      ? Object.entries(actions)
          .filter(([, v]) => v)
          .map(([k]) => k)
          .join(', ')
      : 'none';

    console.log(
      `[ABUSE] Resolved report ${reportId}. Decision: ${decision}. Actions: ${actionsList}`
    );

    // In production, update report and execute actions
    return {
      id: reportId,
      user_id: 'user-id',
      abuse_type: 'quota_abuse',
      severity: 'high',
      status: 'resolved',
      description: 'Abuse report resolved',
      detected_at: new Date(),
      resolved_by: adminUser.id,
      resolution_notes: resolutionNotes,
      resolved_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  /**
   * Dismiss false positive abuse report
   */
  static async dismissReport(
    adminUser: AdminUser,
    reportId: string,
    reason: string,
    ipAddress?: string
  ): Promise<AbuseReport> {
    await AdminActionLogger.logAbuseAction(
      adminUser,
      reportId,
      'dismiss',
      `False positive. Reason: ${reason}`,
      ipAddress
    );

    console.log(`[ABUSE] Dismissed report ${reportId} as false positive`);

    return {
      id: reportId,
      user_id: 'user-id',
      abuse_type: 'quota_abuse',
      severity: 'high',
      status: 'dismissed',
      description: 'False positive',
      detected_at: new Date(),
      resolved_by: adminUser.id,
      resolution_notes: reason,
      resolved_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  /**
   * Get abuse reports
   */
  static async getAbuseReports(opts?: {
    severity?: AbuseSeverity;
    status?: AbuseStatus;
    limit?: number;
    offset?: number;
  }): Promise<AbuseReport[]> {
    // In production, query from database with filters
    console.log(
      `Fetching abuse reports - Severity: ${opts?.severity}, Status: ${opts?.status}`
    );
    return [];
  }

  /**
   * Get user abuse history
   */
  static async getUserAbuseHistory(userId: string): Promise<AbuseReport[]> {
    // In production, query from database
    console.log(`Fetching abuse history for user ${userId}`);
    return [];
  }

  // =========================================================================
  // HELPER METHODS
  // =========================================================================

  private static generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// ABUSE SEVERITY CALCULATOR
// ============================================================================

export class AbuseSeverityCalculator {
  
  /**
   * Calculate severity based on factors
   */
  static calculateSeverity(factors: {
    quotaPercentage?: number;
    failedAttempts?: number;
    apiRequestsPerHour?: number;
    suspiciousFactors?: number;
    priorIncidents?: number;
  }): AbuseSeverity {
    let severityScore = 0;

    if (factors.quotaPercentage && factors.quotaPercentage >= 0.95) {
      severityScore += 1;
    }

    if (factors.failedAttempts && factors.failedAttempts >= 3) {
      severityScore += 2;
    }

    if (factors.apiRequestsPerHour && factors.apiRequestsPerHour > 1000) {
      severityScore += 2;
    }

    if (factors.suspiciousFactors && factors.suspiciousFactors >= 3) {
      severityScore += 2;
    }

    if (factors.priorIncidents && factors.priorIncidents > 0) {
      severityScore += factors.priorIncidents;
    }

    if (severityScore >= 5) return 'critical';
    if (severityScore >= 3) return 'high';
    if (severityScore >= 1) return 'medium';
    return 'low';
  }
}
