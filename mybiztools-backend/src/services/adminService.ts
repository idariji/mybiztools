import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { AuthService } from './authService.js';
import type { ServiceResponse } from '../types/index.js';

// ============================================================================
// ADMIN SERVICE
// ============================================================================

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

const formatUser = (user: any) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  businessName: user.businessName,
  phone: user.phone,
  emailVerified: user.emailVerified,
  currentPlan: user.currentPlan,
  subscriptionStatus: user.subscriptionStatus,
  createdAt: user.createdAt?.toISOString() ?? null,
  lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
  subscription: user.subscription ?? undefined,
});

export class AdminService {
  // --------------------------------------------------------------------------
  // LOGIN
  // --------------------------------------------------------------------------

  static async login(input: AdminLoginInput): Promise<ServiceResponse> {
    const admin = await prisma.admin.findUnique({
      where: { email: input.email.toLowerCase() },
      select: { id: true, email: true, password: true, name: true, role: true },
    });

    if (!admin) {
      return { success: false, message: 'Invalid credentials', error: 'INVALID_CREDENTIALS' };
    }

    const isValidPassword = await bcrypt.compare(input.password, admin.password);
    if (!isValidPassword) {
      return { success: false, message: 'Invalid credentials', error: 'INVALID_CREDENTIALS' };
    }

    // Best-effort lastLoginAt update — don't fail login if this errors
    prisma.admin.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } }).catch(
      (err) => console.warn('[Admin] lastLoginAt update failed:', err?.message)
    );

    const token = AuthService.generateToken(admin.id, admin.email);

    return {
      success: true,
      message: 'Login successful',
      data: {
        admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
        token,
      },
    };
  }

  // --------------------------------------------------------------------------
  // BOOTSTRAP — first admin only, no auth required (gated by SETUP_SECRET)
  // --------------------------------------------------------------------------

  static async bootstrap(input: CreateAdminInput): Promise<ServiceResponse> {
    const count = await prisma.admin.count();
    if (count > 0) {
      return { success: false, message: 'An admin already exists. Use /api/admin/create instead.', error: 'ADMIN_EXISTS' };
    }
    const hashedPassword = await bcrypt.hash(input.password, 12);
    const admin = await prisma.admin.create({
      data: { email: input.email.toLowerCase(), password: hashedPassword, name: input.name, role: 'super_admin' },
    });
    return { success: true, message: 'First super_admin created', data: { admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } } };
  }

  // --------------------------------------------------------------------------
  // CREATE ADMIN
  // --------------------------------------------------------------------------

  static async createAdmin(input: CreateAdminInput): Promise<ServiceResponse> {
    const existing = await prisma.admin.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existing) {
      return { success: false, message: 'Admin with this email already exists', error: 'ADMIN_EXISTS' };
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);

    const admin = await prisma.admin.create({
      data: {
        email: input.email.toLowerCase(),
        password: hashedPassword,
        name: input.name,
        role: input.role ?? 'viewer',
      },
    });

    return {
      success: true,
      message: 'Admin created successfully',
      data: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
    };
  }

  // --------------------------------------------------------------------------
  // GET USERS
  // --------------------------------------------------------------------------

  static async getUsers(filters: UserFilters): Promise<ServiceResponse> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.search) {
      where.OR = [
        { email:        { contains: filters.search, mode: 'insensitive' } },
        { firstName:    { contains: filters.search, mode: 'insensitive' } },
        { lastName:     { contains: filters.search, mode: 'insensitive' } },
        { businessName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.plan)   where.currentPlan         = filters.plan;
    if (filters.status) where.subscriptionStatus  = filters.status;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          businessName: true,
          phone: true,
          emailVerified: true,
          currentPlan: true,
          subscriptionStatus: true,
          createdAt: true,
          lastLoginAt: true,
          subscription: {
            select: {
              id: true,
              planName: true,
              status: true,
              currentPeriodStart: true,
              currentPeriodEnd: true,
              expiresAt: true,
              mrrValue: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users: (users as any[]).map(formatUser),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    };
  }

  // --------------------------------------------------------------------------
  // GET USER BY ID
  // --------------------------------------------------------------------------

  static async getUserById(userId: string): Promise<ServiceResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        payments: { orderBy: { createdAt: 'desc' }, take: 10 },
        usageTracking: true,
        abuseReports: { orderBy: { createdAt: 'desc' }, take: 5 },
        overrides: { where: { isActive: true } },
      },
    }) as any;

    if (!user) {
      return { success: false, message: 'User not found', error: 'USER_NOT_FOUND' };
    }

    const { password, ...safeUser } = user;
    return { success: true, message: 'User retrieved successfully', data: safeUser };
  }

  // --------------------------------------------------------------------------
  // GET USER SUBSCRIPTIONS
  // --------------------------------------------------------------------------

  static async getUserSubscriptions(userId: string): Promise<ServiceResponse> {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: {
        manualChanges: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    return { success: true, message: 'Subscription retrieved successfully', data: subscription };
  }

  // --------------------------------------------------------------------------
  // UPDATE USER PLAN
  // --------------------------------------------------------------------------

  static async updateUserPlan(
    userId: string,
    newPlan: string,
    adminId: string,
    adminName: string,
    adminRole: string,
    reason: string
  ): Promise<ServiceResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    }) as any;

    if (!user) {
      return { success: false, message: 'User not found', error: 'USER_NOT_FOUND' };
    }

    const oldPlan = user.currentPlan;
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (user.subscription) {
      await prisma.subscription.update({
        where: { id: user.subscription.id },
        data: { planName: newPlan, currentPeriodStart: now, currentPeriodEnd: periodEnd },
      });

      await prisma.manualSubscriptionChange.create({
        data: {
          subscriptionId: user.subscription.id,
          userId,
          adminId,
          adminName,
          adminRole,
          action: 'upgrade',
          fromPlan: oldPlan,
          toPlan: newPlan,
          effectiveDate: now,
          reason,
          status: 'completed',
          completedAt: now,
        },
      });
    } else {
      const newSub = await prisma.subscription.create({
        data: {
          userId,
          planName: newPlan,
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });

      await prisma.manualSubscriptionChange.create({
        data: {
          subscriptionId: newSub.id,
          userId,
          adminId,
          adminName,
          adminRole,
          action: 'upgrade',
          fromPlan: 'free',
          toPlan: newPlan,
          effectiveDate: now,
          reason,
          status: 'completed',
          completedAt: now,
        },
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { currentPlan: newPlan },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId,
        adminName,
        adminRole,
        targetUserId: userId,
        action: 'update',
        resource: 'subscription',
        resourceId: userId,
        changes: { fromPlan: oldPlan, toPlan: newPlan },
        reason,
      },
    });

    return {
      success: true,
      message: `User plan updated from ${oldPlan} to ${newPlan}`,
      data: { oldPlan, newPlan },
    };
  }

  // --------------------------------------------------------------------------
  // UPDATE USER SUSPENSION
  // --------------------------------------------------------------------------

  static async updateUserSuspension(
    userId: string,
    suspend: boolean,
    adminId: string,
    adminName: string,
    adminRole: string,
    reason: string
  ): Promise<ServiceResponse> {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return { success: false, message: 'User not found', error: 'USER_NOT_FOUND' };
    }

    const newStatus = suspend ? 'suspended' : 'active';

    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionStatus: newStatus },
    });

    await prisma.subscription.updateMany({
      where: { userId },
      data: { status: newStatus },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId,
        adminName,
        adminRole,
        targetUserId: userId,
        action: 'update',
        resource: 'user',
        resourceId: userId,
        changes: { subscriptionStatus: newStatus, suspended: suspend },
        reason,
      },
    });

    return {
      success: true,
      message: suspend ? 'User suspended successfully' : 'User reactivated successfully',
      data: { status: newStatus },
    };
  }

  // --------------------------------------------------------------------------
  // EXTEND SUBSCRIPTION
  // --------------------------------------------------------------------------

  static async extendSubscription(
    userId: string,
    days: number,
    adminId: string,
    adminName: string,
    adminRole: string,
    reason: string
  ): Promise<ServiceResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    }) as any;

    if (!user) {
      return { success: false, message: 'User not found', error: 'USER_NOT_FOUND' };
    }

    if (!user.subscription) {
      return { success: false, message: 'User has no subscription to extend', error: 'NO_SUBSCRIPTION' };
    }

    const currentEnd = user.subscription.currentPeriodEnd;
    const newEnd = new Date(currentEnd.getTime() + days * 24 * 60 * 60 * 1000);

    await prisma.subscription.update({
      where: { id: user.subscription.id },
      data: { currentPeriodEnd: newEnd },
    });

    await prisma.manualSubscriptionChange.create({
      data: {
        subscriptionId: user.subscription.id,
        userId,
        adminId,
        adminName,
        adminRole,
        action: 'extend',
        effectiveDate: new Date(),
        reason,
        notes: `Extended by ${days} days`,
        status: 'completed',
        completedAt: new Date(),
      },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId,
        adminName,
        adminRole,
        targetUserId: userId,
        action: 'update',
        resource: 'subscription',
        resourceId: user.subscription.id,
        changes: { extendedDays: days, newEnd: newEnd.toISOString() },
        reason,
      },
    });

    return {
      success: true,
      message: `Subscription extended by ${days} days`,
      data: {
        previousEnd: currentEnd.toISOString(),
        newEnd: newEnd.toISOString(),
      },
    };
  }
}

export default AdminService;