/**
 * User Management Component
 * View all users with filtering for free vs paid users
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Crown,
  Search,
  Filter,
  Mail,
  Calendar,
  DollarSign,
  MoreVertical,
  Eye,
  Ban,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Zap
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  businessName: string | null;
  phone: string | null;
  current_plan: string;
  subscription_status: string;
  emailVerified: boolean;
  created_at: string;
  last_login_at: string | null;
  mrr_value?: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    freeUsers: 0,
    paidUsers: 0,
    proUsers: 0,
    enterpriseUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, userFilter, statusFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminAuthToken');
      const response = await fetch(`${API_URL}/api/admin/users?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const userList = data.data?.users || data.data || [];
        setUsers(userList);
        calculateStats(userList);
      } else {
        // Show empty state on error
        setUsers([]);
        calculateStats([]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
      calculateStats([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (userList: User[]) => {
    const freeUsers = userList.filter(u => u.current_plan === 'free').length;
    const proUsers = userList.filter(u => u.current_plan === 'pro').length;
    const enterpriseUsers = userList.filter(u => u.current_plan === 'enterprise').length;
    const activeUsers = userList.filter(u => u.subscription_status === 'active').length;
    const suspendedUsers = userList.filter(u => u.subscription_status === 'suspended').length;

    setStats({
      totalUsers: userList.length,
      freeUsers,
      paidUsers: proUsers + enterpriseUsers,
      proUsers,
      enterpriseUsers,
      activeUsers,
      suspendedUsers
    });
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(search) ||
        (user.firstName?.toLowerCase() || '').includes(search) ||
        (user.lastName?.toLowerCase() || '').includes(search) ||
        (user.businessName?.toLowerCase() || '').includes(search)
      );
    }

    // Apply user type filter
    if (userFilter !== 'all') {
      switch (userFilter) {
        case 'free':
          filtered = filtered.filter(u => u.current_plan === 'free');
          break;
        case 'paid':
          filtered = filtered.filter(u => u.current_plan !== 'free');
          break;
        case 'pro':
          filtered = filtered.filter(u => u.current_plan === 'pro');
          break;
        case 'enterprise':
          filtered = filtered.filter(u => u.current_plan === 'enterprise');
          break;
      }
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => u.subscription_status === statusFilter);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleSuspendUser = async (userId: string) => {
    if (!confirm('Are you sure you want to suspend this user?')) return;

    try {
      const token = localStorage.getItem('adminAuthToken');
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/suspension`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ suspended: true, reason: 'Admin action' })
      });

      if (response.ok) {
        setUsers(users.map(u =>
          u.id === userId ? { ...u, subscription_status: 'suspended' } : u
        ));
        alert('User suspended successfully');
      } else {
        const error = await response.json().catch(() => ({}));
        alert(`Failed to suspend user: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to suspend user:', error);
      alert('Failed to suspend user. Please check your connection.');
    }
  };

  const handleReactivateUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('adminAuthToken');
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/suspension`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ suspended: false, reason: 'Admin reactivation' })
      });

      if (response.ok) {
        setUsers(users.map(u =>
          u.id === userId ? { ...u, subscription_status: 'active' } : u
        ));
        alert('User reactivated successfully');
      } else {
        const error = await response.json().catch(() => ({}));
        alert(`Failed to reactivate user: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to reactivate user:', error);
      alert('Failed to reactivate user. Please check your connection.');
    }
  };

  const exportUsers = () => {
    const csv = [
      ['Email', 'Name', 'Business', 'Plan', 'Status', 'Created', 'Last Login'].join(','),
      ...filteredUsers.map(u => [
        u.email,
        `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        u.businessName || '',
        u.current_plan,
        u.subscription_status,
        new Date(u.created_at).toLocaleDateString(),
        u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'Never'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${userFilter}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800';
      case 'pro':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="bg-gray-100"
          iconColor="text-gray-600"
          onClick={() => setUserFilter('all')}
          active={userFilter === 'all'}
        />
        <StatCard
          label="Free Users"
          value={stats.freeUsers}
          icon={UserCheck}
          color="bg-gray-50"
          iconColor="text-gray-500"
          onClick={() => setUserFilter('free')}
          active={userFilter === 'free'}
        />
        <StatCard
          label="Paid Users"
          value={stats.paidUsers}
          icon={Crown}
          color="bg-green-50"
          iconColor="text-green-600"
          onClick={() => setUserFilter('paid')}
          active={userFilter === 'paid'}
        />
        <StatCard
          label="Pro Users"
          value={stats.proUsers}
          icon={Zap}
          color="bg-blue-50"
          iconColor="text-blue-600"
          onClick={() => setUserFilter('pro')}
          active={userFilter === 'pro'}
        />
        <StatCard
          label="Enterprise"
          value={stats.enterpriseUsers}
          icon={Crown}
          color="bg-purple-50"
          iconColor="text-purple-600"
          onClick={() => setUserFilter('enterprise')}
          active={userFilter === 'enterprise'}
        />
        <StatCard
          label="Active"
          value={stats.activeUsers}
          icon={UserCheck}
          color="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          label="Suspended"
          value={stats.suspendedUsers}
          icon={UserX}
          color="bg-red-50"
          iconColor="text-red-600"
        />
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email, name, or business..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="expired">Expired</option>
          </select>

          {/* Export */}
          <button
            onClick={exportUsers}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>

          {/* Refresh */}
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No users found matching your criteria
                  </td>
                </tr>
              ) : (
                paginatedUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                          {(user.firstName?.charAt(0) || user.email.charAt(0)).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.email.split('@')[0]}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {user.businessName || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPlanBadge(user.current_plan)}`}>
                        {user.current_plan === 'enterprise' && <Crown className="w-3 h-3 mr-1" />}
                        {user.current_plan === 'pro' && <Zap className="w-3 h-3 mr-1" />}
                        {user.current_plan.charAt(0).toUpperCase() + user.current_plan.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.subscription_status)}`}>
                        {user.subscription_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {user.last_login_at
                        ? new Date(user.last_login_at).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {user.subscription_status === 'active' ? (
                          <button
                            onClick={() => handleSuspendUser(user.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Suspend User"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivateUser(user.id)}
                            className="p-1 text-gray-400 hover:text-green-600"
                            title="Reactivate User"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  iconColor: string;
  onClick?: () => void;
  active?: boolean;
}

function StatCard({ label, value, icon: Icon, color, iconColor, onClick, active }: StatCardProps) {
  return (
    <button
      onClick={onClick}
      className={`${color} rounded-lg p-4 text-left transition-all ${
        onClick ? 'cursor-pointer hover:ring-2 hover:ring-blue-500' : ''
      } ${active ? 'ring-2 ring-blue-600' : ''}`}
    >
      <div className="flex items-center justify-between">
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
      <p className="text-xs text-gray-600 mt-1">{label}</p>
    </button>
  );
}

// User Detail Modal
function UserDetailModal({ user, onClose }: { user: User; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">User Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              &times;
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
              {(user.firstName?.charAt(0) || user.email.charAt(0)).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.email.split('@')[0]}
              </h3>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div>
              <p className="text-sm text-gray-500">Business Name</p>
              <p className="font-medium text-gray-900">{user.businessName || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium text-gray-900">{user.phone || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Plan</p>
              <p className="font-medium text-gray-900 capitalize">{user.current_plan}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium text-gray-900 capitalize">{user.subscription_status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email Verified</p>
              <p className="font-medium text-gray-900">{user.emailVerified ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="font-medium text-gray-900">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
          <button className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            Send Email
          </button>
        </div>
      </div>
    </div>
  );
}
