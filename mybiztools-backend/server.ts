import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import { Resend } from 'resend';
import cors from 'cors';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Load environment variables
dotenv.config();

// ============ ENVIRONMENT VALIDATION ============
const validateEnvironment = () => {
  const requiredVars: { name: string; critical: boolean }[] = [
    { name: 'JWT_SECRET', critical: true },
    { name: 'DATABASE_URL', critical: true },
  ];

  const warnings: string[] = [];
  const errors: string[] = [];

  // Check for weak default values in production
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('change-in-production')) {
      errors.push('JWT_SECRET must be set to a secure value in production');
    }
    if (!process.env.FRONTEND_URL || process.env.FRONTEND_URL === 'https://yourdomain.com') {
      errors.push('FRONTEND_URL must be set to your actual domain in production');
    }
  }

  // Check for email configuration
  const hasResend = !!process.env.RESEND_API_KEY;
  if (!hasResend) {
    warnings.push('No email provider configured (RESEND_API_KEY is missing)');
  }

  // Log warnings
  if (warnings.length > 0) {
    console.log('\n⚠️  Environment Warnings:');
    warnings.forEach(w => console.log(`   - ${w}`));
  }

  // Exit on critical errors in production
  if (errors.length > 0 && process.env.NODE_ENV === 'production') {
    console.error('\n❌ Critical Environment Errors:');
    errors.forEach(e => console.error(`   - ${e}`));
    console.error('\n   Server cannot start in production with these issues.');
    process.exit(1);
  } else if (errors.length > 0) {
    console.log('\n⚠️  Environment Issues (would be critical in production):');
    errors.forEach(e => console.log(`   - ${e}`));
  }
};

// Validate environment on startup
validateEnvironment();

// Import routes
import authRoutes from './src/routes/authRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import smsRoutes from './src/routes/smsRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import documentRoutes from './src/routes/documentRoutes.js';
import budgetRoutes from './src/routes/budgetRoutes.js';
import contactRoutes from './src/routes/contactRoutes.js';
import paymentGatewayRoutes from './src/routes/paymentGatewayRoutes.js';
import dedaRoutes from './src/routes/dedaRoutes.js';
import socialRoutes from './src/routes/socialRoutes.js';
import taxRoutes from './src/routes/taxRoutes.js';
import documentGeneratorRoutes from './src/routes/documentGeneratorRoutes.js';
import supportRoutes from './src/routes/supportRoutes.js';
import { authenticateUser } from './src/middleware/authMiddleware.js';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// ============ MIDDLEWARE ============

// CORS configuration - allow frontend from multiple ports in development
const corsOrigins = process.env.NODE_ENV === 'development'
  ? [/^http:\/\/localhost:\d+$/] // Allow any localhost port in development
  : [
      process.env.FRONTEND_URL || 'https://mybiztools.ng',
      'https://www.mybiztools.ng',
      'https://mybiztools.ng'
    ]; // Allow both www and non-www in production

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Security headers with helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for API compatibility
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============ RATE LIMITING ============

// Rate limiting: 5 emails per minute per IP
const emailLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per windowMs
  message: 'Too many emails sent from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    return req.path === '/health';
  },
});

// ============ EMAIL CONFIGURATION (Resend) ============

interface EmailRequest {
  to: string;
  subject: string;
  html?: string;
  message?: string;
  businessName?: string;
  businessEmail?: string;
  [key: string]: any;
}

// Initialize Resend client
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'MyBizTools <onboarding@resend.dev>';
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// ============ EMAIL SENDING FUNCTION ============

interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}

/**
 * Send email using Resend API
 */
const sendEmail = async (mailOptions: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    if (!resend || !RESEND_API_KEY) {
      return {
        success: false,
        error: 'Email service not configured. RESEND_API_KEY is missing.',
      };
    }

    // Prepare attachments for Resend format
    const resendAttachments = mailOptions.attachments?.map((att) => ({
      filename: att.filename,
      content: att.content,
    }));

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html,
      attachments: resendAttachments,
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }

    console.log(`✅ Email sent via Resend successfully`);
    console.log(`   To: ${mailOptions.to}`);
    console.log(`   Subject: ${mailOptions.subject}`);
    console.log(`   Message ID: ${data?.id || 'N/A'}`);

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Email sending error:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// ============ ROUTES ============

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============ AUTH ROUTES ============
app.use('/api/auth', authRoutes);

// ============ ADMIN ROUTES ============
app.use('/api/admin', adminRoutes);

// ============ SMS ROUTES ============
app.use('/api/sms', smsRoutes);

// ============ USER ROUTES ============
app.use('/api/users', userRoutes);

// ============ DOCUMENT ROUTES ============
app.use('/api/documents', documentRoutes);

// ============ BUDGET & EXPENSE ROUTES ============
app.use('/api/budgets', budgetRoutes);

// ============ CONTACT ROUTES ============
app.use('/api/contacts', contactRoutes);

// ============ PAYMENT GATEWAY ROUTES ============
app.use('/api/payments', paymentGatewayRoutes);

// ============ DEDA AI ROUTES ============
app.use('/api/deda', dedaRoutes);

// ============ SOCIAL MEDIA ROUTES ============
app.use('/api/social', socialRoutes);

// ============ TAX CALCULATOR ROUTES ============
app.use('/api/tax', taxRoutes);

// ============ DOCUMENT GENERATOR ROUTES ============
app.use('/api/generator', documentGeneratorRoutes);

// ============ SUPPORT TICKET ROUTES ============
app.use('/api/admin/support', supportRoutes);

// Email sending endpoint (with JWT authentication and rate limiting)
app.post('/api/emails/send', emailLimiter, authenticateUser, upload.single('invoice'), async (req: Request, res: Response) => {
  try {
    const { to, subject, message, businessName, businessEmail } = req.body as EmailRequest;

    // Enhanced Validation
    if (!to || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        error: 'MISSING_FIELDS',
        required: ['to', 'subject'],
      });
    }

    // Trim whitespace
    const trimmedTo = to.trim();
    const trimmedSubject = subject.trim();

    // Validate email format (RFC 5322 simplified)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedTo)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address format',
        error: 'INVALID_EMAIL',
        providedEmail: trimmedTo,
      });
    }

    // Validate subject length (max 100 chars)
    if (trimmedSubject.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Subject line is too long (max 100 characters)',
        error: 'SUBJECT_TOO_LONG',
        length: trimmedSubject.length,
      });
    }

    // Validate message (basic check)
    if (message && message.length > 50000) {
      return res.status(400).json({
        success: false,
        message: 'Message body is too long (max 50,000 characters)',
        error: 'MESSAGE_TOO_LONG',
      });
    }

    // Build HTML content
    let htmlContent = message || '';

    // Add business branding footer if provided
    if (businessName && businessEmail) {
      const trimmedBusinessName = businessName.trim();
      const trimmedBusinessEmail = businessEmail.trim();
      
      htmlContent += `
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px; font-family: Arial, sans-serif;">
          <strong>${escapeHtml(trimmedBusinessName)}</strong><br>
          Email: <a href="mailto:${escapeHtml(trimmedBusinessEmail)}">${escapeHtml(trimmedBusinessEmail)}</a>
        </p>
      `;
    }

    // Prepare email options for Resend
    const mailOptions: SendEmailOptions = {
      to: trimmedTo,
      subject: trimmedSubject,
      html: htmlContent,
    };

    // Attach file if provided (PDF, image, etc.)
    if (req.file) {
      // Validate file size (max 10MB)
      if (req.file.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'File size is too large (max 10MB)',
          error: 'FILE_TOO_LARGE',
          fileSize: req.file.size,
        });
      }

      // Validate file type
      const allowedMimeTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'File type not allowed',
          error: 'INVALID_FILE_TYPE',
          providedType: req.file.mimetype,
          allowedTypes: allowedMimeTypes,
        });
      }

      mailOptions.attachments = [
        {
          filename: req.file.originalname,
          content: req.file.buffer,
          contentType: req.file.mimetype,
        },
      ];
    }

    // Send email
    const emailResult = await sendEmail(mailOptions);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: 'EMAIL_SEND_FAILED',
        details: process.env.NODE_ENV === 'development' ? emailResult.error : undefined,
      });
    }

    console.log(`   Timestamp: ${new Date().toISOString()}`);

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      data: {
        messageId: emailResult.messageId,
        to: trimmedTo,
        subject: trimmedSubject,
        sentAt: new Date().toISOString(),
        provider: 'resend',
      },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Email sending error:', errorMessage);

    // Provide specific error types
    let errorType = 'EMAIL_SEND_FAILED';
    let statusCode = 500;

    if (errorMessage.includes('EAUTH')) {
      errorType = 'AUTH_ERROR';
      statusCode = 500;
    } else if (errorMessage.includes('EHOSTUNREACH') || errorMessage.includes('ENETUNREACH')) {
      errorType = 'NETWORK_ERROR';
      statusCode = 503;
    } else if (errorMessage.includes('ECONNREFUSED')) {
      errorType = 'SERVICE_UNAVAILABLE';
      statusCode = 503;
    }

    return res.status(statusCode).json({
      success: false,
      message: 'Failed to send email. Please check your input and try again.',
      error: errorType,
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Note: The main /api/emails/send endpoint above handles all document types
// using the generic 'invoice' field name which works for any attachment.
// Duplicate routes have been removed to ensure all email sending requires
// authentication via authMiddleware and is rate-limited via emailLimiter.

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
    availableEndpoints: [
      'GET /health',
      'POST /api/emails/send',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/verify',
      'GET /api/auth/verify/:token',
      'POST /api/auth/forgot',
      'POST /api/auth/reset',
      'GET /api/auth/me',
      'GET /api/users/profile',
      'PUT /api/users/profile',
      'PUT /api/users/avatar',
      'PUT /api/users/password',
      'GET /api/users/subscription',
      'GET /api/users/payments',
      'DELETE /api/users/account',
      'POST /api/admin/login',
      'GET /api/admin/users',
      'GET /api/admin/users/:userId',
      'GET /api/admin/users/:userId/subscriptions',
      'PUT /api/admin/users/:userId/plan',
      'PUT /api/admin/users/:userId/suspension',
      'POST /api/admin/users/:userId/extend',
      'GET /api/generator/stats',
      'POST /api/generator/invoices',
      'GET /api/generator/invoices',
      'GET /api/generator/invoices/:invoiceId',
      'PUT /api/generator/invoices/:invoiceId',
      'DELETE /api/generator/invoices/:invoiceId',
      'POST /api/generator/quotations',
      'GET /api/generator/quotations',
      'GET /api/generator/quotations/public/:publicLink',
      'GET /api/generator/quotations/:quotationId',
      'PUT /api/generator/quotations/:quotationId',
      'DELETE /api/generator/quotations/:quotationId',
      'POST /api/generator/receipts',
      'GET /api/generator/receipts',
      'GET /api/generator/receipts/:receiptId',
      'DELETE /api/generator/receipts/:receiptId',
      'POST /api/generator/payslips',
      'GET /api/generator/payslips',
      'GET /api/generator/payslips/:payslipId',
      'DELETE /api/generator/payslips/:payslipId',
    ],
  });
});

// Error handler
app.use((err: any, req: Request, res: Response) => {
  console.error('Unhandled error:', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ============ HELPER FUNCTIONS ============

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// ============ SERVER START ============

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || 'localhost';

const server = app.listen(PORT, HOST, () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║       MyBizTools Backend API           ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log(`✅ Server running on http://${HOST}:${PORT}`);
  console.log('');
  console.log('📋 Auth Endpoints:');
  console.log('   🔐 POST /api/auth/register');
  console.log('   🔐 POST /api/auth/login');
  console.log('   🔐 POST /api/auth/verify');
  console.log('   🔐 POST /api/auth/forgot');
  console.log('   🔐 POST /api/auth/reset');
  console.log('   🔐 GET  /api/auth/me');
  console.log('');
  console.log('👤 Admin Endpoints:');
  console.log('   🛡️  POST /api/admin/login');
  console.log('   🛡️  GET  /api/admin/users');
  console.log('   🛡️  GET  /api/admin/payments');
  console.log('   🛡️  GET  /api/admin/metrics');
  console.log('   🛡️  GET  /api/admin/abuse-reports');
  console.log('   🎫 GET  /api/admin/support/tickets');
  console.log('   🎫 POST /api/admin/support/tickets/:id/respond');
  console.log('');
  console.log('📱 SMS Endpoints:');
  console.log('   📨 POST /api/sms/send');
  console.log('   📨 POST /api/sms/bulk-send');
  console.log('   💰 GET  /api/sms/balance');
  console.log('   ✅ POST /api/sms/validate');
  console.log('');
  console.log('👤 User Endpoints:');
  console.log('   📋 GET  /api/users/profile');
  console.log('   ✏️  PUT  /api/users/profile');
  console.log('   🖼️  PUT  /api/users/avatar');
  console.log('   🔑 PUT  /api/users/password');
  console.log('   💳 GET  /api/users/subscription');
  console.log('   💰 GET  /api/users/payments');
  console.log('   🗑️  DELETE /api/users/account');
  console.log('');
  console.log('📄 Document Generator Endpoints:');
  console.log('   📊 GET  /api/generator/stats');
  console.log('   📃 CRUD /api/generator/invoices');
  console.log('   📋 CRUD /api/generator/quotations');
  console.log('   🧾 CRUD /api/generator/receipts');
  console.log('   💵 CRUD /api/generator/payslips');
  console.log('');
  console.log('📧 Other Endpoints:');
  console.log('   🏥 GET  /health');
  console.log('   📧 POST /api/emails/send');
  console.log('');
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Email Provider: Resend`);
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
