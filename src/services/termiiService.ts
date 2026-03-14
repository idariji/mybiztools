/**
 * SMS Service Integration
 * Handles SMS and other communication services via Backend API
 * Note: All SMS operations go through the backend to protect API keys
 */

import { authService } from './authService';
import { API_BASE_URL as API_ROOT } from '../config/apiConfig';

// API Configuration — SMS routes live under /api/sms
const API_BASE_URL = `${API_ROOT}/api`;

// Helper to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

// Types for API responses
export interface TermiiSendSMSRequest {
  to: string;
  from?: string;
  sms: string;
  type?: 'plain' | 'unicode';
  channel?: 'generic' | 'dnd' | 'whatsapp';
  media?: {
    url?: string;
    caption?: string;
  };
}

export interface TermiiSendSMSResponse {
  code: string;
  message_id: string;
  message: string;
  balance: number;
  user: string;
}

export interface TermiiContactData {
  phone_number: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  company?: string;
  [key: string]: string | undefined;
}

export interface TermiiContactResponse {
  code: string;
  message: string;
  data?: {
    id: string;
    phone_number: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface TermiiCheckBalanceResponse {
  code: string;
  message: string;
  user: string;
  balance: number;
  currency: string;
}

/**
 * Send SMS via Backend API
 * @param phoneNumber - Recipient phone number (with country code)
 * @param message - SMS message content
 * @param channel - Channel type (generic, dnd, whatsapp)
 * @returns Promise with API response
 */
export const sendSMS = async (
  phoneNumber: string,
  message: string,
  channel: 'generic' | 'dnd' | 'whatsapp' = 'generic'
): Promise<TermiiSendSMSResponse> => {
  try {
    // Validate inputs
    if (!phoneNumber) {
      throw new Error('Phone number is required');
    }
    if (!message) {
      throw new Error('Message content is required');
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');

    const response = await fetch(`${API_BASE_URL}/sms/send`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        to: cleanPhone,
        message: message,
        channel: channel,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || `Failed to send SMS: ${response.statusText}`);
    }

    // Map backend response to expected format
    return {
      code: '01',
      message_id: data.messageId || data.message_id || '',
      message: data.message || 'SMS sent successfully',
      balance: data.balance || 0,
      user: data.user || '',
    };
  } catch (error) {
    console.error('SMS sending error:', error);
    throw error;
  }
};

/**
 * Send bulk SMS to multiple recipients
 * @param phoneNumbers - Array of recipient phone numbers
 * @param message - SMS message content
 * @param channel - Channel type
 * @returns Promise array of responses
 */
export const sendBulkSMS = async (
  phoneNumbers: string[],
  message: string,
  channel: 'generic' | 'dnd' | 'whatsapp' = 'generic'
): Promise<TermiiSendSMSResponse[]> => {
  try {
    // Clean phone numbers
    const cleanPhones = phoneNumbers.map(phone => phone.replace(/[\s\-\(\)]/g, ''));

    const response = await fetch(`${API_BASE_URL}/sms/bulk-send`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        to: cleanPhones,
        message: message,
        channel: channel,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to send bulk SMS');
    }

    // Return results array
    return data.results || [{
      code: '01',
      message_id: '',
      message: data.message || 'Bulk SMS sent successfully',
      balance: data.balance || 0,
      user: '',
    }];
  } catch (error) {
    console.error('Bulk SMS sending error:', error);
    throw error;
  }
};

/**
 * Check account balance
 * @returns Promise with balance information
 */
export const checkBalance = async (): Promise<TermiiCheckBalanceResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sms/balance`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to check balance');
    }

    return {
      code: '01',
      message: 'Balance retrieved successfully',
      user: data.user || '',
      balance: data.balance || 0,
      currency: data.currency || 'NGN',
    };
  } catch (error) {
    console.error('Balance check error:', error);
    throw error;
  }
};

/**
 * Get Phone Number Details (validation)
 * @param phoneNumber - Phone number to lookup
 * @returns Promise with phone details
 */
export const getPhoneNumberDetails = async (
  phoneNumber: string
): Promise<{ network: string; mcc: string; mnc: string; number: string }> => {
  try {
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');

    const response = await fetch(`${API_BASE_URL}/sms/validate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        phoneNumber: cleanPhone,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get phone details');
    }

    return {
      network: data.network || '',
      mcc: data.mcc || '',
      mnc: data.mnc || '',
      number: cleanPhone,
    };
  } catch (error) {
    console.error('Phone details error:', error);
    throw error;
  }
};

/**
 * Send Invoice via SMS
 * @param phoneNumber - Recipient phone number
 * @param invoiceNumber - Invoice number
 * @param clientName - Client name
 * @param amount - Invoice amount
 * @param invoiceLink - Link to invoice (optional)
 */
export const sendInvoiceViaSMS = async (
  phoneNumber: string,
  invoiceNumber: string,
  clientName: string,
  amount: string | number,
  invoiceLink?: string
): Promise<TermiiSendSMSResponse> => {
  try {
    let message = `Hello ${clientName}, your invoice #${invoiceNumber} for ${amount} is ready.`;

    if (invoiceLink) {
      message += ` View here: ${invoiceLink}`;
    }

    message += ' - MyBizTools';

    return await sendSMS(phoneNumber, message);
  } catch (error) {
    console.error('Invoice SMS sending error:', error);
    throw error;
  }
};

/**
 * Send Payment Reminder via SMS
 * @param phoneNumber - Recipient phone number
 * @param invoiceNumber - Invoice number
 * @param daysOverdue - Number of days overdue
 * @param amount - Outstanding amount
 */
export const sendPaymentReminderSMS = async (
  phoneNumber: string,
  invoiceNumber: string,
  daysOverdue: number,
  amount: string | number
): Promise<TermiiSendSMSResponse> => {
  try {
    const message = `Reminder: Invoice #${invoiceNumber} is ${daysOverdue} days overdue. Amount due: ${amount}. Please settle at your earliest convenience. Thank you. - MyBizTools`;

    return await sendSMS(phoneNumber, message);
  } catch (error) {
    console.error('Payment reminder SMS error:', error);
    throw error;
  }
};

/**
 * Validate phone number format and network
 * @param phoneNumber - Phone number to validate
 * @returns Promise with validation result
 */
export const validatePhoneNumber = async (
  phoneNumber: string
): Promise<{ isValid: boolean; network?: string; message: string }> => {
  try {
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');

    // Basic format validation (must be 10-15 digits with country code)
    if (!/^\+?[1-9]\d{1,14}$/.test(cleanPhone)) {
      return {
        isValid: false,
        message: 'Invalid phone number format. Include country code (e.g., +234801234567)',
      };
    }

    // Try to get network details from backend
    try {
      const details = await getPhoneNumberDetails(phoneNumber);
      return {
        isValid: true,
        network: details.network,
        message: 'Valid phone number',
      };
    } catch {
      // If network check fails, but format is valid, still return valid
      return {
        isValid: true,
        message: 'Valid phone number format',
      };
    }
  } catch (error) {
    console.error('Phone validation error:', error);
    return {
      isValid: false,
      message: 'Error validating phone number',
    };
  }
};

export default {
  sendSMS,
  sendBulkSMS,
  checkBalance,
  getPhoneNumberDetails,
  sendInvoiceViaSMS,
  sendPaymentReminderSMS,
  validatePhoneNumber,
};
