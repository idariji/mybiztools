// Frontend Auth Service - Communicates with backend API

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
      return JSON.parse(userStr);
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
        localStorage.setItem(this.tokenKey, data.data.token);
        localStorage.setItem(this.userKey, JSON.stringify(data.data.user));
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
        localStorage.setItem(this.userKey, JSON.stringify(data.data.user));
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
    window.location.href = '/login';
  }

  // Verify email with token
  async verifyEmail(token: string): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      // If verification successful, update user in localStorage
      if (data.success) {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
          currentUser.emailVerified = true;
          localStorage.setItem(this.userKey, JSON.stringify(currentUser));
        }
      }

      return data;
    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        message: 'Failed to verify email. Please try again.',
        error: 'NETWORK_ERROR',
      };
    }
  }

  // Resend verification email
  async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      return await response.json();
    } catch (error) {
      console.error('Resend verification error:', error);
      return {
        success: false,
        message: 'Failed to resend verification email. Please try again.',
        error: 'NETWORK_ERROR',
      };
    }
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      return await response.json();
    } catch (error) {
      console.error('Password reset request error:', error);
      return {
        success: false,
        message: 'Failed to request password reset. Please try again.',
        error: 'NETWORK_ERROR',
      };
    }
  }

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/api/auth/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password: newPassword }),
      });

      return await response.json();
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        message: 'Failed to reset password. Please try again.',
        error: 'NETWORK_ERROR',
      };
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

      if (data.success && data.data) {
        localStorage.setItem(this.userKey, JSON.stringify(data.data.user));
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
