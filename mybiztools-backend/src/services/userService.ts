import prisma from '../lib/prisma.js';

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  businessName?: string;
  phone?: string;
  avatar_url?: string;
  businessType?: string;
  businessAddress?: string;
  businessCity?: string;
  businessState?: string;
  businessCountry?: string;
  website?: string;
  taxId?: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      businessName: string | null;
      phone: string | null;
      avatar_url: string | null;
      emailVerified: boolean;
      current_plan: string;
      subscription_status: string;
      created_at: Date;
      last_login_at: Date | null;
      subscription?: {
        plan_name: string;
        status: string;
        current_period_start: Date;
        current_period_end: Date;
        auto_renew: boolean;
      } | null;
    };
  };
  error?: string;
}

export class UserService {
  /**
   * Get user profile with subscription details
   */
  static async getProfile(userId: string): Promise<ProfileResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          businessName: true,
          phone: true,
          avatar_url: true,
          emailVerified: true,
          current_plan: true,
          subscription_status: true,
          created_at: true,
          last_login_at: true,
          country: true,
          subscription: {
            select: {
              plan_name: true,
              status: true,
              current_period_start: true,
              current_period_end: true,
              auto_renew: true,
              trial_end_date: true,
            },
          },
        },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND',
        };
      }

      return {
        success: true,
        message: 'Profile retrieved successfully',
        data: { user: user as NonNullable<ProfileResponse['data']>['user'] },
      };
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        message: 'Failed to retrieve profile',
        error: 'GET_PROFILE_FAILED',
      };
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, input: UpdateProfileInput): Promise<ProfileResponse> {
    try {
      // Validate user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        return {
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND',
        };
      }

      // Update user profile
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          businessName: input.businessName,
          phone: input.phone,
          avatar_url: input.avatar_url,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          businessName: true,
          phone: true,
          avatar_url: true,
          emailVerified: true,
          current_plan: true,
          subscription_status: true,
          created_at: true,
          last_login_at: true,
          subscription: {
            select: {
              plan_name: true,
              status: true,
              current_period_start: true,
              current_period_end: true,
              auto_renew: true,
            },
          },
        },
      });

      return {
        success: true,
        message: 'Profile updated successfully',
        data: { user: updatedUser as NonNullable<ProfileResponse['data']>['user'] },
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: 'Failed to update profile',
        error: 'UPDATE_PROFILE_FAILED',
      };
    }
  }

  /**
   * Update user avatar
   */
  static async updateAvatar(userId: string, avatarUrl: string): Promise<ProfileResponse> {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { avatar_url: avatarUrl },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          businessName: true,
          phone: true,
          avatar_url: true,
          emailVerified: true,
          current_plan: true,
          subscription_status: true,
          created_at: true,
          last_login_at: true,
        },
      });

      return {
        success: true,
        message: 'Avatar updated successfully',
        data: { user: updatedUser as NonNullable<ProfileResponse['data']>['user'] },
      };
    } catch (error) {
      console.error('Update avatar error:', error);
      return {
        success: false,
        message: 'Failed to update avatar',
        error: 'UPDATE_AVATAR_FAILED',
      };
    }
  }

  /**
   * Delete user account
   */
  static async deleteAccount(userId: string): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      await prisma.user.delete({
        where: { id: userId },
      });

      return {
        success: true,
        message: 'Account deleted successfully',
      };
    } catch (error) {
      console.error('Delete account error:', error);
      return {
        success: false,
        message: 'Failed to delete account',
        error: 'DELETE_ACCOUNT_FAILED',
      };
    }
  }

  /**
   * Change user password
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    hashPassword: (password: string) => Promise<string>,
    comparePassword: (password: string, hash: string) => Promise<boolean>
  ): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND',
        };
      }

      // Verify current password
      const isValid = await comparePassword(currentPassword, user.password);
      if (!isValid) {
        return {
          success: false,
          message: 'Current password is incorrect',
          error: 'INVALID_PASSWORD',
        };
      }

      // Validate new password
      if (newPassword.length < 8) {
        return {
          success: false,
          message: 'New password must be at least 8 characters long',
          error: 'WEAK_PASSWORD',
        };
      }

      // Hash and update password
      const hashedPassword = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: 'Failed to change password',
        error: 'CHANGE_PASSWORD_FAILED',
      };
    }
  }

  /**
   * Get user subscription details
   */
  static async getSubscription(userId: string) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { user_id: userId },
        include: {
          manual_changes: {
            orderBy: { created_at: 'desc' },
            take: 5,
          },
        },
      });

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          current_plan: true,
          subscription_status: true,
        },
      });

      return {
        success: true,
        data: {
          subscription,
          current_plan: user?.current_plan || 'free',
          subscription_status: user?.subscription_status || 'active',
        },
      };
    } catch (error) {
      console.error('Get subscription error:', error);
      return {
        success: false,
        message: 'Failed to retrieve subscription',
        error: 'GET_SUBSCRIPTION_FAILED',
      };
    }
  }

  /**
   * Get user payment history
   */
  static async getPaymentHistory(userId: string, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where: { user_id: userId },
          orderBy: { created_at: 'desc' },
          skip,
          take: limit,
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            created_at: true,
            billing_period_start: true,
            billing_period_end: true,
            refunded_amount: true,
          },
        }),
        prisma.payment.count({ where: { user_id: userId } }),
      ]);

      return {
        success: true,
        data: {
          payments: payments.map(p => ({
            ...p,
            amount: Number(p.amount),
            refunded_amount: Number(p.refunded_amount),
          })),
          pagination: {
            current: page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      console.error('Get payment history error:', error);
      return {
        success: false,
        message: 'Failed to retrieve payment history',
        error: 'GET_PAYMENTS_FAILED',
      };
    }
  }
}

export default UserService;
