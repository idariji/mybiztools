import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { authService, User } from '../services/authService';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (data: {
    firstName: string;
    lastName: string;
    businessName?: string;
    email: string;
    password: string;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAuthenticatedRef = useRef(false);

  const performLogout = useCallback(() => {
    authService.logout();
    setUser(null);
    isAuthenticatedRef.current = false;
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (!isAuthenticatedRef.current) return;

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(() => {
      if (isAuthenticatedRef.current) {
        console.log('Session expired due to inactivity');
        performLogout();
      }
    }, INACTIVITY_TIMEOUT);
  }, [performLogout]);

  // Check authentication status on mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    const token = authService.getToken();

    if (currentUser && token) {
      setUser(currentUser);
      isAuthenticatedRef.current = true;
    }
    setIsLoading(false);
  }, []);

  // Set up inactivity tracking when user is authenticated
  useEffect(() => {
    if (!user) {
      // Clear timer when logged out
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      return;
    }

    isAuthenticatedRef.current = true;

    // Start the inactivity timer
    resetInactivityTimer();

    // Add event listeners for user activity
    const handleActivity = () => {
      resetInactivityTimer();
    };

    ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      // Cleanup
      ACTIVITY_EVENTS.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [user, resetInactivityTimer]);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    if (response.success && response.data) {
      setUser(response.data.user);
      isAuthenticatedRef.current = true;
    }
    return { success: response.success, message: response.message };
  };

  const signup = async (data: {
    firstName: string;
    lastName: string;
    businessName?: string;
    email: string;
    password: string;
  }) => {
    const response = await authService.signup(data);
    if (response.success && response.data) {
      setUser(response.data.user);
      isAuthenticatedRef.current = true;
    }
    return { success: response.success, message: response.message };
  };

  const logout = () => {
    performLogout();
  };

  const refreshUser = () => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
