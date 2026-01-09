/**
 * Admin Authentication & Role-Based Access Control (RBAC)
 * Manages admin user authentication and permission checks
 */

import { AdminUser, AdminRole, AdminPermission, AdminAction } from '../types/admin';

// ============================================================================
// ROLE PERMISSION MATRIX
// ============================================================================

export const ROLE_PERMISSIONS: Record<AdminRole, AdminAction[]> = {
  super_admin: ['view', 'edit', 'delete', 'override', 'suspend', 'refund'],
  billing_admin: ['view', 'edit', 'override', 'suspend', 'refund'],
  support_admin: ['view', 'edit', 'suspend'],
  viewer: ['view']
};

export const RESOURCE_PERMISSIONS: Record<AdminAction, string[]> = {
  view: ['users', 'subscriptions', 'payments', 'abuse', 'system'],
  edit: ['users', 'subscriptions', 'payments'],
  delete: ['users', 'subscriptions'],
  override: ['subscriptions', 'payments'],
  suspend: ['users', 'subscriptions'],
  refund: ['payments']
};

// ============================================================================
// ADMIN AUTHENTICATION SERVICE
// ============================================================================

export class AdminAuthService {
  
  /**
   * Check if user is admin and return admin details
   */
  static async getAdminUser(userId: string): Promise<AdminUser | null> {
    // In production, query from database
    // This is demo implementation
    const adminUsers = new Map<string, AdminUser>([
      [
        'admin-001',
        {
          id: 'admin-001',
          email: 'superadmin@biztool.com',
          name: 'Super Admin',
          role: 'super_admin',
          permissions: this.getRolePermissions('super_admin'),
          is_active: true,
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01')
        }
      ],
      [
        'admin-002',
        {
          id: 'admin-002',
          email: 'billing@biztool.com',
          name: 'Billing Admin',
          role: 'billing_admin',
          permissions: this.getRolePermissions('billing_admin'),
          is_active: true,
          created_at: new Date('2024-01-15'),
          updated_at: new Date('2024-01-15')
        }
      ],
      [
        'admin-003',
        {
          id: 'admin-003',
          email: 'support@biztool.com',
          name: 'Support Admin',
          role: 'support_admin',
          permissions: this.getRolePermissions('support_admin'),
          is_active: true,
          created_at: new Date('2024-02-01'),
          updated_at: new Date('2024-02-01')
        }
      ]
    ]);

    return adminUsers.get(userId) || null;
  }

  /**
   * Convert role to permissions
   */
  private static getRolePermissions(role: AdminRole): AdminPermission[] {
    const actions = ROLE_PERMISSIONS[role];
    return actions.map((action) => ({
      id: `perm-${action}`,
      name: action,
      description: `Permission to ${action} resources`,
      resource: 'users'
    }));
  }

  /**
   * Verify admin is authenticated and active
   */
  static async verifyAdminAccess(
    userId: string,
    requiredRole?: AdminRole
  ): Promise<boolean> {
    const admin = await this.getAdminUser(userId);

    if (!admin || !admin.is_active) {
      return false;
    }

    if (requiredRole) {
      const roleHierarchy = { super_admin: 4, billing_admin: 3, support_admin: 2, viewer: 1 };
      return roleHierarchy[admin.role] >= roleHierarchy[requiredRole];
    }

    return true;
  }

  /**
   * Check if admin can perform specific action on resource
   */
  static async canPerformAction(
    userId: string,
    action: AdminAction,
    resource: string
  ): Promise<boolean> {
    const admin = await this.getAdminUser(userId);

    if (!admin || !admin.is_active) {
      return false;
    }

    const roleActions = ROLE_PERMISSIONS[admin.role];
    if (!roleActions.includes(action)) {
      return false;
    }

    const actionResources = RESOURCE_PERMISSIONS[action];
    return actionResources.includes(resource);
  }

  /**
   * Get admin role hierarchy level (for comparisons)
   */
  static getRoleLevel(role: AdminRole): number {
    const hierarchy: Record<AdminRole, number> = {
      super_admin: 4,
      billing_admin: 3,
      support_admin: 2,
      viewer: 1
    };
    return hierarchy[role];
  }
}

// ============================================================================
// PERMISSION CHECKING UTILITIES
// ============================================================================

export class PermissionChecker {
  
  /**
   * Check if admin has specific permission
   */
  static hasPermission(
    admin: AdminUser,
    action: AdminAction,
    resource: string
  ): boolean {
    const roleActions = ROLE_PERMISSIONS[admin.role];
    if (!roleActions.includes(action)) {
      return false;
    }

    const actionResources = RESOURCE_PERMISSIONS[action];
    return actionResources.includes(resource);
  }

  /**
   * Check if admin can view user data
   */
  static canViewUser(admin: AdminUser): boolean {
    return this.hasPermission(admin, 'view', 'users');
  }

  /**
   * Check if admin can edit user data
   */
  static canEditUser(admin: AdminUser): boolean {
    return this.hasPermission(admin, 'edit', 'users');
  }

  /**
   * Check if admin can modify subscriptions
   */
  static canModifySubscription(admin: AdminUser): boolean {
    return this.hasPermission(admin, 'edit', 'subscriptions') ||
           this.hasPermission(admin, 'override', 'subscriptions');
  }

  /**
   * Check if admin can process refunds
   */
  static canRefund(admin: AdminUser): boolean {
    return this.hasPermission(admin, 'refund', 'payments');
  }

  /**
   * Check if admin can suspend users/subscriptions
   */
  static canSuspend(admin: AdminUser): boolean {
    return this.hasPermission(admin, 'suspend', 'users') ||
           this.hasPermission(admin, 'suspend', 'subscriptions');
  }

  /**
   * Check if admin can delete resources
   */
  static canDelete(admin: AdminUser): boolean {
    return this.hasPermission(admin, 'delete', 'users');
  }

  /**
   * Get all accessible features for admin
   */
  static getAccessibleFeatures(admin: AdminUser): string[] {
    const features: string[] = [];

    // Everyone can view dashboard
    features.push('dashboard');

    if (this.hasPermission(admin, 'view', 'users')) {
      features.push('users');
    }

    if (this.hasPermission(admin, 'view', 'subscriptions')) {
      features.push('subscriptions');
    }

    if (this.hasPermission(admin, 'view', 'payments')) {
      features.push('payments');
    }

    if (this.hasPermission(admin, 'view', 'abuse')) {
      features.push('abuse');
    }

    if (this.hasPermission(admin, 'view', 'system')) {
      features.push('settings');
    }

    return features;
  }
}
