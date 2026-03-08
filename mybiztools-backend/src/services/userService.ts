// import prisma from '../lib/prisma.js';

// export interface UpdateProfileInput {
//   firstName?: string;
//   lastName?: string;
//   businessName?: string;
//   phone?: string;
//   avatar_url?: string;
//   businessType?: string;
//   businessAddress?: string;
//   businessCity?: string;
//   businessState?: string;
//   businessCountry?: string;
//   website?: string;
//   taxId?: string;
// }

// export interface ProfileResponse {
//   success: boolean;
//   message: string;
//   data?: {
//     user: {
//       id: string;
//       email: string;
//       firstName: string | null;
//       lastName: string | null;
//       businessName: string | null;
//       phone: string | null;
//       avatar_url: string | null;
//       emailVerified: boolean;
//       current_plan: string;
//       subscription_status: string;
//       created_at: Date;
//       last_login_at: Date | null;
//       subscription?: {
//         plan_name: string;
//         status: string;
//         current_period_start: Date;
//         current_period_end: Date;
//         auto_renew: boolean;
//       } | null;
//     };
//   };
//   error?: string;
// }

// export class UserService {
//   /**
//    * Get user profile with subscription details
//    */
//   static async getProfile(userId: string): Promise<ProfileResponse> {
//     try {
//       const user = await prisma.user.findUnique({
//         where: { id: userId },
//         select: {
//           id: true,
//           email: true,
//           firstName: true,
//           lastName: true,
//           businessName: true,
//           phone: true,
//           avatar_url: true,
//           emailVerified: true,
//           current_plan: true,
//           subscription_status: true,
//           created_at: true,
//           last_login_at: true,
//           country: true,
//           subscription: {
//             select: {
//               plan_name: true,
//               status: true,
//               current_period_start: true,
//               current_period_end: true,
//               auto_renew: true,
//               trial_end_date: true,
//             },
//           },
//         },
//       });

//       if (!user) {
//         return {
//           success: false,
//           message: 'User not found',
//           error: 'USER_NOT_FOUND',
//         };
//       }

//       return {
//         success: true,
//         message: 'Profile retrieved successfully',
//         data: { user: user as NonNullable<ProfileResponse['data']>['user'] },
//       };
//     } catch (error) {
//       console.error('Get profile error:', error);
//       return {
//         success: false,
//         message: 'Failed to retrieve profile',
//         error: 'GET_PROFILE_FAILED',
//       };
//     }
//   }

//   /**
//    * Update user profile
//    */
//   static async updateProfile(userId: string, input: UpdateProfileInput): Promise<ProfileResponse> {
//     try {
//       // Validate user exists
//       const existingUser = await prisma.user.findUnique({
//         where: { id: userId },
//       });

//       if (!existingUser) {
//         return {
//           success: false,
//           message: 'User not found',
//           error: 'USER_NOT_FOUND',
//         };
//       }

//       // Update user profile
//       const updatedUser = await prisma.user.update({
//         where: { id: userId },
//         data: {
//           firstName: input.firstName,
//           lastName: input.lastName,
//           businessName: input.businessName,
//           phone: input.phone,
//           avatar_url: input.avatar_url,
//         },
//         select: {
//           id: true,
//           email: true,
//           firstName: true,
//           lastName: true,
//           businessName: true,
//           phone: true,
//           avatar_url: true,
//           emailVerified: true,
//           current_plan: true,
//           subscription_status: true,
//           created_at: true,
//           last_login_at: true,
//           subscription: {
//             select: {
//               plan_name: true,
//               status: true,
//               current_period_start: true,
//               current_period_end: true,
//               auto_renew: true,
//             },
//           },
//         },
//       });

//       return {
//         success: true,
//         message: 'Profile updated successfully',
//         data: { user: updatedUser as NonNullable<ProfileResponse['data']>['user'] },
//       };
//     } catch (error) {
//       console.error('Update profile error:', error);
//       return {
//         success: false,
//         message: 'Failed to update profile',
//         error: 'UPDATE_PROFILE_FAILED',
//       };
//     }
//   }

//   /**
//    * Update user avatar
//    */
//   static async updateAvatar(userId: string, avatarUrl: string): Promise<ProfileResponse> {
//     try {
//       const updatedUser = await prisma.user.update({
//         where: { id: userId },
//         data: { avatar_url: avatarUrl },
//         select: {
//           id: true,
//           email: true,
//           firstName: true,
//           lastName: true,
//           businessName: true,
//           phone: true,
//           avatar_url: true,
//           emailVerified: true,
//           current_plan: true,
//           subscription_status: true,
//           created_at: true,
//           last_login_at: true,
//         },
//       });

//       return {
//         success: true,
//         message: 'Avatar updated successfully',
//         data: { user: updatedUser as NonNullable<ProfileResponse['data']>['user'] },
//       };
//     } catch (error) {
//       console.error('Update avatar error:', error);
//       return {
//         success: false,
//         message: 'Failed to update avatar',
//         error: 'UPDATE_AVATAR_FAILED',
//       };
//     }
//   }

//   /**
//    * Delete user account
//    */
//   static async deleteAccount(userId: string): Promise<{ success: boolean; message: string; error?: string }> {
//     try {
//       await prisma.user.delete({
//         where: { id: userId },
//       });

//       return {
//         success: true,
//         message: 'Account deleted successfully',
//       };
//     } catch (error) {
//       console.error('Delete account error:', error);
//       return {
//         success: false,
//         message: 'Failed to delete account',
//         error: 'DELETE_ACCOUNT_FAILED',
//       };
//     }
//   }

//   /**
//    * Change user password
//    */
//   static async changePassword(
//     userId: string,
//     currentPassword: string,
//     newPassword: string,
//     hashPassword: (password: string) => Promise<string>,
//     comparePassword: (password: string, hash: string) => Promise<boolean>
//   ): Promise<{ success: boolean; message: string; error?: string }> {
//     try {
//       const user = await prisma.user.findUnique({
//         where: { id: userId },
//         select: { password: true },
//       });

//       if (!user) {
//         return {
//           success: false,
//           message: 'User not found',
//           error: 'USER_NOT_FOUND',
//         };
//       }

//       // Verify current password
//       const isValid = await comparePassword(currentPassword, user.password);
//       if (!isValid) {
//         return {
//           success: false,
//           message: 'Current password is incorrect',
//           error: 'INVALID_PASSWORD',
//         };
//       }

//       // Validate new password
//       if (newPassword.length < 8) {
//         return {
//           success: false,
//           message: 'New password must be at least 8 characters long',
//           error: 'WEAK_PASSWORD',
//         };
//       }

//       // Hash and update password
//       const hashedPassword = await hashPassword(newPassword);
//       await prisma.user.update({
//         where: { id: userId },
//         data: { password: hashedPassword },
//       });

//       return {
//         success: true,
//         message: 'Password changed successfully',
//       };
//     } catch (error) {
//       console.error('Change password error:', error);
//       return {
//         success: false,
//         message: 'Failed to change password',
//         error: 'CHANGE_PASSWORD_FAILED',
//       };
//     }
//   }

//   /**
//    * Get user subscription details
//    */
//   static async getSubscription(userId: string) {
//     try {
//       const subscription = await prisma.subscription.findUnique({
//         where: { user_id: userId },
//         include: {
//           manual_changes: {
//             orderBy: { created_at: 'desc' },
//             take: 5,
//           },
//         },
//       });

//       const user = await prisma.user.findUnique({
//         where: { id: userId },
//         select: {
//           current_plan: true,
//           subscription_status: true,
//         },
//       });

//       return {
//         success: true,
//         data: {
//           subscription,
//           current_plan: user?.current_plan || 'free',
//           subscription_status: user?.subscription_status || 'active',
//         },
//       };
//     } catch (error) {
//       console.error('Get subscription error:', error);
//       return {
//         success: false,
//         message: 'Failed to retrieve subscription',
//         error: 'GET_SUBSCRIPTION_FAILED',
//       };
//     }
//   }

//   /**
//    * Get user payment history
//    */
//   static async getPaymentHistory(userId: string, page: number = 1, limit: number = 20) {
//     try {
//       const skip = (page - 1) * limit;

//       const [payments, total] = await Promise.all([
//         prisma.payment.findMany({
//           where: { user_id: userId },
//           orderBy: { created_at: 'desc' },
//           skip,
//           take: limit,
//           select: {
//             id: true,
//             amount: true,
//             currency: true,
//             status: true,
//             created_at: true,
//             billing_period_start: true,
//             billing_period_end: true,
//             refunded_amount: true,
//           },
//         }),
//         prisma.payment.count({ where: { user_id: userId } }),
//       ]);

//       return {
//         success: true,
//         data: {
//           payments: payments.map(p => ({
//             ...p,
//             amount: Number(p.amount),
//             refunded_amount: Number(p.refunded_amount),
//           })),
//           pagination: {
//             current: page,
//             limit,
//             total,
//             pages: Math.ceil(total / limit),
//           },
//         },
//       };
//     } catch (error) {
//       console.error('Get payment history error:', error);
//       return {
//         success: false,
//         message: 'Failed to retrieve payment history',
//         error: 'GET_PAYMENTS_FAILED',
//       };
//     }
//   }
// }

// export default UserService;


import prisma from '../lib/prisma.js';
import type { ServiceResponse } from '../types/index.js';

// ============================================================================
// USER SERVICE
// ============================================================================

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  businessName?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  businessName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  currentPlan: string;
  subscriptionStatus: string;
  createdAt: Date;
  lastLoginAt: Date | null;
  subscription?: {
    planName: string;
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    autoRenew: boolean;
    trialEndDate: Date | null;
  } | null;
}

export class UserService {
  // --------------------------------------------------------------------------
  // GET PROFILE
  // --------------------------------------------------------------------------

  static async getProfile(userId: string): Promise<ServiceResponse<{ user: UserProfile }>> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        businessName: true,
        phone: true,
        avatarUrl: true,
        emailVerified: true,
        currentPlan: true,
        subscriptionStatus: true,
        createdAt: true,
        lastLoginAt: true,
        subscription: {
          select: {
            planName: true,
            status: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            autoRenew: true,
            trialEndDate: true,
          },
        },
      },
    });

    if (!user) {
      return { success: false, message: 'User not found', error: 'USER_NOT_FOUND' };
    }

    return {
      success: true,
      message: 'Profile retrieved successfully',
      data: { user },
    };
  }

  // --------------------------------------------------------------------------
  // UPDATE PROFILE
  // --------------------------------------------------------------------------

  static async updateProfile(
    userId: string,
    input: UpdateProfileInput
  ): Promise<ServiceResponse<{ user: UserProfile }>> {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        businessName: input.businessName,
        phone: input.phone,
        avatarUrl: input.avatarUrl,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        businessName: true,
        phone: true,
        avatarUrl: true,
        emailVerified: true,
        currentPlan: true,
        subscriptionStatus: true,
        createdAt: true,
        lastLoginAt: true,
        subscription: {
          select: {
            planName: true,
            status: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            autoRenew: true,
            trialEndDate: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser },
    };
  }

  // --------------------------------------------------------------------------
  // UPDATE AVATAR
  // --------------------------------------------------------------------------

  static async updateAvatar(
    userId: string,
    avatarUrl: string
  ): Promise<ServiceResponse<{ user: UserProfile }>> {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        businessName: true,
        phone: true,
        avatarUrl: true,
        emailVerified: true,
        currentPlan: true,
        subscriptionStatus: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    return {
      success: true,
      message: 'Avatar updated successfully',
      data: { user: updatedUser as UserProfile },
    };
  }

  // --------------------------------------------------------------------------
  // CHANGE PASSWORD
  // --------------------------------------------------------------------------

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    hashPassword: (password: string) => Promise<string>,
    comparePassword: (password: string, hash: string) => Promise<boolean>
  ): Promise<ServiceResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      return { success: false, message: 'User not found', error: 'USER_NOT_FOUND' };
    }

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      return { success: false, message: 'Current password is incorrect', error: 'INVALID_PASSWORD' };
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { success: true, message: 'Password changed successfully' };
  }

  // --------------------------------------------------------------------------
  // DELETE ACCOUNT
  // --------------------------------------------------------------------------

  static async deleteAccount(userId: string): Promise<ServiceResponse> {
    await prisma.user.delete({ where: { id: userId } });
    return { success: true, message: 'Account deleted successfully' };
  }

  // --------------------------------------------------------------------------
  // GET SUBSCRIPTION
  // --------------------------------------------------------------------------

  static async getSubscription(userId: string): Promise<ServiceResponse< {
    subscription: unknown;
    currentPlan: string;
    subscriptionStatus: string;
  }>> {
    const [subscription, user] = await Promise.all([
      prisma.subscription.findUnique({
        where: { userId },
        include: {
          manualChanges: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { currentPlan: true, subscriptionStatus: true },
      }),
    ]);

    return {
      success: true,
      message: 'Subscription retrieved successfully',
      data: {
        subscription,
        currentPlan: user?.currentPlan ?? 'free',
        subscriptionStatus: user?.subscriptionStatus ?? 'active',
      },
    };
  }

  // --------------------------------------------------------------------------
  // GET PAYMENT HISTORY
  // --------------------------------------------------------------------------

  static async getPaymentHistory(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ServiceResponse> {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          createdAt: true,
          billingPeriodStart: true,
          billingPeriodEnd: true,
          refundedAmount: true,
        },
      }),
      prisma.payment.count({ where: { userId } }),
    ]);

    const formattedPayments = (payments as any[]).map((p) => ({
      id: p.id,
      amount: Number(p.amount),status: p.status,
      currency: p.currency,
      // status: p.status,
      createdAt: p.createdAt,
      billingPeriodStart: p.billingPeriodStart,
      billingPeriodEnd: p.billingPeriodEnd,
      refundedAmount: Number(p.refundedAmount),
    }));

    return {
      success: true,
      message: 'Payment history retrieved successfully',
      data: {
        payments: formattedPayments,
        pagination: {
          current: page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };
  }
}

export default UserService;