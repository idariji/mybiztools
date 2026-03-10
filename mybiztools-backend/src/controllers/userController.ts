import { Request, Response } from 'express';
import { UserService } from '../services/userService.js';
import { AuthService } from '../services/authService.js';

// ============================================================================
// USER CONTROLLER
// Handles HTTP layer only — all logic lives in UserService
// ============================================================================

export class UserController {
  /** GET /api/users/profile */
  static async getProfile(req: Request, res: Response): Promise<void> {
    const result = await UserService.getProfile(req.user!.id);
    res.status(result.success ? 200 : 404).json(result);
  }

  /** PUT /api/users/profile */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    const result = await UserService.updateProfile(req.user!.id, req.body);
    res.status(result.success ? 200 : 400).json(result);
  }

  /** PUT /api/users/avatar */
  static async updateAvatar(req: Request, res: Response): Promise<void> {
    const result = await UserService.updateAvatar(req.user!.id, req.body.avatarUrl);
    res.status(result.success ? 200 : 400).json(result);
  }

  /** PUT /api/users/password */
  static async changePassword(req: Request, res: Response): Promise<void> {
    const { currentPassword, newPassword } = req.body;
    const result = await UserService.changePassword(
      req.user!.id,
      currentPassword,
      newPassword,
      AuthService.hashPassword,
      AuthService.comparePassword
    );
    res.status(result.success ? 200 : 400).json(result);
  }

  /** GET /api/users/subscription */
  static async getSubscription(req: Request, res: Response): Promise<void> {
    const result = await UserService.getSubscription(req.user!.id);
    res.status(result.success ? 200 : 400).json(result);
  }

  /** GET /api/users/payments */
  static async getPaymentHistory(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const result = await UserService.getPaymentHistory(req.user!.id, page, limit);
    res.status(result.success ? 200 : 400).json(result);
  }

  /** DELETE /api/users/account */
  static async deleteAccount(req: Request, res: Response): Promise<void> {
    // Verify the user still exists before deleting
    const user = await AuthService.getUserById(req.user!.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found', error: 'USER_NOT_FOUND' });
      return;
    }

    const result = await UserService.deleteAccount(req.user!.id);
    res.status(result.success ? 200 : 400).json(result);
  }
}