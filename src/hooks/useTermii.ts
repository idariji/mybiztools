/**
 * useTermii Hook
 * Simplifies Termii SMS functionality in React components
 */

import { useState, useCallback } from 'react';
import { sendSMS, validatePhoneNumber, checkBalance } from '../services/termiiService';
import type { TermiiSendSMSResponse, TermiiCheckBalanceResponse } from '../services/termiiService';

export interface UseTermiiOptions {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export interface UseTermiiState {
  loading: boolean;
  error: string | null;
  success: boolean;
  balance: number | null;
}

export const useTermii = (options?: UseTermiiOptions) => {
  const [state, setState] = useState<UseTermiiState>({
    loading: false,
    error: null,
    success: false,
    balance: null,
  });

  /**
   * Send SMS message
   */
  const send = useCallback(
    async (
      phoneNumber: string,
      message: string,
      channel: 'generic' | 'dnd' | 'whatsapp' = 'generic'
    ): Promise<TermiiSendSMSResponse | null> => {
      setState({ loading: true, error: null, success: false, balance: null });

      try {
        // Validate phone number first
        const validation = await validatePhoneNumber(phoneNumber);
        if (!validation.isValid) {
          throw new Error(validation.message);
        }

        // Send SMS
        const response = await sendSMS(phoneNumber, message, channel);

        if (response.code !== '01') {
          throw new Error(response.message || 'Failed to send SMS');
        }

        setState({
          loading: false,
          error: null,
          success: true,
          balance: response.balance,
        });

        options?.onSuccess?.(`SMS sent successfully to ${phoneNumber}`);
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState({ loading: false, error: errorMessage, success: false, balance: null });
        options?.onError?.(errorMessage);
        return null;
      }
    },
    [options]
  );

  /**
   * Get current account balance
   */
  const getBalance = useCallback(async (): Promise<TermiiCheckBalanceResponse | null> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await checkBalance();
      setState((prev) => ({ ...prev, loading: false, balance: response.balance }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check balance';
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      options?.onError?.(errorMessage);
      return null;
    }
  }, [options]);

  /**
   * Validate phone number
   */
  const validate = useCallback(async (phoneNumber: string) => {
    try {
      return await validatePhoneNumber(phoneNumber);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Validation error';
      setState((prev) => ({ ...prev, error: errorMessage }));
      return { isValid: false, message: errorMessage };
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null, success: false }));
  }, []);

  return {
    ...state,
    send,
    getBalance,
    validate,
    clearError,
  };
};

export default useTermii;
