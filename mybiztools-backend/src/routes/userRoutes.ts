import { Router, Response } from 'express';
import { UserService } from '../services/userService.js';
import { AuthService } from '../services/authService.js';
import { SupportService } from '../services/supportService.js';
import { authenticateUser, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();

// All routes require authentication
router.use(authenticateUser);

// GET /api/users/profile
router.get('/profile', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await UserService.getProfile(req.user!.id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get profile route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// PUT /api/users/profile
router.put('/profile', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { firstName, lastName, businessName, phone, avatar_url } = req.body;

    const result = await UserService.updateProfile(req.user!.id, {
      firstName,
      lastName,
      businessName,
      phone,
      avatar_url,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Update profile route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// PUT /api/users/avatar
router.put('/avatar', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { avatar_url } = req.body;

    if (!avatar_url) {
      return res.status(400).json({
        success: false,
        message: 'Avatar URL is required',
        error: 'MISSING_AVATAR_URL',
      });
    }

    const result = await UserService.updateAvatar(req.user!.id, avatar_url);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Update avatar route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// PUT /api/users/password
router.put('/password', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
        error: 'MISSING_FIELDS',
      });
    }

    const result = await UserService.changePassword(
      req.user!.id,
      currentPassword,
      newPassword,
      AuthService.hashPassword,
      AuthService.comparePassword
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Change password route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// GET /api/users/subscription
router.get('/subscription', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await UserService.getSubscription(req.user!.id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get subscription route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// GET /api/users/payments
router.get('/payments', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page, limit } = req.query;

    const result = await UserService.getPaymentHistory(
      req.user!.id,
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 20
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get payments route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// DELETE /api/users/account
router.delete('/account', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account',
        error: 'MISSING_PASSWORD',
      });
    }

    // Verify password before deleting
    const user = await AuthService.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND',
      });
    }

    const result = await UserService.deleteAccount(req.user!.id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Delete account route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// ============ SUPPORT TICKET ROUTES ============

// POST /api/users/support/ticket - Create a support ticket
router.post('/support/ticket', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { subject, message, priority } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required',
        error: 'MISSING_FIELDS',
      });
    }

    // Get user details
    const userResult = await UserService.getProfile(req.user!.id);
    if (!userResult.success || !userResult.data) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND',
      });
    }

    const user = userResult.data.user;
    const customerName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.businessName || 'User';

    const result = await SupportService.createTicket({
      userId: req.user!.id,
      subject,
      message,
      customerName,
      customerEmail: user.email,
      customerPhone: user.phone || undefined,
      channel: 'in_app',
      priority: priority || 'medium',
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error('Create support ticket route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// GET /api/users/support/tickets - Get user's support tickets
router.get('/support/tickets', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Use a custom query to get only this user's tickets
    const result = await SupportService.getTickets({
      search: req.user!.email, // Filter by user's email
      page: 1,
      limit: 50,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get support tickets route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

export default router;
