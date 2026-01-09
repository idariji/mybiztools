import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layout/DashboardLayout';
import { FileText, DollarSign, Clock, TrendingUp, Plus, Receipt, CreditCard, Bot, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../utils/useToast';
import { ToastContainer } from '../components/ui/Toast';
import { authService } from '../services/authService';
import { safeGetJSON } from '../utils/storage';

export function DashboardHome() {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    invoices: 0,
    quotations: 0,
    receipts: 0,
    payslips: 0
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // Get real stats from localStorage
    const invoices = safeGetJSON<any[]>('invoice-drafts', []);
    const quotations = safeGetJSON<any[]>('quotation-drafts', []);
    const receipts = safeGetJSON<any[]>('receipt-drafts', []);
    const payslips = safeGetJSON<any[]>('payslip-drafts', []);

    setStats({
      invoices: invoices.length,
      quotations: quotations.length,
      receipts: receipts.length,
      payslips: payslips.length
    });

    // Show welcome notification on first dashboard visit
    const hasShownWelcome = sessionStorage.getItem('welcomeShown');
    if (!hasShownWelcome) {
      const userName = currentUser?.firstName || currentUser?.name || 'User';
      addToast(`Welcome to MyBizTools, ${userName}!`, 'success');
      sessionStorage.setItem('welcomeShown', 'true');
    }
  }, [addToast]);

  const statCards = [
    { icon: FileText, label: 'Invoices Created', value: stats.invoices.toString(), color: 'bg-blue-500' },
    { icon: Receipt, label: 'Receipts Generated', value: stats.receipts.toString(), color: 'bg-green-500' },
    { icon: FileText, label: 'Quotations Made', value: stats.quotations.toString(), color: 'bg-orange-500' },
    { icon: CreditCard, label: 'Payslips Created', value: stats.payslips.toString(), color: 'bg-purple-500' },
  ];

  const quickActions = [
    { icon: FileText, label: 'New Invoice', color: 'bg-blue-500', action: () => navigate('/dashboard/invoices/create') },
    { icon: Receipt, label: 'New Receipt', color: 'bg-green-500', action: () => navigate('/dashboard/receipts/create') },
    { icon: FileText, label: 'New Quotation', color: 'bg-orange-500', action: () => navigate('/dashboard/quotations/create') },
    { icon: CreditCard, label: 'Generate Payslip', color: 'bg-purple-500', action: () => navigate('/dashboard/payslips/create') },
  ];

  const totalDocs = stats.invoices + stats.quotations + stats.receipts + stats.payslips;
  const recentActivity = totalDocs > 0 ? [
    { action: `${stats.invoices} invoice${stats.invoices !== 1 ? 's' : ''} created`, time: 'Total', icon: FileText },
    { action: `${stats.quotations} quotation${stats.quotations !== 1 ? 's' : ''} made`, time: 'Total', icon: FileText },
    { action: `${stats.receipts} receipt${stats.receipts !== 1 ? 's' : ''} generated`, time: 'Total', icon: Receipt },
    { action: `${stats.payslips} payslip${stats.payslips !== 1 ? 's' : ''} created`, time: 'Total', icon: CreditCard },
  ] : [
    { action: 'No documents created yet', time: 'Get started', icon: Plus },
    { action: 'Create your first invoice', time: 'Click Quick Actions', icon: FileText },
    { action: 'Generate a receipt', time: 'Track your sales', icon: Receipt },
    { action: 'Make a quotation', time: 'Send to clients', icon: FileText },
  ];

  const alerts = [
    { message: 'Complete your profile to unlock all features', type: 'info' },
    { message: totalDocs === 0 ? 'Start creating documents to track your business' : `You have created ${totalDocs} document${totalDocs !== 1 ? 's' : ''}`, type: 'info' },
    { message: 'All data is stored locally in your browser', type: 'warning' },
  ];

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <DashboardLayout>
      <div className="space-y-3 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-slate-900">Welcome back, {user?.firstName || user?.name || 'User'}! 👋</h1>
          <p className="text-xs sm:text-base text-slate-600 mt-1">Here's what's happening with your business today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {statCards.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl p-3.5 sm:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow active:scale-[0.98]"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={`${stat.color} p-2.5 sm:p-3 rounded-xl shadow-md`}>
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl sm:text-2xl font-bold text-slate-900">{stat.value}</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1 leading-tight">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-6 shadow-sm border border-slate-200">
          <h2 className="text-base sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.action}
                className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-6 rounded-xl border-2 border-slate-200 hover:border-[#FF8A2B] hover:bg-slate-50 transition-all active:scale-95 active:shadow-inner"
              >
                <div className={`${action.color} p-3 sm:p-4 rounded-xl shadow-md`}>
                  <action.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-900 text-center leading-tight">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-6 shadow-sm border border-slate-200">
            <h2 className="text-base sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <activity.icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-6 shadow-sm border border-slate-200">
            <h2 className="text-base sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">Alerts & Reminders</h2>
            <div className="space-y-3">
              {alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-4 rounded-lg ${
                    alert.type === 'error' ? 'bg-red-50' :
                    alert.type === 'warning' ? 'bg-orange-50' :
                    'bg-blue-50'
                  }`}
                >
                  <AlertCircle className={`w-5 h-5 shrink-0 ${
                    alert.type === 'error' ? 'text-red-600' :
                    alert.type === 'warning' ? 'text-orange-600' :
                    'text-blue-600'
                  }`} />
                  <p className="text-sm text-slate-700">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
    </>
  );
}
