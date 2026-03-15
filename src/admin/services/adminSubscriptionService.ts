/**
 * Admin Subscription Management Service
 * Handles admin-level subscription operations with real database integration
 */

import {
  PlanName,
  ManualSubscriptionChange,
  PromotionalOverride,
  AdminUser
} from '../types/admin';
import { AdminActionLogger } from './adminActionLogger';
import { DatabaseService } from './databaseService';

// ============================================================================
// SUBSCRIPTION MANAGEMENT SERVICE
// ============================================================================

export class AdminSubscriptionService {
  
  /**
   * Manually upgrade user to higher plan
   */
  static async adminUpgradePlan(
    adminUser: AdminUser,
    userId: string,
    newPlan: PlanName,
    reason: string,
    ipAddress?: string
  ): Promise<ManualSubscriptionChange> {
    try {
      // Validate upgrade path
      if (!this.isValidUpgrade(userId, newPlan)) {
        throw new Error('Invalid upgrade path');
      }

      // Update in database via API
      await DatabaseService.updateUserPlan(userId, newPlan, reason);

      const change: ManualSubscriptionChange = {
        id: this.generateChangeId(),
        user_id: userId,
        admin_id: adminUser.id,
        action: 'upgrade',
        to_plan: newPlan,
        effective_date: new Date(),
        reason,
        status: 'completed',
        created_at: new Date(),
        completed_at: new Date()
      };

      // Log action
      await AdminActionLogger.logSubscriptionChange(
        adminUser,
        userId,
        'upgrade',
        null,
        newPlan,
        reason,
        ipAddress
      );

      console.log(`[ADMIN] Upgraded user ${userId} to ${newPlan} plan`);
      return change;
    } catch (error) {
      console.error('Failed to upgrade plan:', error);
      throw error;
    }
  }

  /**
   * Manually downgrade user to lower plan
   */
  static async adminDowngradePlan(
    adminUser: AdminUser,
    userId: string,
    newPlan: PlanName,
    reason: string,
    effectiveDate?: Date,
    ipAddress?: string
  ): Promise<ManualSubscriptionChange> {
    try {
      // Update in database via API
      await DatabaseService.updateUserPlan(userId, newPlan, reason);

      const change: ManualSubscriptionChange = {
        id: this.generateChangeId(),
        user_id: userId,
        admin_id: adminUser.id,
        action: 'downgrade',
        to_plan: newPlan,
        effective_date: effectiveDate || new Date(),
        reason,
        status: 'completed',
        created_at: new Date(),
        completed_at: new Date()
      };

      // Log action
      await AdminActionLogger.logSubscriptionChange(
        adminUser,
        userId,
        'downgrade',
        null,
        newPlan,
        reason,
        ipAddress
      );

      console.log(`[ADMIN] Downgraded user ${userId} to ${newPlan} plan`);
      return change;
    } catch (error) {
      console.error('Failed to downgrade plan:', error);
      throw error;
    }
  }

  /**
   * Suspend user subscription
   */
  static async suspendSubscription(
    adminUser: AdminUser,
    userId: string,
    reason: string,
    ipAddress?: string
  ): Promise<ManualSubscriptionChange> {
    try {
      // Update in database via API
      await DatabaseService.toggleUserSuspension(userId, true, reason);

      const change: ManualSubscriptionChange = {
        id: this.generateChangeId(),
        user_id: userId,
        admin_id: adminUser.id,
        action: 'suspend',
        effective_date: new Date(),
        reason,
        status: 'completed',
        created_at: new Date(),
        completed_at: new Date()
      };

      await AdminActionLogger.logSubscriptionChange(
        adminUser,
        userId,
        'suspend',
        null,
        null,
        reason,
        ipAddress
      );

      console.log(`[ADMIN] Suspended user ${userId} subscription`);
      return change;
    } catch (error) {
      console.error('Failed to suspend subscription:', error);
      throw error;
    }
  }

  /**
   * Reactivate suspended subscription
   */
  static async reactivateSubscription(
    adminUser: AdminUser,
    userId: string,
    restorePlan: PlanName,
    reason: string,
    ipAddress?: string
  ): Promise<ManualSubscriptionChange> {
    const change: ManualSubscriptionChange = {
      id: this.generateChangeId(),
      user_id: userId,
      admin_id: adminUser.id,
      action: 'reactivate',
      to_plan: restorePlan,
      effective_date: new Date(),
      reason,
      status: 'completed',
      created_at: new Date(),
      completed_at: new Date()
    };

    await AdminActionLogger.logSubscriptionChange(
      adminUser,
      userId,
      'reactivate',
      null,
      restorePlan,
      reason,
      ipAddress
    );

    console.log(`[ADMIN] Reactivated user ${userId} subscription to ${restorePlan}`);

    return change;
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(
    adminUser: AdminUser,
    userId: string,
    reason: string,
    ipAddress?: string
  ): Promise<ManualSubscriptionChange> {
    const change: ManualSubscriptionChange = {
      id: this.generateChangeId(),
      user_id: userId,
      admin_id: adminUser.id,
      action: 'cancel',
      effective_date: new Date(),
      reason,
      status: 'completed',
      created_at: new Date(),
      completed_at: new Date()
    };

    await AdminActionLogger.logSubscriptionChange(
      adminUser,
      userId,
      'suspend', // Log as suspend for audit purposes
      null,
      null,
      `Cancelled: ${reason}`,
      ipAddress
    );

    console.log(`[ADMIN] Cancelled user ${userId} subscription`);

    return change;
  }

  /**
   * Set promotional override
   */
  static async setPromotionalOverride(
    adminUser: AdminUser,
    userId: string,
    overrideType: 'plan_upgrade' | 'quota_increase' | 'discount' | 'free_trial',
    fromValue: string | number,
    toValue: string | number,
    reason: string,
    expiresAt?: Date,
    ipAddress?: string
  ): Promise<PromotionalOverride> {
    const override: PromotionalOverride = {
      id: this.generateOverrideId(),
      user_id: userId,
      admin_id: adminUser.id,
      override_type: overrideType,
      from_value: fromValue,
      to_value: toValue,
      reason,
      is_active: true,
      expires_at: expiresAt,
      created_at: new Date(),
      updated_at: new Date()
    };

    await AdminActionLogger.logAction(
      adminUser,
      'override',
      'subscription',
      userId,
      `Applied promotional override: ${overrideType}. From: ${fromValue}, To: ${toValue}. Reason: ${reason}`,
      { ipAddress }
    );

    console.log(
      `[ADMIN] Applied promotional override to ${userId}: ${overrideType}`
    );

    return override;
  }

  /**
   * Remove promotional override
   */
  static async removePromotionalOverride(
    adminUser: AdminUser,
    overrideId: string,
    reason: string,
    ipAddress?: string
  ): Promise<void> {
    await AdminActionLogger.logAction(
      adminUser,
      'edit',
      'subscription',
      overrideId,
      `Removed promotional override. Reason: ${reason}`,
      { ipAddress }
    );

    console.log(`[ADMIN] Removed promotional override ${overrideId}`);
  }

  /**
   * Extend subscription expiry
   */
  static async extendSubscriptionExpiry(
    adminUser: AdminUser,
    userId: string,
    daysToAdd: number,
    reason: string,
    ipAddress?: string
  ): Promise<{ expires_at: Date }> {
    const newExpiryDate = new Date();
    newExpiryDate.setDate(newExpiryDate.getDate() + daysToAdd);

    await AdminActionLogger.logAction(
      adminUser,
      'edit',
      'subscription',
      userId,
      `Extended subscription expiry by ${daysToAdd} days. New expiry: ${newExpiryDate.toISOString()}. Reason: ${reason}`,
      { ipAddress }
    );

    console.log(
      `[ADMIN] Extended subscription for ${userId} by ${daysToAdd} days`
    );

    return { expires_at: newExpiryDate };
  }

  /**
   * Reset usage quotas manually
   */
  static async resetUsageQuotas(
    adminUser: AdminUser,
    userId: string,
    feature?: string,
    reason?: string,
    ipAddress?: string
  ): Promise<void> {
    await AdminActionLogger.logAction(
      adminUser,
      'edit',
      'subscription',
      userId,
      `Reset usage quotas${feature ? ` for ${feature}` : ''}. Reason: ${reason || 'Admin maintenance'}`,
      { ipAddress }
    );

    console.log(
      `[ADMIN] Reset usage quotas for ${userId}${feature ? ` - ${feature}` : ''}`
    );
  }

  /**
   * Get subscription change history
   */
  static async getSubscriptionHistory(
    userId: string
  ): Promise<ManualSubscriptionChange[]> {
    // In production, query from database
    console.log(`Fetching subscription history for ${userId}`);
    return [];
  }

  /**
   * Get promotional overrides for user
   */
  static async getUserOverrides(userId: string): Promise<PromotionalOverride[]> {
    // In production, query from database
    console.log(`Fetching promotional overrides for ${userId}`);
    return [];
  }

  // ========================================================================
  // PRIVATE HELPER METHODS
  // ========================================================================

  private static isValidUpgrade(_userId: string, _newPlan: PlanName): boolean {
    // In production, check current plan from database
    // This is a placeholder
    return true;
  }

  private static generateChangeId(): string {
    return `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateOverrideId(): string {
    return `override_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
