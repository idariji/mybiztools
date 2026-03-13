import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const ADMIN_ROLES = ['admin', 'super_admin', 'billing_admin', 'support_admin', 'viewer'];

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = authService.getCurrentUser();
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!user.role || !ADMIN_ROLES.includes(user.role)) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
