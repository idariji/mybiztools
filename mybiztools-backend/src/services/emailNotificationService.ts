/**
 * Email Notification Service
 * Handles transactional emails via Resend
 *
 * Get your API key from: https://resend.com/api-keys
 */

import { Resend } from 'resend';

// Email configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'MyBizTools <onboarding@resend.dev>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Create Resend client
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailNotificationService {
  /**
   * Send email via Resend
   */
  private static async sendEmail(
    options: EmailOptions
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!resend || !RESEND_API_KEY) {
        console.error('❌ Resend API key not configured');
        console.error('   Please set RESEND_API_KEY in your .env file');
        console.error('   Get your API key from: https://resend.com/api-keys');
        return { success: false, error: 'Email service not configured' };
      }

      console.log(`📧 Sending email via Resend to ${options.to}...`);

      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      if (error) {
        console.error(`❌ Resend error:`, error.message);
        return { success: false, error: error.message };
      }

      console.log(`✅ Email sent to ${options.to}: ${options.subject} (ID: ${data?.id})`);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Email failed:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Generate email verification HTML (sent after registration)
   */
  private static generateVerificationHtml(name: string, verificationLink: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Verify Your Email</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">Thanks for signing up for MyBizTools! Please verify your email address to activate your account.</p>
              <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">Click the button below to verify:</p>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="${verificationLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">Verify Email Address</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 30px 0 20px; color: #6b7280; font-size: 14px;">Or copy and paste this link in your browser:</p>
              <p style="margin: 0 0 20px; color: #3b82f6; font-size: 14px; word-break: break-all;">${verificationLink}</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">This link expires in 24 hours.</p>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">MyBizTools - Business Made Simple</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  /**
   * Send verification email to new user (after registration)
   */
  static async sendVerificationEmail(
    email: string,
    firstName: string | null,
    verificationToken: string
  ): Promise<{ success: boolean; error?: string }> {
    const name = firstName || 'there';
    const verificationLink = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;

    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email - MyBizTools',
      html: this.generateVerificationHtml(name, verificationLink),
    });
  }

  /**
   * Generate welcome email HTML (sent after email verification)
   */
  private static generateWelcomeHtml(name: string, dashboardLink: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Welcome to MyBizTools!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="font-size: 48px;">🎉</span>
              </div>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">Your email has been verified and your account is now active! We're excited to have you on board.</p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">MyBizTools is designed to help Nigerian businesses manage their operations efficiently. Here's what you can do:</p>
              <ul style="margin: 0 0 30px; padding-left: 20px; color: #374151; font-size: 14px; line-height: 2;">
                <li><strong>Create Professional Documents</strong> - Invoices, quotations, receipts, and payslips</li>
                <li><strong>Track Expenses</strong> - Monitor your business spending</li>
                <li><strong>Calculate Taxes</strong> - PAYE, VAT, WHT calculations made easy</li>
                <li><strong>Chat with DEDA</strong> - Your AI-powered business assistant</li>
              </ul>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="${dashboardLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">Go to Dashboard</a>
                  </td>
                </tr>
              </table>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: center;">Need help? Reply to this email or visit our help center.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">MyBizTools - Business Made Simple</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  /**
   * Send welcome email (after email verification succeeds)
   */
  static async sendWelcomeEmail(
    email: string,
    firstName: string | null
  ): Promise<{ success: boolean; error?: string }> {
    const name = firstName || 'there';
    const dashboardLink = `${FRONTEND_URL}/dashboard`;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to MyBizTools! 🎉',
      html: this.generateWelcomeHtml(name, dashboardLink),
    });
  }

  /**
   * Generate password reset email HTML
   */
  private static generatePasswordResetHtml(name: string, resetLink: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Reset Your Password</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">We received a request to reset your password. Click the button below to create a new password:</p>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${resetLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">Reset Password</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 20px 0; color: #6b7280; font-size: 14px;">Or copy this link: ${resetLink}</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="margin: 0 0 10px; color: #ef4444; font-size: 14px;"><strong>Important:</strong> This link expires in 1 hour.</p>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">MyBizTools - Business Made Simple</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(
    email: string,
    firstName: string | null,
    resetToken: string
  ): Promise<{ success: boolean; error?: string }> {
    const name = firstName || 'there';
    const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

    return this.sendEmail({
      to: email,
      subject: 'Reset Your MyBizTools Password',
      html: this.generatePasswordResetHtml(name, resetLink),
    });
  }

  /**
   * Send a custom email (for support tickets, etc.)
   */
  static async sendCustomEmail(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail(options);
  }
}

export default EmailNotificationService;
