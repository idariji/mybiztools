/**
 * Database Service for Admin Operations
 * Real backend API integration layer
 * Uses actual database queries via API endpoints
 */

import { API_BASE_URL as API_ROOT } from '../../config/apiConfig';
const API_BASE_URL = `${API_ROOT}/api`;

// ============================================================================
// USER & SUBSCRIPTION QUERIES
// ============================================================================

export class DatabaseService {
  /**
   * Fetch all users with pagination
   */
  static async getAllUsers(page: number = 1, limit: number = 50) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/users?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${this.getAuthToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  }

  /**
   * Fetch user subscriptions
   */
  static async getUserSubscriptions(userId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/subscriptions`, {
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      throw error;
    }
  }

  /**
   * Fetch payment history with filtering
   */
  static async getPaymentHistory(filters?: {
    status?: string;
    userId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.userId) params.append('userId', filters.userId);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
      if (filters?.dateTo) params.append('dateTo', filters.dateTo.toISOString());

      const response = await fetch(`${API_BASE_URL}/admin/payments?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
      throw error;
    }
  }

  /**
   * Get dashboard metrics
   */
  static async getDashboardMetrics() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/metrics`, {
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      throw error;
    }
  }

  /**
   * Update user subscription plan
   */
  static async updateUserPlan(userId: string, plan: string, reason: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/plan`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ plan, reason })
      });

      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to update plan:', error);
      throw error;
    }
  }

  /**
   * Process refund
   */
  static async processRefund(paymentId: string, amount: number, reason: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount, reason })
      });

      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to process refund:', error);
      throw error;
    }
  }

  /**
   * Suspend/Unsuspend user
   */
  static async toggleUserSuspension(userId: string, suspended: boolean, reason: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/suspension`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ suspended, reason })
      });

      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to toggle suspension:', error);
      throw error;
    }
  }

  /**
   * Extend subscription
   */
  static async extendSubscription(userId: string, days: number, reason: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/extend`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ days, reason })
      });

      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to extend subscription:', error);
      throw error;
    }
  }

  /**
   * Get abuse detection data
   */
  static async getAbuseReports(filters?: { severity?: string; status?: string }) {
    try {
      const params = new URLSearchParams();
      if (filters?.severity) params.append('severity', filters.severity);
      if (filters?.status) params.append('status', filters.status);

      const response = await fetch(`${API_BASE_URL}/admin/abuse-reports?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch abuse reports:', error);
      throw error;
    }
  }

  /**
   * Get auth token from localStorage
   */
  private static getAuthToken(): string {
    try {
      // Try admin token first, then regular user token
      const adminToken = localStorage.getItem('adminAuthToken');
      if (adminToken) return adminToken;

      const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
      return user.token || '';
    } catch {
      return '';
    }
  }
}
