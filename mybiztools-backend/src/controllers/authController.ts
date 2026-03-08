import { Request, Response } from 'express';
import { AuthService } from '../services/authService.js';

// AUTH CONTROLLER
// Handles HTTP layer only — all logic lives in AuthService
export class AuthController {
  /** POST /api/auth/register */
  static async register(req: Request, res: Response): Promise<void> {
    const result = await AuthService.register(req.body);
    res.status(result.success ? 201 : 400).json(result);
  }

  /** POST /api/auth/login */
  static async login(req: Request, res: Response): Promise<void> {
    const result = await AuthService.login(req.body);
    res.status(result.success ? 200 : 401).json(result);
  }

  /** POST /api/auth/verify-otp */
  static async verifyOtp(req: Request, res: Response): Promise<void> {
    const { email, otp, purpose } = req.body;
    const result = await AuthService.verifyEmailOtp(email, otp);
    res.status(result.success ? 200 : 400).json(result);
  }

  /** POST /api/auth/resend-otp */
  static async resendOtp(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    const result = await AuthService.resendVerificationOtp(email);
    res.status(result.success ? 200 : 400).json(result);
  }

  /** POST /api/auth/forgot-password */
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    // Always 200 to avoid email enumeration
    const result = await AuthService.requestPasswordReset(email);
    res.status(200).json(result);
  }

  /** POST /api/auth/reset-password */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    const { email, otp, password } = req.body;
    const result = await AuthService.resetPassword(email, otp, password);
    res.status(result.success ? 200 : 400).json(result);
  }

  /** GET /api/auth/me */
  static async me(req: Request, res: Response): Promise<void> {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'No token provided', error: 'NO_TOKEN' });
      return;
    }

    const decoded = AuthService.verifyToken(authHeader.replace('Bearer ', ''));
    if (!decoded) {
      res.status(401).json({ success: false, message: 'Invalid or expired token', error: 'INVALID_TOKEN' });
      return;
    }

    const user = await AuthService.getUserById(decoded.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found', error: 'USER_NOT_FOUND' });
      return;
    }

    res.status(200).json({ success: true, data: { user } });
  }
}