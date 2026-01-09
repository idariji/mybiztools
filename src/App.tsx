import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { EmailVerificationPage } from './pages/EmailVerificationPage';
import { DashboardHome } from './pages/DashboardHome';
import { InvoicePage } from './pages/InvoicePage';
import { BudgetPage } from './pages/BudgetPage';
import { InvoiceGeneratorPage } from './pages/InvoiceGeneratorPage';
import { QuotationPage } from './pages/QuotationPage';
import { QuotationGeneratorPage } from './pages/QuotationGeneratorPage';
import { ReceiptPage } from './pages/ReceiptPage';
import { ReceiptGeneratorPage } from './pages/ReceiptGeneratorPage';
import { PayslipGeneratorPage } from './pages/PayslipGeneratorPage';
import { BusinessCardPage } from './pages/BusinessCardPage';
import { SocialPlannerPage } from './pages/SocialPlannerPage';
import { BudgetTrackerPage } from './pages/BudgetTrackerPage';
import { CostManagerPage } from './pages/CostManagerPage';
import { TaxCalculatorPage } from './pages/TaxCalculatorPage';
import { AccountPage } from './pages/AccountPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { DEDAPage } from './pages/DEDAPage';
import { DashboardLayout } from './layout/DashboardLayout';
import { DEDAChat } from './components/dashboard/DEDAChat';
// Admin dashboard moved to standalone admin-portal app (runs on port 5174)

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
          <Route path="/dashboard/invoices" element={<ProtectedRoute><InvoicePage /></ProtectedRoute>} />
          <Route path="/dashboard/invoices/create" element={<ProtectedRoute><InvoiceGeneratorPage /></ProtectedRoute>} />
          <Route path="/dashboard/quotations" element={<ProtectedRoute><QuotationPage /></ProtectedRoute>} />
          <Route path="/dashboard/quotations/create" element={<ProtectedRoute><QuotationGeneratorPage /></ProtectedRoute>} />
          <Route path="/dashboard/receipts" element={<ProtectedRoute><ReceiptPage /></ProtectedRoute>} />
          <Route path="/dashboard/receipts/create" element={<ProtectedRoute><ReceiptGeneratorPage /></ProtectedRoute>} />
          <Route path="/dashboard/payslips/create" element={<ProtectedRoute><DashboardLayout><PayslipGeneratorPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/budget" element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
          <Route path="/dashboard/business-card" element={<ProtectedRoute><DashboardLayout><BusinessCardPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/social-planner" element={<ProtectedRoute><DashboardLayout><SocialPlannerPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/budget-tracker" element={<ProtectedRoute><DashboardLayout><BudgetTrackerPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/cost-manager" element={<ProtectedRoute><DashboardLayout><CostManagerPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/tax-calculator" element={<ProtectedRoute><DashboardLayout><TaxCalculatorPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/account" element={<ProtectedRoute><DashboardLayout><AccountPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/profile" element={<ProtectedRoute><DashboardLayout><ProfilePage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/settings" element={<ProtectedRoute><DashboardLayout><SettingsPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/dedai" element={<ProtectedRoute><DashboardLayout><DEDAPage /></DashboardLayout></ProtectedRoute>} />
        </Routes>
        <DEDAChat />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}