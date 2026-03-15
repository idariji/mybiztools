import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { canAccessFeature } from '../utils/planUtils';
import {
  LayoutDashboard, FileText, Users, Package, Grid3X3,
  Receipt, FileSpreadsheet, CreditCard, Store, BarChart2,
  QrCode, Calendar, TrendingDown, PieChart, Calculator,
  Bot, Zap, Settings, LogOut, X, Lock, Hexagon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const plan = user?.current_plan;
  const [showMore, setShowMore] = useState(false);

  const isActive = (path: string, exact = false) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const go = (path: string, featureKey = '') => {
    setShowMore(false);
    if (featureKey && !canAccessFeature(plan, featureKey)) {
      navigate('/dashboard/subscription');
    } else {
      navigate(path);
    }
  };

  // Primary 4 tabs always shown
  const primary = [
    { icon: LayoutDashboard, label: 'Home',      path: '/dashboard',            exact: true,  featureKey: '' },
    { icon: FileText,        label: 'Invoices',   path: '/dashboard/invoices',   exact: false, featureKey: '' },
    { icon: Users,           label: 'CRM',        path: '/dashboard/customers',  exact: false, featureKey: '' },
    { icon: Package,         label: 'Inventory',  path: '/dashboard/inventory',  exact: false, featureKey: '' },
  ];

  // All items shown in the "More" sheet
  const moreItems = [
    { icon: FileSpreadsheet, label: 'Quotations',          path: '/dashboard/quotations',       featureKey: '' },
    { icon: Receipt,         label: 'Receipts',            path: '/dashboard/receipts',         featureKey: '' },
    { icon: CreditCard,      label: 'Payslips',            path: '/dashboard/payslips',         featureKey: '' },
    { icon: Store,           label: 'Storefront',          path: '/dashboard/storefront',       featureKey: '' },
    { icon: BarChart2,       label: 'Financing',           path: '/dashboard/financing',        featureKey: '' },
    { icon: QrCode,          label: 'Business Card',       path: '/dashboard/business-card',    featureKey: 'business-card' },
    { icon: Calendar,        label: 'Social Planner',      path: '/dashboard/social-planner',   featureKey: 'social-planner' },
    { icon: TrendingDown,    label: 'Cost Manager',        path: '/dashboard/cost-manager',     featureKey: '' },
    { icon: PieChart,        label: 'Budget Tracker',      path: '/dashboard/budget-tracker',   featureKey: 'budget-tracker' },
    { icon: Calculator,      label: 'Tax Calculator',      path: '/dashboard/tax-calculator',   featureKey: 'tax-calculator' },
    { icon: Bot,             label: 'DEDAI',               path: '/dashboard/dedai',            featureKey: 'dedai' },
    { icon: Zap,             label: 'Subscription',        path: '/dashboard/subscription',     featureKey: '' },
    { icon: Settings,        label: 'Settings',            path: '/dashboard/settings',         featureKey: '' },
  ];

  return (
    <>
      {/* More Sheet Overlay */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setShowMore(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-16 left-0 right-0 z-50 lg:hidden bg-white rounded-t-3xl shadow-2xl max-h-[70vh] overflow-y-auto"
            >
              {/* Sheet Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-slate-200 rounded-full" />
              </div>

              {/* Logo + close */}
              <div className="flex items-center justify-between px-5 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Hexagon className="w-6 h-6 fill-[#FF8A2B] text-[#FF8A2B]" />
                  <span className="font-bold text-slate-900">More</span>
                </div>
                <button
                  onClick={() => setShowMore(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Grid of items */}
              <div className="grid grid-cols-4 gap-1 p-4">
                {moreItems.map((item) => {
                  const locked = !!(item.featureKey && !canAccessFeature(plan, item.featureKey));
                  const active = location.pathname.startsWith(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => go(item.path, item.featureKey)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl active:scale-95 transition-all relative ${
                        active ? 'bg-[#FF8A2B]/10' : 'hover:bg-slate-50 active:bg-slate-100'
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                        active
                          ? 'bg-gradient-to-br from-[#FF8A2B] to-[#FF6B00] shadow-lg shadow-orange-500/25'
                          : locked
                          ? 'bg-slate-100'
                          : 'bg-slate-100'
                      }`}>
                        <item.icon className={`w-5 h-5 ${active ? 'text-white' : locked ? 'text-slate-300' : 'text-slate-600'}`} />
                      </div>
                      <span className={`text-[10px] font-medium text-center leading-tight ${
                        active ? 'text-[#FF8A2B]' : locked ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        {item.label}
                      </span>
                      {locked && (
                        <Lock className="w-3 h-3 text-slate-300 absolute top-2 right-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Logout */}
              <div className="px-4 pb-4">
                <button
                  onClick={() => { authService.logout(); navigate('/login'); }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-50 text-red-600 font-semibold text-sm active:bg-red-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] safe-area-bottom">
        <div className="grid grid-cols-5 h-16">
          {primary.map((item) => {
            const active = isActive(item.path, item.exact);
            return (
              <button
                key={item.path}
                onClick={() => go(item.path, item.featureKey)}
                className="flex flex-col items-center justify-center gap-1 active:scale-95 transition-all duration-150 relative"
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  active ? 'bg-gradient-to-br from-[#FF8A2B] to-[#FF6B00] shadow-lg shadow-orange-500/30' : ''
                }`}>
                  <item.icon className={`w-5 h-5 transition-colors ${active ? 'text-white' : 'text-slate-500'}`} />
                </div>
                <span className={`text-[10px] font-semibold transition-colors ${active ? 'text-[#FF8A2B]' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setShowMore(true)}
            className="flex flex-col items-center justify-center gap-1 active:scale-95 transition-all duration-150"
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
              showMore ? 'bg-gradient-to-br from-[#FF8A2B] to-[#FF6B00] shadow-lg shadow-orange-500/30' : ''
            }`}>
              <Grid3X3 className={`w-5 h-5 ${showMore ? 'text-white' : 'text-slate-500'}`} />
            </div>
            <span className={`text-[10px] font-semibold ${showMore ? 'text-[#FF8A2B]' : 'text-slate-400'}`}>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
