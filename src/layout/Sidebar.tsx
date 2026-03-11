import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { canAccessFeature } from '../utils/planUtils';
import {
  LayoutDashboard, FileText, FileSpreadsheet, Receipt, CreditCard,
  QrCode, Calendar, PieChart, TrendingDown, Calculator, Bot,
  Settings, LogOut, ChevronLeft, Hexagon, Zap, Lock
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export function Sidebar({ collapsed, setCollapsed, mobileMenuOpen, setMobileMenuOpen }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const plan = user?.current_plan;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard',           path: '/dashboard',                exact: true,  featureKey: '' },
    { icon: FileText,        label: 'Invoices',            path: '/dashboard/invoices',        exact: false, featureKey: '' },
    { icon: FileSpreadsheet, label: 'Quotations',          path: '/dashboard/quotations',      exact: false, featureKey: '' },
    { icon: Receipt,         label: 'Receipts',            path: '/dashboard/receipts',        exact: false, featureKey: '' },
    { icon: CreditCard,      label: 'Payslips',            path: '/dashboard/payslips',        exact: false, featureKey: '' },
    { icon: QrCode,          label: 'Business Card & QR', path: '/dashboard/business-card',   exact: false, featureKey: 'business-card' },
    { icon: Calendar,        label: 'Social Media Planner',path: '/dashboard/social-planner', exact: false, featureKey: 'social-planner' },
    { icon: TrendingDown,    label: 'Cost Manager',        path: '/dashboard/cost-manager',    exact: false, featureKey: '' },
    { icon: PieChart,        label: 'Budget Tracker',      path: '/dashboard/budget-tracker',  exact: false, featureKey: 'budget-tracker' },
    { icon: Calculator,      label: 'Tax Calculator',      path: '/dashboard/tax-calculator',  exact: false, featureKey: 'tax-calculator' },
    { icon: Bot,             label: 'DEDAI Assistant',     path: '/dashboard/dedai',           exact: false, featureKey: 'dedai' },
    { icon: Zap,             label: 'Subscription',        path: '/dashboard/subscription',    exact: false, featureKey: '' },
  ];

  const isActive = (item: { path: string; exact?: boolean }) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  const handleNavClick = (item: typeof menuItems[0]) => {
    if (item.featureKey && !canAccessFeature(plan, item.featureKey)) {
      navigate('/dashboard/subscription');
    } else {
      navigate(item.path);
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
      )}
      <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 text-slate-900 transition-transform duration-300 z-50 shadow-2xl
        ${collapsed ? 'lg:w-20' : 'lg:w-64'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-72 lg:w-64`}>
        <div className="flex items-center justify-between p-4 lg:p-4 border-b border-slate-200">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Hexagon className="w-9 h-9 lg:w-8 lg:h-8 fill-[#FF8A2B] text-[#FF8A2B]" />
              <span className="font-bold text-xl lg:text-lg text-slate-900">MyBizTools</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors hidden lg:block"
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <nav className="p-3 lg:p-4 space-y-1.5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {menuItems.map((item) => {
            const locked = !!(item.featureKey && !canAccessFeature(plan, item.featureKey));
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item)}
                title={locked ? 'Upgrade to access this feature' : item.label}
                className={`w-full flex items-center gap-3 px-4 py-3.5 lg:py-3 rounded-xl transition-all active:scale-95 relative ${
                  locked
                    ? 'text-slate-400 hover:bg-slate-50 cursor-pointer'
                    : isActive(item)
                    ? 'bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] text-white shadow-lg'
                    : 'hover:bg-slate-100 text-slate-700 active:bg-slate-200'
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                )}
                {locked && !collapsed && (
                  <Lock className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                )}
                {locked && collapsed && (
                  <Lock className="w-3 h-3 text-slate-300 absolute top-1 right-1" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-4 border-t border-slate-200 space-y-1.5 bg-white">
          <button
            onClick={() => {
              navigate('/dashboard/settings');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 lg:py-3 rounded-xl transition-all active:scale-95 ${location.pathname === '/dashboard/settings'
                ? 'bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] text-white shadow-lg'
                : 'hover:bg-slate-100 text-slate-700 active:bg-slate-200'
              }`}
          >
            <Settings className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Settings</span>}
          </button>
          <button
            onClick={() => {
              authService.logout();
              navigate('/login');
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3.5 lg:py-3 rounded-xl hover:bg-red-50 text-red-600 transition-all active:scale-95 active:bg-red-100"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
