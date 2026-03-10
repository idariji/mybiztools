import prisma from '../lib/prisma.js';
import { env } from '../config/env.js';

// OTP SERVICE
// Generates, stores, and verifies 6-digit OTPs
export class OtpService {
  /** Generate a random 6-digit OTP */
  static generate(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /** Expiry timestamp based on env config */
  static expiresAt(): Date {
    return new Date(Date.now() + env.otpExpiresInMinutes * 60 * 1000);
  }

  /**
   * Save OTP to user record.
   * Overwrites any existing OTP so only the latest one is valid.
   */
  static async save(
    userId: string,
    otp: string,
    purpose: 'email_verification' | 'password_reset'
  ): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        otpCode: otp,
        otpExpires: this.expiresAt(),
        otpPurpose: purpose,
      },
    });
  }

  /**
   * Verify an OTP.
   * Returns the matching user or null if invalid/expired.
   */
  static async verify(
    email: string,
    otp: string,
    purpose: 'email_verification' | 'password_reset'
  ): Promise<{ id: string; email: string; firstName: string | null } | null> {
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        otpCode: otp,
        otpPurpose: purpose,
        otpExpires: { gt: new Date() },
      },
      select: { id: true, email: true, firstName: true },
    });

    return user ?? null;
  }

  /** Clear OTP fields after successful use */
  static async clear(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { otpCode: null, otpExpires: null, otpPurpose: null },
    });
  }
}