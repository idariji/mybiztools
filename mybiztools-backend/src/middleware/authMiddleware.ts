import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';
import prisma from '../lib/prisma.js';

// Export Request as AuthenticatedRequest for backward compatibility
// The Express Request type is extended globally below with user and admin properties
export type AuthenticatedRequest = Request;

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        businessName: string | null;
        emailVerified: boolean;
        current_plan: string;
        subscription_status: string;
      };
      admin?: {
        id: string;
        email: string;
        name: string;
        role: string;
      };
    }
  }
}

// JWT Authentication middleware for regular users
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        error: 'NO_TOKEN',
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = AuthService.verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        error: 'INVALID_TOKEN',
      });
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        businessName: true,
        emailVerified: true,
        current_plan: true,
        subscription_status: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND',
      });
    }

    // Check if user is suspended
    if (user.subscription_status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
        error: 'ACCOUNT_SUSPENDED',
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: 'AUTH_ERROR',
    });
  }
};

// Optional authentication - doesn't fail if no token, just sets user if valid
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = AuthService.verifyToken(token);

    if (!decoded) {
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        businessName: true,
        emailVerified: true,
        current_plan: true,
        subscription_status: true,
      },
    });

    if (user && user.subscription_status !== 'suspended') {
      req.user = user;
    }

    next();
  } catch (error) {
    // Don't fail on optional auth errors
    next();
  }
};

// Require email verification
export const requireVerifiedEmail = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: 'NOT_AUTHENTICATED',
    });
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email address to access this resource',
      error: 'EMAIL_NOT_VERIFIED',
    });
  }

  next();
};

/** Normalise stored plan string to a canonical tier */
function normalisePlan(plan: string | null | undefined): string {
  if (!plan) return 'free';
  const p = plan.toLowerCase().trim();
  if (p === 'enterprise' || p === 'enterprise_suite' || p === 'enterprise suite') return 'enterprise';
  if (p === 'pro' || p === 'business_pro' || p === 'business pro') return 'pro';
  if (p === 'starter') return 'starter';
  return 'free';
}

// Require specific plan tier(s). Pass canonical tier names: 'starter', 'pro', 'enterprise'
export const requirePlan = (...allowedPlans: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED',
      });
    }

    const tier = normalisePlan(req.user.current_plan);
    if (!allowedPlans.includes(tier)) {
      return res.status(403).json({
        success: false,
        message: `This feature requires one of the following plans: ${allowedPlans.join(', ')}`,
        error: 'PLAN_REQUIRED',
        requiredPlans: allowedPlans,
        currentPlan: tier,
      });
    }

    next();
  };
};

// Admin authentication middleware
export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        error: 'NO_TOKEN',
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = AuthService.verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        error: 'INVALID_TOKEN',
      });
    }

    // Fetch admin from database
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is_active: true,
      },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found',
        error: 'ADMIN_NOT_FOUND',
      });
    }

    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Admin account is deactivated',
        error: 'ADMIN_DEACTIVATED',
      });
    }

    // Attach admin to request
    req.admin = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: 'AUTH_ERROR',
    });
  }
};

// Require specific admin role
export const requireAdminRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required',
        error: 'NOT_AUTHENTICATED',
      });
    }

    // Super admin can do everything
    if (req.admin.role === 'super_admin') {
      return next();
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        error: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: allowedRoles,
        currentRole: req.admin.role,
      });
    }

    next();
  };
};

export default {
  authenticateUser,
  optionalAuth,
  requireVerifiedEmail,
  requirePlan,
  authenticateAdmin,
  requireAdminRole,
};
