const TERMII_API_KEY = process.env.TERMII_API_KEY;
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID || 'MyBizTools';
const TERMII_BASE_URL = 'https://api.ng.termii.com/api';

// Termii API response types
interface TermiiSmsResponse {
  code?: string;
  message?: string;
  message_id?: string;
  balance?: number;
}

interface TermiiBalanceResponse {
  balance?: number;
  currency?: string;
  user?: string;
}

interface TermiiDndResponse {
  dnd_active?: boolean;
  network?: string;
  network_code?: string;
  status?: string;
}

interface TermiiHistoryResponse {
  data?: unknown[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

export interface SendSmsInput {
  to: string;
  message: string;
  channel?: 'generic' | 'dnd' | 'whatsapp';
}

export interface BulkSmsInput {
  to: string[];
  message: string;
  channel?: 'generic' | 'dnd' | 'whatsapp';
}

export class SmsService {
  // Send single SMS
  static async sendSms(input: SendSmsInput) {
    try {
      if (!TERMII_API_KEY) {
        return {
          success: false,
          message: 'SMS service not configured. TERMII_API_KEY is missing.',
          error: 'SMS_NOT_CONFIGURED',
        };
      }

      // Format phone number (ensure it starts with country code)
      let phoneNumber = input.to.replace(/\s+/g, '').replace(/^0/, '234');
      if (!phoneNumber.startsWith('+') && !phoneNumber.startsWith('234')) {
        phoneNumber = '234' + phoneNumber;
      }

      const response = await fetch(`${TERMII_BASE_URL}/sms/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: TERMII_API_KEY,
          to: phoneNumber,
          from: TERMII_SENDER_ID,
          sms: input.message,
          type: 'plain',
          channel: input.channel || 'generic',
        }),
      });

      const data = await response.json() as TermiiSmsResponse;

      if (!response.ok || data.code !== 'ok') {
        console.error('Termii SMS error:', data);
        return {
          success: false,
          message: data.message || 'Failed to send SMS',
          error: 'SMS_SEND_FAILED',
          details: data,
        };
      }

      console.log(`SMS sent successfully to ${phoneNumber}`);

      return {
        success: true,
        message: 'SMS sent successfully',
        data: {
          messageId: data.message_id,
          to: phoneNumber,
          balance: data.balance,
        },
      };
    } catch (error) {
      console.error('Send SMS error:', error);
      return {
        success: false,
        message: 'Failed to send SMS',
        error: 'SMS_SEND_FAILED',
      };
    }
  }

  // Send bulk SMS
  static async sendBulkSms(input: BulkSmsInput) {
    try {
      if (!TERMII_API_KEY) {
        return {
          success: false,
          message: 'SMS service not configured. TERMII_API_KEY is missing.',
          error: 'SMS_NOT_CONFIGURED',
        };
      }

      // Format phone numbers
      const phoneNumbers = input.to.map((num) => {
        let formatted = num.replace(/\s+/g, '').replace(/^0/, '234');
        if (!formatted.startsWith('+') && !formatted.startsWith('234')) {
          formatted = '234' + formatted;
        }
        return formatted;
      });

      const response = await fetch(`${TERMII_BASE_URL}/sms/send/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: TERMII_API_KEY,
          to: phoneNumbers,
          from: TERMII_SENDER_ID,
          sms: input.message,
          type: 'plain',
          channel: input.channel || 'generic',
        }),
      });

      const data = await response.json() as TermiiSmsResponse;

      if (!response.ok || data.code !== 'ok') {
        console.error('Termii bulk SMS error:', data);
        return {
          success: false,
          message: data.message || 'Failed to send bulk SMS',
          error: 'BULK_SMS_SEND_FAILED',
          details: data,
        };
      }

      console.log(`Bulk SMS sent successfully to ${phoneNumbers.length} recipients`);

      return {
        success: true,
        message: 'Bulk SMS sent successfully',
        data: {
          messageId: data.message_id,
          recipientCount: phoneNumbers.length,
          balance: data.balance,
        },
      };
    } catch (error) {
      console.error('Send bulk SMS error:', error);
      return {
        success: false,
        message: 'Failed to send bulk SMS',
        error: 'BULK_SMS_SEND_FAILED',
      };
    }
  }

  // Check account balance
  static async getBalance() {
    try {
      if (!TERMII_API_KEY) {
        return {
          success: false,
          message: 'SMS service not configured. TERMII_API_KEY is missing.',
          error: 'SMS_NOT_CONFIGURED',
        };
      }

      const response = await fetch(`${TERMII_BASE_URL}/get-balance?api_key=${TERMII_API_KEY}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json() as TermiiBalanceResponse;

      if (!response.ok) {
        console.error('Termii balance check error:', data);
        return {
          success: false,
          message: 'Failed to check balance',
          error: 'BALANCE_CHECK_FAILED',
          details: data,
        };
      }

      return {
        success: true,
        data: {
          balance: data.balance,
          currency: data.currency || 'NGN',
          user: data.user,
        },
      };
    } catch (error) {
      console.error('Get balance error:', error);
      return {
        success: false,
        message: 'Failed to check balance',
        error: 'BALANCE_CHECK_FAILED',
      };
    }
  }

  // Validate phone number
  static async validatePhone(phoneNumber: string) {
    try {
      if (!TERMII_API_KEY) {
        return {
          success: false,
          message: 'SMS service not configured. TERMII_API_KEY is missing.',
          error: 'SMS_NOT_CONFIGURED',
        };
      }

      // Format phone number
      let formatted = phoneNumber.replace(/\s+/g, '').replace(/^0/, '234');
      if (!formatted.startsWith('+') && !formatted.startsWith('234')) {
        formatted = '234' + formatted;
      }

      const response = await fetch(`${TERMII_BASE_URL}/check/dnd?api_key=${TERMII_API_KEY}&phone_number=${formatted}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json() as TermiiDndResponse;

      return {
        success: true,
        data: {
          phoneNumber: formatted,
          isDnd: data.dnd_active || false,
          network: data.network,
          networkCode: data.network_code,
          status: data.status,
        },
      };
    } catch (error) {
      console.error('Validate phone error:', error);
      return {
        success: false,
        message: 'Failed to validate phone number',
        error: 'VALIDATION_FAILED',
      };
    }
  }

  // Get messaging history
  static async getHistory(page: number = 1) {
    try {
      if (!TERMII_API_KEY) {
        return {
          success: false,
          message: 'SMS service not configured. TERMII_API_KEY is missing.',
          error: 'SMS_NOT_CONFIGURED',
        };
      }

      const response = await fetch(`${TERMII_BASE_URL}/sms/inbox?api_key=${TERMII_API_KEY}&page=${page}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json() as TermiiHistoryResponse;

      if (!response.ok) {
        console.error('Termii history error:', data);
        return {
          success: false,
          message: 'Failed to fetch history',
          error: 'HISTORY_FETCH_FAILED',
          details: data,
        };
      }

      return {
        success: true,
        data: {
          messages: data.data || [],
          pagination: {
            page: data.current_page || page,
            lastPage: data.last_page || 1,
            total: data.total || 0,
          },
        },
      };
    } catch (error) {
      console.error('Get history error:', error);
      return {
        success: false,
        message: 'Failed to fetch history',
        error: 'HISTORY_FETCH_FAILED',
      };
    }
  }
}

export default SmsService;
