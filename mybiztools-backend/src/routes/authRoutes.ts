// import { Router, Request, Response } from 'express';
// import rateLimit from 'express-rate-limit';
// import { AuthService } from '../services/authService.js';

// const router = Router();

// // Rate limiting for login attempts (5 per 15 minutes per IP)
// const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5,
//   message: {
//     success: false,
//     message: 'Too many login attempts. Please try again in 15 minutes.',
//     error: 'TOO_MANY_ATTEMPTS',
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// // Rate limiting for registration (3 per hour per IP)
// const registerLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour
//   max: 3,
//   message: {
//     success: false,
//     message: 'Too many registration attempts. Please try again later.',
//     error: 'TOO_MANY_ATTEMPTS',
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// // Rate limiting for password reset (3 per 15 minutes per IP)
// const passwordResetLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 3,
//   message: {
//     success: false,
//     message: 'Too many password reset attempts. Please try again later.',
//     error: 'TOO_MANY_ATTEMPTS',
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// // POST /api/auth/register
// router.post('/register', registerLimiter, async (req: Request, res: Response) => {
//   try {
//     const { email, password, firstName, lastName, businessName, phone } = req.body;

//     // Validate required fields
//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email and password are required',
//         error: 'MISSING_FIELDS',
//       });
//     }

//     // Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid email format',
//         error: 'INVALID_EMAIL',
//       });
//     }

//     const result = await AuthService.register({
//       email,
//       password,
//       firstName,
//       lastName,
//       businessName,
//       phone,
//     });

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(201).json(result);
//   } catch (error) {
//     console.error('Register route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // POST /api/auth/login
// router.post('/login', loginLimiter, async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;

//     // Validate required fields
//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email and password are required',
//         error: 'MISSING_FIELDS',
//       });
//     }

//     const result = await AuthService.login({ email, password });

//     if (!result.success) {
//       return res.status(401).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Login route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // POST /api/auth/verify
// router.post('/verify', async (req: Request, res: Response) => {
//   try {
//     const { token } = req.body;

//     if (!token) {
//       return res.status(400).json({
//         success: false,
//         message: 'Verification token is required',
//         error: 'MISSING_TOKEN',
//       });
//     }

//     const result = await AuthService.verifyEmail(token);

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Verify route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // GET /api/auth/verify/:token (alternative for email links)
// router.get('/verify/:token', async (req: Request, res: Response) => {
//   try {
//     const { token } = req.params;

//     const result = await AuthService.verifyEmail(token);

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Verify route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // POST /api/auth/forgot
// router.post('/forgot', passwordResetLimiter, async (req: Request, res: Response) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email is required',
//         error: 'MISSING_EMAIL',
//       });
//     }

//     const result = await AuthService.requestPasswordReset(email);

//     // Always return 200 for security (don't reveal if email exists)
//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Forgot password route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // POST /api/auth/reset
// router.post('/reset', passwordResetLimiter, async (req: Request, res: Response) => {
//   try {
//     const { token, password } = req.body;

//     if (!token || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Token and new password are required',
//         error: 'MISSING_FIELDS',
//       });
//     }

//     const result = await AuthService.resetPassword(token, password);

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Reset password route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // POST /api/auth/resend-verification
// router.post('/resend-verification', async (req: Request, res: Response) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email is required',
//         error: 'MISSING_EMAIL',
//       });
//     }

//     const result = await AuthService.resendVerificationEmail(email);

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Resend verification route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // GET /api/auth/me (get current user - requires auth middleware)
// router.get('/me', async (req: Request, res: Response) => {
//   try {
//     // Get token from Authorization header
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({
//         success: false,
//         message: 'No token provided',
//         error: 'NO_TOKEN',
//       });
//     }

//     const token = authHeader.replace('Bearer ', '');
//     const decoded = AuthService.verifyToken(token);

//     if (!decoded) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid or expired token',
//         error: 'INVALID_TOKEN',
//       });
//     }

//     const user = await AuthService.getUserById(decoded.userId);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found',
//         error: 'USER_NOT_FOUND',
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: { user },
//     });
//   } catch (error) {
//     console.error('Get me route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// export default router;


import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import {
  registerSchema,
  loginSchema,
  emailSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from '../validators/authValidator.js';

// RATE LIMITERS
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.', error: 'TOO_MANY_ATTEMPTS' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { success: false, message: 'Too many registration attempts. Try again later.', error: 'TOO_MANY_ATTEMPTS' },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many OTP attempts. Try again later.', error: 'TOO_MANY_ATTEMPTS' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

// SWAGGER DOCS

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       429:
 *         description: Too many registration attempts
 */
router.post('/register', registerLimiter, validate(registerSchema), AuthController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Too many login attempts
 */
router.post('/login', loginLimiter, validate(loginSchema), AuthController.login);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify email using OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOtpRequest'
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/verify-otp', otpLimiter, validate(verifyOtpSchema), AuthController.verifyOtp);

/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     summary: Resend email verification OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResendOtpRequest'
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: User not found or already verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/resend-otp', otpLimiter, validate(emailSchema), AuthController.resendOtp);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a password reset OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: OTP sent if account exists (always returns 200 for security)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post('/forgot-password', otpLimiter, validate(emailSchema), AuthController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/reset-password', otpLimiter, validate(resetPasswordSchema), AuthController.resetPassword);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: No token or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/me', AuthController.me);

export default router;