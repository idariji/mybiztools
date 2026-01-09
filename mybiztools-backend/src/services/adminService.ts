import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { AuthService } from './authService.js';

export interface AdminLoginInput {
  email: string;
  password: string;
}

export interface CreateAdminInput {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  plan?: string;
  status?: string;
}

export interface SubscriptionUpdateInput {
  plan_name?: string;
  status?: string;
  expires_at?: Date;
}

export class AdminService {
  // Admin login
  static async login(input: AdminLoginInput) {
    try {
      const admin = await prisma.admin.findUnique({
        where: { email: input.email.toLowerCase() },
      });

      if (!admin) {
        return {
          success: false,
          message: 'Invalid credentials',
          error: 'INVALID_CREDENTIALS',
        };
      }

      const isValidPassword = await bcrypt.compare(input.password, admin.password);

      if (!isValidPassword) {
        return {
          success: false,
          message: 'Invalid credentials',
          error: 'INVALID_CREDENTIALS',
        };
      }

      if (!admin.is_active) {
        return {
          success: false,
          message: 'Admin account is deactivated',
          error: 'ADMIN_DEACTIVATED',
        };
      }

      // Update last login
      await prisma.admin.update({
        where: { id: admin.id },
        data: { last_login_at: new Date() },
      });

      // Generate token
      const token = AuthService.generateToken(admin.id, admin.email);

      return {
        success: true,
        message: 'Login successful',
        data: {
          admin: {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
          },
          token,
        },
      };
    } catch (error) {
      console.error('Admin login error:', error);
      return {
        success: false,
        message: 'Failed to login',
        error: 'LOGIN_FAILED',
      };
    }
  }

  // Create admin (for initial setup or by super_admin)
  static async createAdmin(input: CreateAdminInput) {
    try {
      const existingAdmin = await prisma.admin.findUnique({
        where: { email: input.email.toLowerCase() },
      });

      if (existingAdmin) {
        return {
          success: false,
          message: 'Admin with this email already exists',
          error: 'ADMIN_EXISTS',
        };
      }

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(input.password, salt);

      const admin = await prisma.admin.create({
        data: {
          email: input.email.toLowerCase(),
          password: hashedPassword,
          name: input.name,
          role: input.role || 'viewer',
        },
      });

      return {
        success: true,
        message: 'Admin created successfully',
        data: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      };
    } catch (error) {
      console.error('Create admin error:', error);
      return {
        success: false,
        message: 'Failed to create admin',
        error: 'CREATE_FAILED',
      };
    }
  }

  // Get users with pagination and filters
  static async getUsers(filters: UserFilters) {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (filters.search) {
        where.OR = [
          { email: { contains: filters.search, mode: 'insensitive' } },
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
          { businessName: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      if (filters.plan) {
        where.current_plan = filters.plan;
      }

      if (filters.status) {
        where.subscription_status = filters.status;
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            businessName: true,
            phone: true,
            emailVerified: true,
            current_plan: true,
            subscription_status: true,
            created_at: true,
            last_login_at: true,
            subscription: {
              select: {
                id: true,
                plan_name: true,
                status: true,
                current_period_start: true,
                current_period_end: true,
                expires_at: true,
                mrr_value: true,
              },
            },
          },
        }),
        prisma.user.count({ where }),
      ]);

      return {
        success: true,
        data: {
          users,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      console.error('Get users error:', error);
      return {
        success: false,
        message: 'Failed to fetch users',
        error: 'FETCH_FAILED',
      };
    }
  }

  // Get single user with full details
  static async getUserById(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscription: true,
          payments: {
            orderBy: { created_at: 'desc' },
            take: 10,
          },
          usage_tracking: true,
          abuse_reports: {
            orderBy: { created_at: 'desc' },
            take: 5,
          },
          overrides: {
            where: { is_active: true },
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

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        data: userWithoutPassword,
      };
    } catch (error) {
      console.error('Get user by ID error:', error);
      return {
        success: false,
        message: 'Failed to fetch user',
        error: 'FETCH_FAILED',
      };
    }
  }

  // Get user subscriptions
  static async getUserSubscriptions(userId: string) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { user_id: userId },
        include: {
          manual_changes: {
            orderBy: { created_at: 'desc' },
            take: 10,
          },
        },
      });

      return {
        success: true,
        data: subscription,
      };
    } catch (error) {
      console.error('Get user subscriptions error:', error);
      return {
        success: false,
        message: 'Failed to fetch subscriptions',
        error: 'FETCH_FAILED',
      };
    }
  }

  // Update user plan
  static async updateUserPlan(
    userId: string,
    newPlan: string,
    adminId: string,
    adminName: string,
    adminRole: string,
    reason: string
  ) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND',
        };
      }

      const oldPlan = user.current_plan;
      const now = new Date();
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

      // Update or create subscription
      if (user.subscription) {
        await prisma.subscription.update({
          where: { id: user.subscription.id },
          data: {
            plan_name: newPlan,
            current_period_start: now,
            current_period_end: periodEnd,
          },
        });

        // Log the change
        await prisma.manualSubscriptionChange.create({
          data: {
            subscription_id: user.subscription.id,
            user_id: userId,
            admin_id: adminId,
            admin_name: adminName,
            admin_role: adminRole,
            action: oldPlan < newPlan ? 'upgrade' : 'downgrade',
            from_plan: oldPlan,
            to_plan: newPlan,
            effective_date: now,
            reason,
            status: 'completed',
            completed_at: now,
          },
        });
      } else {
        const newSubscription = await prisma.subscription.create({
          data: {
            user_id: userId,
            plan_name: newPlan,
            status: 'active',
            current_period_start: now,
            current_period_end: periodEnd,
          },
        });

        await prisma.manualSubscriptionChange.create({
          data: {
            subscription_id: newSubscription.id,
            user_id: userId,
            admin_id: adminId,
            admin_name: adminName,
            admin_role: adminRole,
            action: 'upgrade',
            from_plan: 'free',
            to_plan: newPlan,
            effective_date: now,
            reason,
            status: 'completed',
            completed_at: now,
          },
        });
      }

      // Update user's current plan
      await prisma.user.update({
        where: { id: userId },
        data: { current_plan: newPlan },
      });

      // Log admin action
      await prisma.adminAuditLog.create({
        data: {
          admin_id: adminId,
          admin_name: adminName,
          admin_role: adminRole,
          target_user_id: userId,
          action: 'update',
          resource: 'subscription',
          resource_id: userId,
          changes: { from_plan: oldPlan, to_plan: newPlan },
          reason,
        },
      });

      return {
        success: true,
        message: `User plan updated from ${oldPlan} to ${newPlan}`,
        data: { oldPlan, newPlan },
      };
    } catch (error) {
      console.error('Update user plan error:', error);
      return {
        success: false,
        message: 'Failed to update user plan',
        error: 'UPDATE_FAILED',
      };
    }
  }

  // Suspend/unsuspend user
  static async updateUserSuspension(
    userId: string,
    suspend: boolean,
    adminId: string,
    adminName: string,
    adminRole: string,
    reason: string
  ) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND',
        };
      }

      const newStatus = suspend ? 'suspended' : 'active';

      await prisma.user.update({
        where: { id: userId },
        data: { subscription_status: newStatus },
      });

      // Update subscription status if exists
      await prisma.subscription.updateMany({
        where: { user_id: userId },
        data: { status: newStatus },
      });

      // Log admin action
      await prisma.adminAuditLog.create({
        data: {
          admin_id: adminId,
          admin_name: adminName,
          admin_role: adminRole,
          target_user_id: userId,
          action: 'update',
          resource: 'user',
          resource_id: userId,
          changes: { subscription_status: newStatus, suspended: suspend },
          reason,
        },
      });

      return {
        success: true,
        message: suspend ? 'User suspended successfully' : 'User reactivated successfully',
        data: { status: newStatus },
      };
    } catch (error) {
      console.error('Update user suspension error:', error);
      return {
        success: false,
        message: 'Failed to update user status',
        error: 'UPDATE_FAILED',
      };
    }
  }

  // Extend user subscription
  static async extendSubscription(
    userId: string,
    days: number,
    adminId: string,
    adminName: string,
    adminRole: string,
    reason: string
  ) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND',
        };
      }

      if (!user.subscription) {
        return {
          success: false,
          message: 'User has no subscription to extend',
          error: 'NO_SUBSCRIPTION',
        };
      }

      const currentEnd = user.subscription.current_period_end;
      const newEnd = new Date(currentEnd.getTime() + days * 24 * 60 * 60 * 1000);

      await prisma.subscription.update({
        where: { id: user.subscription.id },
        data: { current_period_end: newEnd },
      });

      // Log the change
      await prisma.manualSubscriptionChange.create({
        data: {
          subscription_id: user.subscription.id,
          user_id: userId,
          admin_id: adminId,
          admin_name: adminName,
          admin_role: adminRole,
          action: 'extend',
          effective_date: new Date(),
          reason,
          notes: `Extended by ${days} days`,
          status: 'completed',
          completed_at: new Date(),
        },
      });

      // Log admin action
      await prisma.adminAuditLog.create({
        data: {
          admin_id: adminId,
          admin_name: adminName,
          admin_role: adminRole,
          target_user_id: userId,
          action: 'update',
          resource: 'subscription',
          resource_id: user.subscription.id,
          changes: { extended_days: days, new_end: newEnd.toISOString() },
          reason,
        },
      });

      return {
        success: true,
        message: `Subscription extended by ${days} days`,
        data: { previousEnd: currentEnd, newEnd },
      };
    } catch (error) {
      console.error('Extend subscription error:', error);
      return {
        success: false,
        message: 'Failed to extend subscription',
        error: 'EXTEND_FAILED',
      };
    }
  }
}

export default AdminService;
