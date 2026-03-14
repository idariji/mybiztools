// import bcrypt from 'bcryptjs';
// import jwt, { SignOptions } from 'jsonwebtoken';
// import { v4 as uuidv4 } from 'uuid';
// import prisma from '../lib/prisma.js';
// import { EmailNotificationService } from './emailNotificationService.js';

// const JWT_SECRET = process.env.JWT_SECRET || 'mybiztools-jwt-secret-change-in-production';
// const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

// export interface RegisterInput {
//   email: string;
//   password: string;
//   firstName?: string;
//   lastName?: string;
//   businessName?: string;
//   phone?: string;
// }

// export interface LoginInput {
//   email: string;
//   password: string;
// }

// export interface AuthResponse {
//   success: boolean;
//   message: string;
//   data?: {
//     user: {
//       id: string;
//       email: string;
//       firstName: string | null;
//       lastName: string | null;
//       businessName: string | null;
//       emailVerified: boolean;
//       current_plan: string;
//     };
//     token: string;
//   };
//   error?: string;
// }

// export class AuthService {
//   // Hash password
//   static async hashPassword(password: string): Promise<string> {
//     const salt = await bcrypt.genSalt(12);
//     return bcrypt.hash(password, salt);
//   }

//   // Compare password with hash
//   static async comparePassword(password: string, hash: string): Promise<boolean> {
//     return bcrypt.compare(password, hash);
//   }

//   // Generate JWT token
//   static generateToken(userId: string, email: string): string {
//     return jwt.sign(
//       { userId, email },
//       JWT_SECRET,
//       { expiresIn: JWT_EXPIRES_IN }
//     );
//   }

//   // Verify JWT token
//   static verifyToken(token: string): { userId: string; email: string } | null {
//     try {
//       const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
//       return decoded;
//     } catch {
//       return null;
//     }
//   }

//   // Generate verification token
//   static generateVerificationToken(): string {
//     return uuidv4();
//   }

//   // Register new user
//   static async register(input: RegisterInput): Promise<AuthResponse> {
//     try {
//       // Check if user already exists
//       const existingUser = await prisma.user.findUnique({
//         where: { email: input.email.toLowerCase() },
//       });

//       if (existingUser) {
//         return {
//           success: false,
//           message: 'An account with this email already exists',
//           error: 'EMAIL_EXISTS',
//         };
//       }

//       // Validate password strength
//       if (input.password.length < 8) {
//         return {
//           success: false,
//           message: 'Password must be at least 8 characters long',
//           error: 'WEAK_PASSWORD',
//         };
//       }

//       // Hash password
//       const hashedPassword = await this.hashPassword(input.password);

//       // Generate verification token
//       const verificationToken = this.generateVerificationToken();
//       const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

//       // Create user
//       const user = await prisma.user.create({
//         data: {
//           email: input.email.toLowerCase(),
//           password: hashedPassword,
//           firstName: input.firstName,
//           lastName: input.lastName,
//           businessName: input.businessName,
//           phone: input.phone,
//           verificationToken,
//           verificationExpires,
//           current_plan: 'free',
//           subscription_status: 'active',
//         },
//       });

//       // Generate JWT token
//       const token = this.generateToken(user.id, user.email);

//       // Send verification email (don't await - send in background)
//       EmailNotificationService.sendVerificationEmail(
//         user.email,
//         user.firstName,
//         verificationToken
//       ).catch(err => console.error('Failed to send verification email:', err));

//       return {
//         success: true,
//         message: 'Account created successfully. Please check your email to verify your account.',
//         data: {
//           user: {
//             id: user.id,
//             email: user.email,
//             firstName: user.firstName,
//             lastName: user.lastName,
//             businessName: user.businessName,
//             emailVerified: user.emailVerified,
//             current_plan: user.current_plan,
//           },
//           token,
//         },
//       };
//     } catch (error) {
//       console.error('Registration error:', error);
//       return {
//         success: false,
//         message: 'Failed to create account. Please try again.',
//         error: 'REGISTRATION_FAILED',
//       };
//     }
//   }

//   // Login user
//   static async login(input: LoginInput): Promise<AuthResponse> {
//     try {
//       // Find user by email
//       const user = await prisma.user.findUnique({
//         where: { email: input.email.toLowerCase() },
//       });

//       if (!user) {
//         return {
//           success: false,
//           message: 'Invalid email or password',
//           error: 'INVALID_CREDENTIALS',
//         };
//       }

//       // Check password
//       const isValidPassword = await this.comparePassword(input.password, user.password);

//       if (!isValidPassword) {
//         return {
//           success: false,
//           message: 'Invalid email or password',
//           error: 'INVALID_CREDENTIALS',
//         };
//       }

//       // Update last login
//       await prisma.user.update({
//         where: { id: user.id },
//         data: { last_login_at: new Date() },
//       });

//       // Generate JWT token
//       const token = this.generateToken(user.id, user.email);

//       return {
//         success: true,
//         message: 'Login successful',
//         data: {
//           user: {
//             id: user.id,
//             email: user.email,
//             firstName: user.firstName,
//             lastName: user.lastName,
//             businessName: user.businessName,
//             emailVerified: user.emailVerified,
//             current_plan: user.current_plan,
//           },
//           token,
//         },
//       };
//     } catch (error) {
//       console.error('Login error:', error);
//       return {
//         success: false,
//         message: 'Failed to login. Please try again.',
//         error: 'LOGIN_FAILED',
//       };
//     }
//   }

//   // Verify email
//   static async verifyEmail(token: string): Promise<{ success: boolean; message: string; error?: string }> {
//     try {
//       const user = await prisma.user.findFirst({
//         where: {
//           verificationToken: token,
//           verificationExpires: { gt: new Date() },
//         },
//       });

//       if (!user) {
//         return {
//           success: false,
//           message: 'Invalid or expired verification token',
//           error: 'INVALID_TOKEN',
//         };
//       }

//       await prisma.user.update({
//         where: { id: user.id },
//         data: {
//           emailVerified: true,
//           verificationToken: null,
//           verificationExpires: null,
//         },
//       });

//       // Send welcome email after successful verification
//       EmailNotificationService.sendWelcomeEmail(
//         user.email,
//         user.firstName
//       ).catch(err => console.error('Failed to send welcome email:', err));

//       return {
//         success: true,
//         message: 'Email verified successfully',
//       };
//     } catch (error) {
//       console.error('Email verification error:', error);
//       return {
//         success: false,
//         message: 'Failed to verify email. Please try again.',
//         error: 'VERIFICATION_FAILED',
//       };
//     }
//   }

//   // Request password reset
//   static async requestPasswordReset(email: string): Promise<{ success: boolean; message: string; resetToken?: string; error?: string }> {
//     try {
//       const user = await prisma.user.findUnique({
//         where: { email: email.toLowerCase() },
//       });

//       if (!user) {
//         // Return success even if user doesn't exist (security best practice)
//         return {
//           success: true,
//           message: 'If an account exists with this email, a reset link will be sent.',
//         };
//       }

//       const resetToken = this.generateVerificationToken();
//       const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

//       await prisma.user.update({
//         where: { id: user.id },
//         data: {
//           resetToken,
//           resetTokenExpires,
//         },
//       });

//       // Send password reset email
//       EmailNotificationService.sendPasswordResetEmail(
//         user.email,
//         user.firstName,
//         resetToken
//       ).catch(err => console.error('Failed to send password reset email:', err));

//       return {
//         success: true,
//         message: 'If an account exists with this email, a reset link will be sent.',
//       };
//     } catch (error) {
//       console.error('Password reset request error:', error);
//       return {
//         success: false,
//         message: 'Failed to process password reset request.',
//         error: 'RESET_REQUEST_FAILED',
//       };
//     }
//   }

//   // Reset password
//   static async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string; error?: string }> {
//     try {
//       if (newPassword.length < 8) {
//         return {
//           success: false,
//           message: 'Password must be at least 8 characters long',
//           error: 'WEAK_PASSWORD',
//         };
//       }

//       const user = await prisma.user.findFirst({
//         where: {
//           resetToken: token,
//           resetTokenExpires: { gt: new Date() },
//         },
//       });

//       if (!user) {
//         return {
//           success: false,
//           message: 'Invalid or expired reset token',
//           error: 'INVALID_TOKEN',
//         };
//       }

//       const hashedPassword = await this.hashPassword(newPassword);

//       await prisma.user.update({
//         where: { id: user.id },
//         data: {
//           password: hashedPassword,
//           resetToken: null,
//           resetTokenExpires: null,
//         },
//       });

//       return {
//         success: true,
//         message: 'Password reset successfully',
//       };
//     } catch (error) {
//       console.error('Password reset error:', error);
//       return {
//         success: false,
//         message: 'Failed to reset password. Please try again.',
//         error: 'RESET_FAILED',
//       };
//     }
//   }

//   // Resend verification email
//   static async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string; error?: string }> {
//     try {
//       const user = await prisma.user.findUnique({
//         where: { email: email.toLowerCase() },
//       });

//       if (!user) {
//         return {
//           success: false,
//           message: 'No account found with this email address',
//           error: 'USER_NOT_FOUND',
//         };
//       }

//       if (user.emailVerified) {
//         return {
//           success: false,
//           message: 'Email is already verified',
//           error: 'ALREADY_VERIFIED',
//         };
//       }

//       // Generate new verification token
//       const verificationToken = this.generateVerificationToken();
//       const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

//       await prisma.user.update({
//         where: { id: user.id },
//         data: {
//           verificationToken,
//           verificationExpires,
//         },
//       });

//       // Send verification email
//       try {
//         await EmailNotificationService.sendVerificationEmail(
//           user.email,
//           user.firstName,
//           verificationToken
//         );
//         return {
//           success: true,
//           message: 'Verification email sent successfully. Please check your inbox.',
//         };
//       } catch (emailError) {
//         console.error('Failed to send verification email:', emailError);
//         return {
//           success: false,
//           message: 'Failed to send verification email. Please try again later.',
//           error: 'EMAIL_SEND_FAILED',
//         };
//       }
//     } catch (error) {
//       console.error('Resend verification error:', error);
//       return {
//         success: false,
//         message: 'Failed to resend verification email. Please try again.',
//         error: 'RESEND_FAILED',
//       };
//     }
//   }

//   // Get user by ID
//   static async getUserById(userId: string) {
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
//         },
//       });

//       return user;
//     } catch (error) {
//       console.error('Get user error:', error);
//       return null;
//     }
//   }
// }

// export default AuthService;


import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { env } from '../config/env.js';
import { OtpService } from './otpService.js';
import { EmailNotificationService } from './emailNotificationService.js';
import type {
  RegisterInput,
  LoginInput,
  ServiceResponse,
  AuthResponseData,
  JwtPayload,
  AuthUserPayload,
} from '../types/index.js';

// AUTH SERVICE
export class AuthService {
  // PASSWORD HELPER
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async comparePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  // JWT HELPERS
  static generateToken(userId: string, email: string): string {
    return jwt.sign(
      { userId, email } satisfies JwtPayload,
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn } as SignOptions
    );
  }

  static verifyToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, env.jwtSecret) as JwtPayload;
    } catch {
      return null;
    }
  }

  // REGISTER
  static async register(input: RegisterInput): Promise<ServiceResponse<AuthResponseData>> {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existing) {
      return { success: false, message: 'An account with this email already exists', error: 'EMAIL_EXISTS' };
    }

    const hashedPassword = await this.hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        password: hashedPassword,
        firstName: input.firstName,
        lastName: input.lastName,
        businessName: input.businessName,
        phone: input.phone,
        currentPlan: 'free',
        subscriptionStatus: 'active',
      },
    });

    // Generate and send OTP for email verification
    const otp = OtpService.generate();
    await OtpService.save(user.id, otp, 'email_verification');

    EmailNotificationService.sendOtpEmail(user.email, user.firstName, otp, 'email_verification').catch(
      (err) => console.error('[Auth] Failed to send verification OTP:', err)
    );

    const token = this.generateToken(user.id, user.email);

    return {
      success: true,
      message: 'Account created. Please check your email for the OTP to verify your account.',
      data: {
        user: this.toUserPayload(user),
        token,
      },
    };
  }

  // LOGIN
  static async login(input: LoginInput): Promise<ServiceResponse<AuthResponseData>> {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user || !(await this.comparePassword(input.password, user.password))) {
      return { success: false, message: 'Invalid email or password', error: 'INVALID_CREDENTIALS' };
    }

    if (user.subscriptionStatus === 'suspended') {
      return { success: false, message: 'Your account has been suspended. Please contact support.', error: 'ACCOUNT_SUSPENDED' };
    }

    // Fire-and-forget — don't let a column mismatch break login
    prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }).catch(
      (err) => console.warn('[Auth] lastLoginAt update failed:', err?.message)
    );

    const token = this.generateToken(user.id, user.email);

    return {
      success: true,
      message: 'Login successful',
      data: { user: this.toUserPayload(user), token },
    };
  }
  // VERIFY EMAIL VIA OTP
  static async verifyEmailOtp(
    email: string,
    otp: string
  ): Promise<ServiceResponse> {
    const user = await OtpService.verify(email, otp, 'email_verification');

    if (!user) {
      return { success: false, message: 'Invalid or expired OTP', error: 'INVALID_OTP' };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    await OtpService.clear(user.id);

    // Fire welcome email in background
    EmailNotificationService.sendWelcomeEmail(user.email, user.firstName).catch(
      (err) => console.error('[Auth] Failed to send welcome email:', err)
    );

    return { success: true, message: 'Email verified successfully' };
  }

  // RESEND VERIFICATION OTP
  static async resendVerificationOtp(email: string): Promise<ServiceResponse> {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user) {
      return { success: false, message: 'No account found with this email', error: 'USER_NOT_FOUND' };
    }

    if (user.emailVerified) {
      return { success: false, message: 'Email is already verified', error: 'ALREADY_VERIFIED' };
    }

    const otp = OtpService.generate();
    await OtpService.save(user.id, otp, 'email_verification');

    await EmailNotificationService.sendOtpEmail(user.email, user.firstName, otp, 'email_verification');

    return { success: true, message: 'Verification OTP sent. Please check your email.' };
  }

  // FORGOT PASSWORD — sends OTP
  static async requestPasswordReset(email: string): Promise<ServiceResponse> {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // Always return success to avoid email enumeration
    if (!user) {
      return { success: true, message: 'If an account exists with this email, an OTP will be sent.' };
    }

    const otp = OtpService.generate();
    await OtpService.save(user.id, otp, 'password_reset');

    EmailNotificationService.sendOtpEmail(user.email, user.firstName, otp, 'password_reset').catch(
      (err) => console.error('[Auth] Failed to send password reset OTP:', err)
    );

    return { success: true, message: 'If an account exists with this email, an OTP will be sent.' };
  }

  // RESET PASSWORD — verifies OTP then sets new password
  static async resetPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<ServiceResponse> {
    const user = await OtpService.verify(email, otp, 'password_reset');

    if (!user) {
      return { success: false, message: 'Invalid or expired OTP', error: 'INVALID_OTP' };
    }

    const hashedPassword = await this.hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await OtpService.clear(user.id);

    return { success: true, message: 'Password reset successfully' };
  }

  // GET USER BY ID
  static async getUserById(userId: string) {
    return prisma.user.findUnique({
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
      },
    });
  }

  // HELPER
  private static toUserPayload(user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    businessName: string | null;
    emailVerified: boolean;
    currentPlan: string;
  }): AuthUserPayload {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      businessName: user.businessName,
      emailVerified: user.emailVerified,
      currentPlan: user.currentPlan,
    };
  }
}

export default AuthService;
