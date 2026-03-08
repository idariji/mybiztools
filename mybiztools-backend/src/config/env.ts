import dotenv from 'dotenv';

dotenv.config();

// ENVIRONMENT CONFIG
// Centralised access to all env variables with defaults & validation
export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || 'localhost',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'mybiztools-jwt-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // Email (Resend)
  brevoApiKey: process.env.BREVO_API_KEY || '',
  fromEmail: process.env.FROM_EMAIL || 'noreply@mybiztools.ng',

  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // OTP
  otpExpiresInMinutes: parseInt(process.env.OTP_EXPIRES_MINUTES || '10', 10),
} as const;

// VALIDATE ENV ON STARTUP
export const validateEnv = (): void => {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!process.env.DATABASE_URL) errors.push('DATABASE_URL is required');

  if (env.nodeEnv === 'production') {
    if (!process.env.JWT_SECRET || env.jwtSecret.includes('change-in-production')) {
      errors.push('JWT_SECRET must be a secure value in production');
    }
    if (!process.env.FRONTEND_URL || env.frontendUrl.includes('yourdomain')) {
      errors.push('FRONTEND_URL must be set to your actual domain in production');
    }
  }

  if (!env.brevoApiKey) {
    warnings.push('RESEND_API_KEY is missing — emails will not be sent');
  }

  if (warnings.length) {
    console.warn('\n Environment Warnings:');
    warnings.forEach((w) => console.warn(`   - ${w}`));
  }

  if (errors.length) {
    if (env.nodeEnv === 'production') {
      console.error('\n Critical Environment Errors:');
      errors.forEach((e) => console.error(`   - ${e}`));
      process.exit(1);
    } else {
      console.warn('\n Environment Issues (critical in production):');
      errors.forEach((e) => console.warn(`   - ${e}`));
    }
  }
};