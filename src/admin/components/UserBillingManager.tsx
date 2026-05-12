/**
 * User Billing Management Component
 * Manage individual user billing profiles
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  User,
  CreditCard,
  Calendar,
  AlertCircle,
  Edit2,
  Pause,
  Users
} from 'lucide-react';
import { PlanName } from '../types/admin';
import { UserProfileModal } from './UserProfileModal';
import { DatabaseService } from '../services/databaseService';

interface UserBillingManagerProps {
  onUserSelect?: (userId: string) => void;
  onPlanChange?: (userId: string, newPlan: PlanName) => void;
  onSuspend?: (userId: string, reason: string) => void;
}

export function UserBillingManager({ onUserSelect, onPlanChange, onSuspend }: UserBillingManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState<PlanName | 'all'>('all');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [selectedUserModal, setSelectedUserModal] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const result = await DatabaseService.getAllUsers(page, 50);
        setUsers(result.data?.users || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Failed to load users');
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [page]);

  const filteredUsers = users.filter((user) => {
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.businessName?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesPlan = filterPlan === 'all' || user.currentPlan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-[#FF8A2B] rounded-full animate-spin mx-auto mb-2" />
            <p className="text-slate-500 text-sm">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const getPlanBadge = (planName: string) => {
    switch (planName) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.10)] transition-all duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4 pl-3 border-l-4 border-[#FF8A2B]">
            User Billing Management
          </h2>
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] transition-all"
              />
            </div>
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value as PlanName | 'all')}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] transition-all"
            >
              <option value="all">All Plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>

        {/* Users List */}
        <div className="overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-medium text-sm">No users found</p>
              <p className="text-slate-400 text-xs mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">User</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Plan</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Total Spent</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Expires</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((user) => (
                  <React.Fragment key={user.id}>
                    <tr
                      className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-white transition-colors duration-150 cursor-pointer"
                      onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-[#FF8A2B] to-[#FF6B00] rounded-full flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0]}
                            </p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getPlanBadge(user.currentPlan)}`}>
                          {user.currentPlan ? user.currentPlan.charAt(0).toUpperCase() + user.currentPlan.slice(1) : 'Free'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.subscriptionStatus === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.subscriptionStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">—</td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {user.subscription?.currentPeriodEnd
                          ? new Date(user.subscription.currentPeriodEnd).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUserModal({
                                id: user.id,
                                name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0],
                                email: user.email,
                                plan: user.currentPlan === 'pro' ? 'Pro' : user.currentPlan === 'enterprise' ? 'Enterprise' : 'Free',
                                status: 'Active' as const,
                                billingCycle: 'Monthly',
                                subscriptionStart: user.subscription?.currentPeriodStart?.split('T')[0] || new Date().toISOString().split('T')[0],
                                subscriptionEnd: user.subscription?.currentPeriodEnd?.split('T')[0] || new Date().toISOString().split('T')[0],
                                lastPaymentDate: new Date().toISOString().split('T')[0],
                                paymentMethod: 'Paystack',
                                autoRenew: true,
                                totalSpent: 0,
                                signupDate: user.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
                              });
                            }}
                            className="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                            title="View profile"
                          >
                            <User className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onUserSelect?.(user.id); }}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
                            title="Edit user"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onSuspend?.(user.id, 'Admin action'); }}
                            className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                            title="Suspend user"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expandedUser === user.id && (
                      <tr>
                        <td colSpan={6} className="bg-gradient-to-r from-slate-50 to-white border-t border-slate-100 px-6 py-4">
                          <UserBillingDetails user={user} onPlanChange={onPlanChange} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedUserModal && (
        <UserProfileModal
          isOpen={!!selectedUserModal}
          onClose={() => setSelectedUserModal(null)}
          user={selectedUserModal}
          onUpgrade={(userId) => { onPlanChange?.(userId, 'pro'); setSelectedUserModal(null); }}
          onDowngrade={(userId) => { onPlanChange?.(userId, 'free'); setSelectedUserModal(null); }}
          onSuspend={(userId) => { onSuspend?.(userId, 'Admin suspension from modal'); setSelectedUserModal(null); }}
        />
      )}
    </motion.div>
  );
}

interface UserBillingDetailsProps {
  user: any;
  onPlanChange?: (userId: string, newPlan: PlanName) => void;
}

function UserBillingDetails({ user, onPlanChange }: UserBillingDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DetailCard label="Account Created" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'} icon={Calendar} />
        <DetailCard label="Current Plan" value={user.currentPlan ? user.currentPlan.charAt(0).toUpperCase() + user.currentPlan.slice(1) : 'Free'} icon={CreditCard} />
        <DetailCard label="Business" value={user.businessName || '—'} icon={CreditCard} />
        <DetailCard label="Status" value={user.subscriptionStatus || '—'} icon={AlertCircle} />
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <h4 className="font-semibold text-slate-900 text-sm mb-3">Change Plan</h4>
        <div className="flex gap-2">
          {(['free', 'pro', 'enterprise'] as const).map((plan) => (
            <button
              key={plan}
              onClick={() => onPlanChange?.(user.id, plan)}
              disabled={user.currentPlan === plan}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                user.currentPlan === plan
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] text-white shadow-lg shadow-orange-500/25 hover:-translate-y-0.5'
              }`}
            >
              {plan.charAt(0).toUpperCase() + plan.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface DetailCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

function DetailCard({ label, value, icon: Icon }: DetailCardProps) {
  return (
    <div className="bg-white p-3 rounded-xl border border-slate-200">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
        <p className="text-xs text-slate-500 font-medium">{label}</p>
      </div>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
