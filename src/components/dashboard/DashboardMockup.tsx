import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, Receipt, PieChart, Calculator, Bot, Settings, Bell, Search, TrendingUp, TrendingDown, Users, Clock } from 'lucide-react';
export function DashboardMockup() {
  const navItems = [{
    icon: LayoutDashboard,
    label: 'Dashboard',
    active: true
  }, {
    icon: FileText,
    label: 'Invoices',
    active: false
  }, {
    icon: Receipt,
    label: 'Receipts',
    active: false
  }, {
    icon: PieChart,
    label: 'Budget',
    active: false
  }, {
    icon: Calculator,
    label: 'Tax',
    active: false
  }, {
    icon: Bot,
    label: 'DEDA AI',
    active: false
  }];
  const stats = [{
    label: 'Total Revenue',
    value: '₦4,250,000',
    trend: '+12.5%',
    trendUp: true,
    icon: TrendingUp,
    color: 'bg-[#2EA44F]/10 text-[#2EA44F]'
  }, {
    label: 'Pending Invoices',
    value: '8',
    trend: '₦450k',
    trendUp: null,
    icon: Clock,
    color: 'bg-[#2068F0]/10 text-[#2068F0]'
  }, {
    label: 'Active Clients',
    value: '142',
    trend: '+4',
    trendUp: true,
    icon: Users,
    color: 'bg-[#FF8A2B]/10 text-[#FF8A2B]'
  }, {
    label: 'Expenses',
    value: '₦1,205,000',
    trend: '-2.4%',
    trendUp: false,
    icon: TrendingDown,
    color: 'bg-[#E53935]/10 text-[#E53935]'
  }];
  const transactions = [{
    client: 'TechStart Ltd',
    service: 'Web Development',
    date: 'Oct 24, 2023',
    amount: '₦450,000',
    status: 'Paid'
  }, {
    client: 'Global Ventures',
    service: 'Consultation',
    date: 'Oct 23, 2023',
    amount: '₦120,000',
    status: 'Pending'
  }, {
    client: 'Sarah Designs',
    service: 'Brand Identity',
    date: 'Oct 21, 2023',
    amount: '₦85,000',
    status: 'Paid'
  }];
  return <div className="w-full bg-[#F2F4F7] rounded-2xl overflow-hidden shadow-2xl border border-[#FFD6C2]/50 font-sans text-[#1F2D3D] flex h-[600px] md:h-[700px] max-w-[1200px] mx-auto relative">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-[#F2F4F7] hidden md:flex flex-col p-6">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-[#FF8A2B] flex items-center justify-center text-white font-bold">
            M
          </div>
          <span className="font-bold text-lg tracking-tight">MyBizTools</span>
        </div>

        {/* Nav */}
        <div className="space-y-2 flex-1">
          {navItems.map((item, idx) => <div key={idx} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${item.active ? 'bg-[#FF8A2B]/10 text-[#FF8A2B]' : 'text-[#1F2D3D]/70 hover:bg-[#F2F4F7]'}`}>
              <item.icon size={20} />
              {item.label}
            </div>)}
        </div>

        {/* Bottom Nav */}
        <div className="mt-auto pt-6 border-t border-[#F2F4F7]">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#1F2D3D]/70 hover:bg-[#F2F4F7] cursor-pointer">
            <Settings size={20} />
            Settings
          </div>

          {/* User Profile Mini */}
          <div className="flex items-center gap-3 mt-4 px-2">
            <div className="w-8 h-8 rounded-full bg-[#FFD6C2] overflow-hidden border border-[#FF8A2B]/20">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">John Doe</div>
              <div className="text-xs text-[#1F2D3D]/50 truncate">Pro Plan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F2F4F7]">
        {/* Header */}
        <div className="h-20 bg-white border-b border-[#F2F4F7] px-6 md:px-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-[#1F2D3D]">Dashboard</h2>
            <p className="text-xs text-[#1F2D3D]/50 hidden sm:block">
              Welcome back, here's what's happening today.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1F2D3D]/30" size={18} />
              <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-[#F2F4F7] rounded-lg text-sm border-none focus:ring-2 focus:ring-[#FF8A2B]/50 w-64" />
            </div>
            <button className="relative p-2 rounded-full hover:bg-[#F2F4F7] text-[#1F2D3D]/70">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E53935] rounded-full border border-white"></span>
            </button>
            <button className="md:hidden p-2 rounded-full bg-[#FF8A2B] text-white">
              <LayoutDashboard size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, idx) => <motion.div key={idx} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: idx * 0.1
          }} className="bg-white p-5 rounded-2xl shadow-sm border border-[#F2F4F7]">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                  {stat.trendUp !== null && <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trendUp ? 'bg-[#2EA44F]/10 text-[#2EA44F]' : 'bg-[#E53935]/10 text-[#E53935]'}`}>
                      {stat.trend}
                    </span>}
                  {stat.trendUp === null && <span className="text-xs font-bold px-2 py-1 rounded-full bg-[#2068F0]/10 text-[#2068F0]">
                      {stat.trend}
                    </span>}
                </div>
                <div className="text-[#1F2D3D]/60 text-sm font-medium mb-1">
                  {stat.label}
                </div>
                <div className="text-2xl font-bold text-[#1F2D3D]">
                  {stat.value}
                </div>
              </motion.div>)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart Section */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-[#F2F4F7]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-[#1F2D3D]">Revenue Overview</h3>
                <select className="text-sm bg-[#F2F4F7] border-none rounded-lg px-3 py-1 text-[#1F2D3D]/70 font-medium focus:ring-0 cursor-pointer">
                  <option>This Month</option>
                  <option>Last Month</option>
                  <option>This Year</option>
                </select>
              </div>

              {/* CSS Chart */}
              <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-4">
                {[35, 55, 40, 70, 50, 85, 60, 75, 50, 90, 65, 80].map((h, i) => <div key={i} className="w-full flex flex-col items-center gap-2 group cursor-pointer">
                      <div className="relative w-full bg-[#F2F4F7] rounded-t-lg h-full overflow-hidden">
                        <motion.div initial={{
                    height: 0
                  }} animate={{
                    height: `${h}%`
                  }} transition={{
                    duration: 1,
                    delay: 0.2 + i * 0.05
                  }} className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-[#FF8A2B] to-[#FFD6C2] opacity-80 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-[10px] text-[#1F2D3D]/40 font-medium hidden sm:block">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                      </span>
                    </div>)}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#F2F4F7]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-[#1F2D3D]">Recent Invoices</h3>
                <button className="text-[#FF8A2B] text-sm font-bold hover:underline">
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {transactions.map((tx, i) => <div key={i} className="flex items-center justify-between p-3 hover:bg-[#F2F4F7] rounded-xl transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#FFD6C2]/30 flex items-center justify-center text-[#FF8A2B] group-hover:bg-[#FF8A2B] group-hover:text-white transition-colors">
                        <FileText size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#1F2D3D]">
                          {tx.client}
                        </div>
                        <div className="text-xs text-[#1F2D3D]/50">
                          {tx.service}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#1F2D3D]">
                        {tx.amount}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tx.status === 'Paid' ? 'bg-[#2EA44F]/10 text-[#2EA44F]' : 'bg-[#FF8A2B]/10 text-[#FF8A2B]'}`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>)}
              </div>

              <button className="w-full mt-6 py-3 rounded-xl border border-[#FF8A2B] text-[#FF8A2B] font-bold text-sm uppercase tracking-wide hover:bg-[#FF8A2B] hover:text-white transition-colors">
                Create New Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Overlay Gradient for "Mockup" feel */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-black/5"></div>
    </div>;
}