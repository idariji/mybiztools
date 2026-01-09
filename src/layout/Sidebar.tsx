import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import {
  LayoutDashboard, FileText, FileSpreadsheet, Receipt, CreditCard,
  QrCode, Calendar, PieChart, TrendingDown, Calculator, Bot,
  Settings, LogOut, ChevronLeft, Hexagon
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

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Invoice Generator', path: '/dashboard/invoices' },
    { icon: FileSpreadsheet, label: 'Quotation Generator', path: '/dashboard/quotations' },
    { icon: Receipt, label: 'Receipt Generator', path: '/dashboard/receipts' },
    { icon: CreditCard, label: 'Payslip Generator', path: '/dashboard/payslips/create' },
    { icon: QrCode, label: 'Business Card & QR', path: '/dashboard/business-card' },
    { icon: Calendar, label: 'Social Media Planner', path: '/dashboard/social-planner' },
    { icon: TrendingDown, label: 'Cost Manager', path: '/dashboard/cost-manager' },
    { icon: PieChart, label: 'Budget Tracker', path: '/dashboard/budget-tracker' },
    { icon: Calculator, label: 'Tax Calculator', path: '/dashboard/tax-calculator' },
    { icon: Bot, label: 'DEDAI Assistant', path: '/dashboard/dedai' },
  ];

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
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 lg:py-3 rounded-xl transition-all active:scale-95 ${location.pathname === item.path
                  ? 'bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] text-white shadow-lg'
                  : 'hover:bg-slate-100 text-slate-700 active:bg-slate-200'
                }`}
            >
              <item.icon className="w-5 h-5 lg:w-5 lg:h-5 shrink-0" />
              {!collapsed && <span className="text-sm lg:text-sm font-medium">{item.label}</span>}
            </button>
          ))}
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
