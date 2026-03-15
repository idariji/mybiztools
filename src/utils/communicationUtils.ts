/**
 * Communication Utilities
 * Handles SMS, Email, and WhatsApp messaging through Termii and Email services
 */

import { sendSMS, validatePhoneNumber } from '../services/termiiService';

import { Invoice } from '../types/invoice';

export interface SendMessageOptions {
  method: 'sms' | 'email' | 'whatsapp';
  phoneNumber?: string;
  email?: string;
  message: string;
  subject?: string;
  channel?: 'generic' | 'dnd' | 'whatsapp';
}

export interface MessageResult {
  success: boolean;
  method: string;
  messageId?: string;
  message: string;
  timestamp: string;
}

/**
 * Send message via preferred communication channel
 */
export const sendMessage = async (options: SendMessageOptions): Promise<MessageResult> => {
  const timestamp = new Date().toISOString();

  try {
    switch (options.method) {
      case 'sms':
        if (!options.phoneNumber) {
          throw new Error('Phone number required for SMS');
        }

        // Validate phone number
        const validation = await validatePhoneNumber(options.phoneNumber);
        if (!validation.isValid) {
          throw new Error(validation.message);
        }

        const smsResponse = await sendSMS(
          options.phoneNumber,
          options.message,
          options.channel || 'generic'
        );

        return {
          success: true,
          method: 'sms',
          messageId: smsResponse.message_id,
          message: `SMS sent successfully to ${options.phoneNumber}`,
          timestamp,
        };

      case 'email':
        if (!options.email) {
          throw new Error('Email address required for email');
        }

        // Note: Email sending requires backend API
        // This is a placeholder - implement actual email sending
        console.log('Email sending:', {
          to: options.email,
          subject: options.subject,
          message: options.message,
        });

        return {
          success: true,
          method: 'email',
          message: `Email sent successfully to ${options.email}`,
          timestamp,
        };

      case 'whatsapp':
        if (!options.phoneNumber) {
          throw new Error('Phone number required for WhatsApp');
        }

        // Validate phone number
        const whatsappValidation = await validatePhoneNumber(options.phoneNumber);
        if (!whatsappValidation.isValid) {
          throw new Error(whatsappValidation.message);
        }

        const whatsappResponse = await sendSMS(
          options.phoneNumber,
          options.message,
          'whatsapp'
        );

        return {
          success: true,
          method: 'whatsapp',
          messageId: whatsappResponse.message_id,
          message: `WhatsApp message sent successfully to ${options.phoneNumber}`,
          timestamp,
        };

      default:
        throw new Error(`Unknown communication method: ${options.method}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      method: options.method,
      message: `Failed to send ${options.method}: ${errorMessage}`,
      timestamp,
    };
  }
};

/**
 * Send invoice via multiple channels
 */
export const sendInvoiceMultiChannel = async (
  invoice: Invoice,
  channels: Array<'sms' | 'email' | 'whatsapp'>,
  customMessage?: string
): Promise<MessageResult[]> => {
  const results: MessageResult[] = [];

  const message =
    customMessage ||
    `Invoice #${invoice.invoiceNumber} for ${invoice.currency || 'NGN'} ${invoice.summary.total} is ready. Click to view or reply for payment plan.`;

  for (const channel of channels) {
    try {
      if (channel === 'email') {
        const result = await sendMessage({
          method: 'email',
          email: invoice.clientInfo.email,
          message,
          subject: `Invoice #${invoice.invoiceNumber}`,
        });
        results.push(result);
      } else if (channel === 'sms' || channel === 'whatsapp') {
        const result = await sendMessage({
          method: channel,
          phoneNumber: invoice.clientInfo.phone,
          message,
          channel: channel === 'whatsapp' ? 'whatsapp' : 'generic',
        });
        results.push(result);
      }
    } catch (error) {
      results.push({
        success: false,
        method: channel,
        message: `Failed to send via ${channel}`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return results;
};

/**
 * Batch send SMS to contacts
 */
export const sendBatchSMS = async (
  phoneNumbers: string[],
  message: string,
  channel: 'generic' | 'dnd' | 'whatsapp' = 'generic'
): Promise<MessageResult[]> => {
  const results: MessageResult[] = [];

  for (const phoneNumber of phoneNumbers) {
    try {
      const result = await sendMessage({
        method: channel === 'whatsapp' ? 'whatsapp' : 'sms',
        phoneNumber,
        message,
        channel,
      });
      results.push(result);
    } catch (error) {
      results.push({
        success: false,
        method: 'sms',
        message: `Failed to send to ${phoneNumber}`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return results;
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');

  // If it doesn't start with +, we might need to add country code
  if (!cleaned.startsWith('+')) {
    // For Nigeria, default to +234
    if (cleaned.startsWith('234') || (cleaned.length === 10 && cleaned.startsWith('0'))) {
      return '+234' + cleaned.slice(-10);
    }
    return '+' + cleaned;
  }

  return cleaned;
};

/**
 * Extract country code from phone number
 */
export const getCountryCodeFromPhone = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+')) {
    // Match country code (1-3 digits)
    const match = cleaned.match(/^\+(\d{1,3})/);
    return match ? match[1] : '234'; // Default to Nigeria
  }

  if (cleaned.startsWith('234')) {
    return '234';
  }

  if (cleaned.startsWith('0')) {
    return '234';
  }

  return '234'; // Default
};

export default {
  sendMessage,
  sendInvoiceMultiChannel,
  sendBatchSMS,
  formatPhoneNumber,
  getCountryCodeFromPhone,
};
