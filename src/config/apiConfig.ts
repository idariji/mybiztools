/**
 * API Configuration
 * 
 * This file centralizes all API endpoints for the application.
 * Update API_BASE_URL based on your deployment environment.
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Note: API authentication is handled via JWT tokens from authService
// Do NOT expose API keys in frontend code

export const apiEndpoints = {
  // Email Service
  sendEmail: `${API_BASE_URL}/api/emails/send`,

  // SMS Service (if using Termii proxy)
  sendSMS: `${API_BASE_URL}/api/sms/send`,
  checkBalance: `${API_BASE_URL}/api/sms/balance`,

  // Authentication (if backend API exists)
  login: `${API_BASE_URL}/api/auth/login`,
  register: `${API_BASE_URL}/api/auth/register`,
  verifyEmail: `${API_BASE_URL}/api/auth/verify`,
  resetPassword: `${API_BASE_URL}/api/auth/reset`,
};

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};
