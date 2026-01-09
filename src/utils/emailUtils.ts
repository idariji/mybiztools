/**
 * Email Utilities & Helpers
 * Functions to work with email templates and sending
 */

import {
  sendUserRegistrationEmail,
  sendEmailVerificationEmail,
  sendPasswordResetEmail,
  sendPaymentReminderEmail,
  sendInvoiceEmail,
  sendReceiptEmail,
  sendQuotationEmail,
  sendPayslipEmail,
} from './emailService';
import { Invoice } from '../types/invoice';
import { Receipt } from '../types/receipt';
import { Quotation } from '../types/quotation';
import { Payslip } from '../types/payslip';

// ============================================
// EMAIL VALIDATION & FORMATTING
// ============================================

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize email address
 */
export const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

/**
 * Check if email is business/corporate
 */
export const isBusinessEmail = (email: string): boolean => {
  const freeEmailDomains = [
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'hotmail.com',
    'aol.com',
    'protonmail.com',
  ];

  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? !freeEmailDomains.includes(domain) : false;
};

// ============================================
// EMAIL SENDING WRAPPERS WITH ERROR HANDLING
// ============================================

/**
 * Send user registration email with error handling
 */
export const sendRegistrationEmailSafe = async (
  email: string,
  userName: string,
  verificationLink: string
): Promise<{ success: boolean; message: string }> => {
  try {
    if (!validateEmail(email)) {
      return { success: false, message: 'Invalid email address' };
    }

    const cleanEmail = sanitizeEmail(email);
    await sendUserRegistrationEmail(cleanEmail, userName, verificationLink);

    return {
      success: true,
      message: 'Registration email sent successfully',
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: `Failed to send registration email: ${errorMsg}`,
    };
  }
};

/**
 * Send email verification with error handling
 */
export const sendVerificationEmailSafe = async (
  email: string,
  verificationLink: string
): Promise<{ success: boolean; message: string }> => {
  try {
    if (!validateEmail(email)) {
      return { success: false, message: 'Invalid email address' };
    }

    const cleanEmail = sanitizeEmail(email);
    await sendEmailVerificationEmail(cleanEmail, verificationLink);

    return {
      success: true,
      message: 'Verification email sent successfully',
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: `Failed to send verification email: ${errorMsg}`,
    };
  }
};

/**
 * Send password reset email with error handling
 */
export const sendPasswordResetEmailSafe = async (
  email: string,
  resetLink: string,
  userName: string
): Promise<{ success: boolean; message: string }> => {
  try {
    if (!validateEmail(email)) {
      return { success: false, message: 'Invalid email address' };
    }

    const cleanEmail = sanitizeEmail(email);
    await sendPasswordResetEmail(cleanEmail, resetLink, userName);

    return {
      success: true,
      message: 'Password reset email sent successfully',
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: `Failed to send password reset email: ${errorMsg}`,
    };
  }
};

/**
 * Send payment reminder email with error handling
 */
export const sendPaymentReminderEmailSafe = async (
  email: string,
  clientName: string,
  invoiceNumber: string,
  amount: number | string,
  currency: string,
  daysOverdue: number
): Promise<{ success: boolean; message: string }> => {
  try {
    if (!validateEmail(email)) {
      return { success: false, message: 'Invalid email address' };
    }

    const cleanEmail = sanitizeEmail(email);
    await sendPaymentReminderEmail(
      cleanEmail,
      clientName,
      invoiceNumber,
      amount,
      currency,
      daysOverdue
    );

    return {
      success: true,
      message: 'Payment reminder email sent successfully',
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: `Failed to send payment reminder email: ${errorMsg}`,
    };
  }
};

/**
 * Send invoice email with PDF
 */
export const sendInvoiceEmailSafe = async (
  invoice: Invoice,
  message: string,
  pdfBlob: Blob
): Promise<{ success: boolean; message: string }> => {
  try {
    if (!validateEmail(invoice.clientInfo.email)) {
      return { success: false, message: 'Invalid client email address' };
    }

    await sendInvoiceEmail(invoice, message, pdfBlob);

    return {
      success: true,
      message: 'Invoice email sent successfully',
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: `Failed to send invoice email: ${errorMsg}`,
    };
  }
};

/**
 * Send receipt email with PDF
 */
export const sendReceiptEmailSafe = async (
  receipt: Receipt,
  message: string,
  pdfBlob: Blob
): Promise<{ success: boolean; message: string }> => {
  try {
    if (!validateEmail(receipt.clientInfo.email)) {
      return { success: false, message: 'Invalid client email address' };
    }

    await sendReceiptEmail(receipt, message, pdfBlob);

    return {
      success: true,
      message: 'Receipt email sent successfully',
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: `Failed to send receipt email: ${errorMsg}`,
    };
  }
};

/**
 * Send quotation email with PDF
 */
export const sendQuotationEmailSafe = async (
  quotation: Quotation,
  message: string,
  pdfBlob: Blob
): Promise<{ success: boolean; message: string }> => {
  try {
    if (!validateEmail(quotation.clientInfo.email)) {
      return { success: false, message: 'Invalid client email address' };
    }

    await sendQuotationEmail(quotation, message, pdfBlob);

    return {
      success: true,
      message: 'Quotation email sent successfully',
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: `Failed to send quotation email: ${errorMsg}`,
    };
  }
};

/**
 * Send payslip email with PDF
 */
export const sendPayslipEmailSafe = async (
  payslip: Payslip,
  pdfBlob: Blob
): Promise<{ success: boolean; message: string }> => {
  try {
    if (!validateEmail(payslip.employeeEmail)) {
      return { success: false, message: 'Invalid employee email address' };
    }

    await sendPayslipEmail(payslip, pdfBlob);

    return {
      success: true,
      message: 'Payslip email sent successfully',
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: `Failed to send payslip email: ${errorMsg}`,
    };
  }
};

// ============================================
// BULK EMAIL OPERATIONS
// ============================================

/**
 * Send emails to multiple recipients
 */
export const sendBulkEmails = async (
  emails: string[],
  templateFn: (email: string) => Promise<boolean>
): Promise<{
  successful: string[];
  failed: Array<{ email: string; error: string }>;
}> => {
  const successful: string[] = [];
  const failed: Array<{ email: string; error: string }> = [];

  for (const email of emails) {
    try {
      if (!validateEmail(email)) {
        failed.push({ email, error: 'Invalid email format' });
        continue;
      }

      const result = await templateFn(email);
      if (result) {
        successful.push(email);
      } else {
        failed.push({ email, error: 'Send failed' });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      failed.push({ email, error: errorMsg });
    }
  }

  return { successful, failed };
};

// ============================================
// EMAIL NOTIFICATION PRESETS
// ============================================

/**
 * Send welcome email pack (registration + verification)
 */
export const sendWelcomeEmailPack = async (
  email: string,
  userName: string,
  verificationLink: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Send registration email first
    const registrationResult = await sendRegistrationEmailSafe(
      email,
      userName,
      verificationLink
    );

    if (!registrationResult.success) {
      return registrationResult;
    }

    // Note: Email verification is included in registration email
    return {
      success: true,
      message: 'Welcome email pack sent successfully',
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: `Failed to send welcome pack: ${errorMsg}`,
    };
  }
};

/**
 * Send payment follow-up email sequence
 */
export const sendPaymentFollowUp = async (
  emails: string[],
  invoiceNumber: string,
  amount: number | string,
  currency: string,
  daysOverdue: number
): Promise<{
  successful: string[];
  failed: Array<{ email: string; error: string }>;
}> => {
  const results = await sendBulkEmails(emails, async (email) => {
    const result = await sendPaymentReminderEmailSafe(
      email,
      'Valued Customer',
      invoiceNumber,
      amount,
      currency,
      daysOverdue
    );
    return result.success;
  });

  return results;
};

// ============================================
// EMAIL SCHEDULING & QUEUE HELPERS
// ============================================

export interface EmailQueueItem {
  id: string;
  to: string;
  subject: string;
  templateType:
    | 'invoice'
    | 'receipt'
    | 'quotation'
    | 'payslip'
    | 'registration'
    | 'verification'
    | 'passwordReset'
    | 'paymentReminder';
  data: Record<string, unknown>;
  status: 'pending' | 'sent' | 'failed';
  createdAt: Date;
  sentAt?: Date;
  error?: string;
}

/**
 * Create email queue item
 */
export const createEmailQueueItem = (
  to: string,
  subject: string,
  templateType: EmailQueueItem['templateType'],
  data: Record<string, unknown>
): EmailQueueItem => {
  return {
    id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    to,
    subject,
    templateType,
    data,
    status: 'pending',
    createdAt: new Date(),
  };
};

/**
 * Log email sent
 */
export const logEmailSent = (item: EmailQueueItem): EmailQueueItem => {
  return {
    ...item,
    status: 'sent',
    sentAt: new Date(),
  };
};

/**
 * Log email failed
 */
export const logEmailFailed = (
  item: EmailQueueItem,
  error: string
): EmailQueueItem => {
  return {
    ...item,
    status: 'failed',
    error,
  };
};

// ============================================
// EMAIL STATISTICS & TRACKING
// ============================================

export interface EmailStats {
  totalSent: number;
  totalFailed: number;
  successRate: number;
  byTemplate: Record<string, { sent: number; failed: number }>;
}

/**
 * Calculate email statistics
 */
export const calculateEmailStats = (
  items: EmailQueueItem[]
): EmailStats => {
  const stats: EmailStats = {
    totalSent: 0,
    totalFailed: 0,
    successRate: 0,
    byTemplate: {},
  };

  items.forEach((item) => {
    // Overall stats
    if (item.status === 'sent') {
      stats.totalSent++;
    } else if (item.status === 'failed') {
      stats.totalFailed++;
    }

    // Per-template stats
    if (!stats.byTemplate[item.templateType]) {
      stats.byTemplate[item.templateType] = { sent: 0, failed: 0 };
    }

    if (item.status === 'sent') {
      stats.byTemplate[item.templateType].sent++;
    } else if (item.status === 'failed') {
      stats.byTemplate[item.templateType].failed++;
    }
  });

  const total = stats.totalSent + stats.totalFailed;
  stats.successRate = total > 0 ? (stats.totalSent / total) * 100 : 0;

  return stats;
};

export default {
  validateEmail,
  sanitizeEmail,
  isBusinessEmail,
  sendRegistrationEmailSafe,
  sendVerificationEmailSafe,
  sendPasswordResetEmailSafe,
  sendPaymentReminderEmailSafe,
  sendInvoiceEmailSafe,
  sendReceiptEmailSafe,
  sendQuotationEmailSafe,
  sendPayslipEmailSafe,
  sendBulkEmails,
  sendWelcomeEmailPack,
  sendPaymentFollowUp,
  createEmailQueueItem,
  logEmailSent,
  logEmailFailed,
  calculateEmailStats,
};
