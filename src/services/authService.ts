// Frontend Auth Service - Communicates with backend API

import { API_BASE_URL } from '../config/apiConfig';
const API_URL = API_BASE_URL;

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  businessName: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  emailVerified: boolean;
  current_plan: string;
  role?: 'user' | 'admin' | 'super_admin' | 'billing_admin' | 'support_admin' | 'viewer';
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  firstName: string;
  lastName: string;
  businessName?: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
  error?: string;
}

class AuthServiceClass {
  private tokenKey = 'authToken';
  private userKey = 'user';

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Get current user from localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    if (!userStr) return null;
    try {
      const u = JSON.parse(userStr) as any;
      // Retroactively fix sessions stored before the camelCase→snake_case normalization
      if (u.currentPlan && !u.current_plan) {
        u.current_plan = u.currentPlan;
        localStorage.setItem(this.userKey, JSON.stringify(u));
      }
      return u as User;
    } catch {
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  // Login user
  async login(input: LoginInput): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.data) {
        const token = data.data.token;
        localStorage.setItem(this.tokenKey, token);
        // Normalise camelCase server fields to snake_case expected by frontend
        const u = data.data.user as any;
        if (u.currentPlan && !u.current_plan) u.current_plan = u.currentPlan;
        localStorage.setItem(this.userKey, JSON.stringify(u));

        // Fetch full profile to ensure phone, businessName, etc. are present
        // (login endpoint may only return basic auth fields)
        try {
          const profileRes = await fetch(`${API_URL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const profileData = await profileRes.json();
          if (profileData.success && profileData.data?.user) {
            const profile = profileData.data.user as any;
            if (profile.currentPlan && !profile.current_plan) profile.current_plan = profile.currentPlan;
            localStorage.setItem(this.userKey, JSON.stringify(profile));
            data.data.user = profile as User;
          }
        } catch {
          // Non-fatal: login still succeeded, just using basic user data
        }
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Failed to connect to server. Please try again.',
        error: 'NETWORK_ERROR',
      };
    }
  }

  // Signup new user
  async signup(input: SignupInput): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.data) {
        localStorage.setItem(this.tokenKey, data.data.token);
        const u = data.data.user as any;
        if (u.currentPlan && !u.current_plan) u.current_plan = u.currentPlan;
        localStorage.setItem(this.userKey, JSON.stringify(u));
      }

      return data;
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        message: 'Failed to connect to server. Please try again.',
        error: 'NETWORK_ERROR',
      };
    }
  }

  // Logout user
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem('dismissed-notifications');
    window.location.href = '/login';
  }

  // Verify email via OTP (sent to email after signup)
  async verifyEmailOtp(email: string, otp: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.data) {
        localStorage.setItem(this.tokenKey, data.data.token);
        const u = data.data.user as any;
        if (u.currentPlan && !u.current_plan) u.current_plan = u.currentPlan;
        localStorage.setItem(this.userKey, JSON.stringify(u));
      }

      return data;
    } catch (error) {
      console.error('OTP verification error:', error);
      return { success: false, message: 'Failed to verify email. Please try again.', error: 'NETWORK_ERROR' };
    }
  }

  // Resend email verification OTP
  async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      return await response.json();
    } catch (error) {
      console.error('Resend OTP error:', error);
      return { success: false, message: 'Failed to resend verification code. Please try again.', error: 'NETWORK_ERROR' };
    }
  }

  // Request password reset — backend sends OTP to email
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      return await response.json();
    } catch (error) {
      console.error('Password reset request error:', error);
      return { success: false, message: 'Failed to request password reset. Please try again.', error: 'NETWORK_ERROR' };
    }
  }

  // Reset password using OTP from email
  async resetPassword(email: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password: newPassword }),
      });

      return await response.json();
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, message: 'Failed to reset password. Please try again.', error: 'NETWORK_ERROR' };
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<AuthResponse> {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data: AuthResponse = await response.json();

      if (data.success) {
        // Prefer full user from server; fall back to merging updates into current user
        const serverUser = data.data?.user as any;
        const merged: any = serverUser
          ? { ...serverUser }
          : { ...this.getCurrentUser(), ...updates };
        if (merged.currentPlan && !merged.current_plan) merged.current_plan = merged.currentPlan;
        localStorage.setItem(this.userKey, JSON.stringify(merged));
        // Ensure data.data reflects what we stored so callers get the full object
        if (!data.data) data.data = { user: merged as User, token: token || '' };
      }

      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: 'Failed to update profile. Please try again.',
        error: 'NETWORK_ERROR',
      };
    }
  }
}

export const authService = new AuthServiceClass();
export default authService;
