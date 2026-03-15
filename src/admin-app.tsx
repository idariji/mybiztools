/**
 * Admin Portal standalone entry point.
 * Deployed separately from the main website (e.g. admin.mybiztools.ng).
 * Keeps the same /admin/* path structure so existing navigation in
 * AdminLoginPage (/admin) and AdminProtectedRoute (/admin/login) work
 * without any code changes.
 */
import './index.css';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminDashboardPage } from './admin/pages/AdminDashboardPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminProtectedRoute } from './components/auth/AdminProtectedRoute';

function AdminApp() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root → redirect to login */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />

        {/* Admin auth */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin dashboard (protected) */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminDashboardPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <AdminProtectedRoute>
              <AdminDashboardPage />
            </AdminProtectedRoute>
          }
        />

        {/* Catch-all → back to login */}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')!).render(<AdminApp />);
