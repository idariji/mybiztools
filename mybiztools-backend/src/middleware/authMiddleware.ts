import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';
import prisma from '../lib/prisma.js';

// AUGMENT EXPRESS REQUEST
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
        currentPlan: string;
        subscriptionStatus: string;
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

// USER AUTH
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'No token provided', error: 'NO_TOKEN' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = AuthService.verifyToken(token);

    if (!decoded) {
      res.status(401).json({ success: false, message: 'Invalid or expired token', error: 'INVALID_TOKEN' });
      return;
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
        currentPlan: true,
        subscriptionStatus: true,
      },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'User not found', error: 'USER_NOT_FOUND' });
      return;
    }

    if (user.subscriptionStatus === 'suspended') {
      res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
        error: 'ACCOUNT_SUSPENDED',
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ success: false, message: 'Authentication error', error: 'AUTH_ERROR' });
  }
};

// OPTIONAL AUTH (doesn't reject — just attaches user if token is valid)
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return next();

    const decoded = AuthService.verifyToken(token);
    if (!decoded) return next();

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        businessName: true,
        emailVerified: true,
        currentPlan: true,
        subscriptionStatus: true,
      },
    });

    if (user && user.subscriptionStatus !== 'suspended') {
      req.user = user;
    }
  } catch {
    // Silent fail for optional auth
  }
  next();
};

// REQUIRE VERIFIED EMAIL
export const requireVerifiedEmail = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required', error: 'NOT_AUTHENTICATED' });
    return;
  }
  if (!req.user.emailVerified) {
    res.status(403).json({
      success: false,
      message: 'Please verify your email address to access this resource',
      error: 'EMAIL_NOT_VERIFIED',
    });
    return;
  }
  next();
};

// REQUIRE PLAN
export const requirePlan =
  (...allowedPlans: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required', error: 'NOT_AUTHENTICATED' });
      return;
    }
    if (!allowedPlans.includes(req.user.currentPlan)) {
      res.status(403).json({
        success: false,
        message: `This feature requires one of the following plans: ${allowedPlans.join(', ')}`,
        error: 'PLAN_REQUIRED',
        requiredPlans: allowedPlans,
        currentPlan: req.user.currentPlan,
      });
      return;
    }
    next();
  };

// ADMIN AUTH
export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'No token provided', error: 'NO_TOKEN' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = AuthService.verifyToken(token);

    if (!decoded) {
      res.status(401).json({ success: false, message: 'Invalid or expired token', error: 'INVALID_TOKEN' });
      return;
    }

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!admin) {
      res.status(401).json({ success: false, message: 'Admin not found', error: 'ADMIN_NOT_FOUND' });
      return;
    }

    req.admin = { id: admin.id, email: admin.email, name: admin.name, role: admin.role };
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ success: false, message: 'Authentication error', error: 'AUTH_ERROR' });
  }
};


// REQUIRE ADMIN ROLE
export const requireAdminRole =
  (...allowedRoles: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({ success: false, message: 'Admin authentication required', error: 'NOT_AUTHENTICATED' });
      return;
    }
    if (req.admin.role === 'super_admin') return next(); // Super admin bypasses all role checks

    if (!allowedRoles.includes(req.admin.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        error: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: allowedRoles,
        currentRole: req.admin.role,
      });
      return;
    }
    next();
  };