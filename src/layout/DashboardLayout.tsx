import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileBottomNav } from './MobileBottomNav';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F0F3F5]">
      {/* Sidebar — desktop only */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
      </div>

      <div className={`transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-64'} ml-0`}>
        <TopBar onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* Extra bottom padding on mobile for the bottom nav bar */}
        <main className="p-3 sm:p-6 pb-24 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <MobileBottomNav />
    </div>
  );
}
