/**
 * User Management Component
 * View all users with filtering for free vs paid users
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Crown,
  Search,
  Mail,
  Download,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Zap,
  Ban,
  Eye,
  RefreshCw,
  X
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  businessName: string | null;
  phone: string | null;
  currentPlan: string;
  subscriptionStatus: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

import { API_BASE_URL as API_URL } from '../../config/apiConfig';

type UserFilter = 'all' | 'free' | 'paid' | 'pro' | 'enterprise';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState<UserFilter>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const usersPerPage = 10;

  const [stats, setStats] = useState({
    totalUsers: 0,
    freeUsers: 0,
    paidUsers: 0,
    proUsers: 0,
    enterpriseUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0
  });

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => { filterUsers(); }, [users, searchTerm, userFilter, statusFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminAuthToken');
      const response = await fetch(`${API_URL}/api/admin/users?limit=1000`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        const userList = data.data?.users || data.data || [];
        setUsers(userList);
        calculateStats(userList);
      } else {
        setUsers([]);
        calculateStats([]);
      }
    } catch {
      setUsers([]);
      calculateStats([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (userList: User[]) => {
    const freeUsers = userList.filter(u => u.currentPlan === 'free').length;
    const proUsers = userList.filter(u => u.currentPlan === 'pro').length;
    const enterpriseUsers = userList.filter(u => u.currentPlan === 'enterprise').length;
    const activeUsers = userList.filter(u => u.subscriptionStatus === 'active').length;
    const suspendedUsers = userList.filter(u => u.subscriptionStatus === 'suspended').length;
    setStats({ totalUsers: userList.length, freeUsers, paidUsers: proUsers + enterpriseUsers, proUsers, enterpriseUsers, activeUsers, suspendedUsers });
  };

  const filterUsers = () => {
    let filtered = [...users];
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        u.email.toLowerCase().includes(search) ||
        (u.firstName?.toLowerCase() || '').includes(search) ||
        (u.lastName?.toLowerCase() || '').includes(search) ||
        (u.businessName?.toLowerCase() || '').includes(search)
      );
    }
    if (userFilter !== 'all') {
      switch (userFilter) {
        case 'free': filtered = filtered.filter(u => u.currentPlan === 'free'); break;
        case 'paid': filtered = filtered.filter(u => u.currentPlan !== 'free'); break;
        case 'pro': filtered = filtered.filter(u => u.currentPlan === 'pro'); break;
        case 'enterprise': filtered = filtered.filter(u => u.currentPlan === 'enterprise'); break;
      }
    }
    if (statusFilter !== 'all') filtered = filtered.filter(u => u.subscriptionStatus === statusFilter);
    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleSuspendUser = async (userId: string) => {
    if (!confirm('Are you sure you want to suspend this user?')) return;
    try {
      const token = localStorage.getItem('adminAuthToken');
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/suspension`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspended: true, reason: 'Admin action' })
      });
      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, subscriptionStatus: 'suspended' } : u));
      }
    } catch { /* ignore */ }
  };

  const handleReactivateUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('adminAuthToken');
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/suspension`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspended: false, reason: 'Admin reactivation' })
      });
      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, subscriptionStatus: 'active' } : u));
      }
    } catch { /* ignore */ }
  };

  const exportUsers = () => {
    const csv = [
      ['Email', 'Name', 'Business', 'Plan', 'Status', 'Created', 'Last Login'].join(','),
      ...filteredUsers.map(u => [
        u.email,
        `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        u.businessName || '',
        u.currentPlan,
        u.subscriptionStatus,
        new Date(u.createdAt).toLocaleDateString(),
        u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'
      ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${userFilter}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-[#FF8A2B] rounded-full animate-spin mx-auto mb-2" />
          <p className="text-slate-500 text-sm">Loading users...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, gradient: 'from-blue-400 to-blue-600', shadow: 'shadow-blue-500/30', filter: 'all' as UserFilter },
    { label: 'Free Users', value: stats.freeUsers, icon: UserCheck, gradient: 'from-slate-400 to-slate-600', shadow: 'shadow-slate-500/30', filter: 'free' as UserFilter },
    { label: 'Paid Users', value: stats.paidUsers, icon: Crown, gradient: 'from-emerald-400 to-green-600', shadow: 'shadow-green-500/30', filter: 'paid' as UserFilter },
    { label: 'Pro Users', value: stats.proUsers, icon: Zap, gradient: 'from-orange-400 to-orange-600', shadow: 'shadow-orange-500/30', filter: 'pro' as UserFilter },
    { label: 'Enterprise', value: stats.enterpriseUsers, icon: Crown, gradient: 'from-purple-400 to-purple-600', shadow: 'shadow-purple-500/30', filter: 'enterprise' as UserFilter },
    { label: 'Active', value: stats.activeUsers, icon: UserCheck, gradient: 'from-emerald-400 to-green-600', shadow: 'shadow-green-500/30', filter: null },
    { label: 'Suspended', value: stats.suspendedUsers, icon: UserX, gradient: 'from-red-400 to-red-600', shadow: 'shadow-red-500/30', filter: null }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {statCards.map((card, idx) => (
          <motion.button
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => card.filter && setUserFilter(card.filter)}
            className={`bg-white rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] ${
              card.filter && userFilter === card.filter
                ? 'border-[#FF8A2B]/40 ring-2 ring-[#FF8A2B]/20 shadow-[0_4px_16px_rgba(255,138,43,0.15)]'
                : 'border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
            } ${card.filter ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <div className={`w-9 h-9 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center shadow-lg ${card.shadow} mb-3`}>
              <card.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">{card.value.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">{card.label}</p>
          </motion.button>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by email, name, or business..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] transition-all"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="expired">Expired</option>
          </select>
          <button
            onClick={exportUsers}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-all"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] text-white rounded-xl text-sm font-semibold shadow-lg shadow-orange-500/25 hover:-translate-y-0.5 hover:shadow-orange-500/40 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">User</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Business</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Plan</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Created</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Last Login</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <Users className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                    <p className="text-slate-400 font-medium text-sm">No users found matching your criteria</p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, idx) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-white transition-colors duration-150"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-[#FF8A2B] to-[#FF6B00] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md shadow-orange-500/20">
                          {(user.firstName?.charAt(0) || user.email.charAt(0)).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.email.split('@')[0]}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />{user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{user.businessName || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getPlanBadge(user.currentPlan)}`}>
                        {user.currentPlan === 'enterprise' && <Crown className="w-3 h-3" />}
                        {user.currentPlan === 'pro' && <Zap className="w-3 h-3" />}
                        {user.currentPlan.charAt(0).toUpperCase() + user.currentPlan.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(user.subscriptionStatus)}`}>
                        {user.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => { setSelectedUser(user); setShowUserModal(true); }}
                          className="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {user.subscriptionStatus === 'active' ? (
                          <button
                            onClick={() => handleSuspendUser(user.id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                            title="Suspend User"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivateUser(user.id)}
                            className="p-2 hover:bg-emerald-50 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                            title="Reactivate User"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
            <p className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-700">{startIndex + 1}</span>–<span className="font-semibold text-slate-700">{Math.min(startIndex + usersPerPage, filteredUsers.length)}</span> of <span className="font-semibold text-slate-700">{filteredUsers.length}</span> users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:shadow-sm transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <span className="text-sm font-medium text-slate-600 px-1">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:shadow-sm transition-all"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => { setShowUserModal(false); setSelectedUser(null); }}
        />
      )}
    </motion.div>
  );
}

function UserDetailModal({ user, onClose }: { user: User; onClose: () => void }) {
  const initials = (user.firstName?.charAt(0) || user.email.charAt(0)).toUpperCase();
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">User Details</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#FF8A2B] to-[#FF6B00] rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-orange-500/25">
              {initials}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email.split('@')[0]}
              </h3>
              <p className="text-slate-500 text-sm">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Business Name', value: user.businessName || 'Not set' },
              { label: 'Phone', value: user.phone || 'Not set' },
              { label: 'Plan', value: user.currentPlan.charAt(0).toUpperCase() + user.currentPlan.slice(1) },
              { label: 'Status', value: user.subscriptionStatus.charAt(0).toUpperCase() + user.subscriptionStatus.slice(1) },
              { label: 'Email Verified', value: user.emailVerified ? 'Yes' : 'No' },
              { label: 'Created', value: new Date(user.createdAt).toLocaleDateString() }
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-xs text-slate-500 font-medium mb-0.5">{label}</p>
                <p className="font-semibold text-slate-900 text-sm">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium transition-colors">
            Close
          </button>
          <button className="px-4 py-2.5 text-white bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] rounded-xl text-sm font-semibold shadow-lg shadow-orange-500/25 hover:-translate-y-0.5 transition-all duration-200">
            Send Email
          </button>
        </div>
      </motion.div>
    </div>
  );
}
