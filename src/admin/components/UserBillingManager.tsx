/**
 * User Billing Management Component
 * Manage individual user billing profiles
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  User,
  CreditCard,
  Calendar,
  AlertCircle,
  Edit2,
  Pause
} from 'lucide-react';
import { UserBillingProfile, PlanName } from '../types/admin';
import { UserProfileModal } from './UserProfileModal';
import { DatabaseService } from '../services/databaseService';

interface UserBillingManagerProps {
  onUserSelect?: (userId: string) => void;
  onPlanChange?: (userId: string, newPlan: PlanName) => void;
  onSuspend?: (userId: string, reason: string) => void;
}

export function UserBillingManager({
  onUserSelect,
  onPlanChange,
  onSuspend
}: UserBillingManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState<PlanName | 'all'>('all');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [selectedUserModal, setSelectedUserModal] = useState<any | null>(null);
  const [users, setUsers] = useState<UserBillingProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page] = useState(1);

  // Fetch real user data from database
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const result = await DatabaseService.getAllUsers(page, 50);
        setUsers(result.users || []);
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
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = filterPlan === 'all' || user.current_plan.name === filterPlan;
    return matchesSearch && matchesPlan;
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">User Billing Management</h2>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value as PlanName | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="p-6 text-center text-gray-600">
            <p>No users found</p>
          </div>
        ) : (
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                Total Spent
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                Expires
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <React.Fragment key={user.user_id}>
                <tr
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    setExpandedUser(expandedUser === user.user_id ? null : user.user_id)
                  }
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.current_plan.display_name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        user.account_status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.account_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ${user.total_spent}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.subscription.current_period_end.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUserModal({
                            id: user.user_id,
                            name: user.name,
                            email: user.email,
                            plan: user.current_plan.name === 'pro' ? 'Pro' : user.current_plan.name === 'enterprise' ? 'Enterprise' : 'Free',
                            status: 'Active' as const,
                            billingCycle: user.subscription.billing_cycle === 'monthly' ? 'Monthly' : 'Annual',
                            subscriptionStart: user.subscription.started_at.toISOString().split('T')[0],
                            subscriptionEnd: user.subscription.current_period_end.toISOString().split('T')[0],
                            lastPaymentDate: new Date().toISOString().split('T')[0],
                            paymentMethod: 'Paystack',
                            autoRenew: true,
                            totalSpent: user.total_spent,
                            signupDate: user.account_created_at.toISOString().split('T')[0],
                          });
                        }}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        title="View profile"
                      >
                        <User className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUserSelect?.(user.user_id);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit user"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSuspend?.(user.user_id, 'Admin action');
                        }}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Suspend user"
                      >
                        <Pause className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Expanded Details */}
                {expandedUser === user.user_id && (
                  <tr className="bg-gray-50">
                    <td colSpan={6} className="px-6 py-4">
                      <UserBillingDetails
                        user={user}
                        onPlanChange={onPlanChange}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {/* User Profile Modal */}
      {selectedUserModal && (
        <UserProfileModal
          isOpen={!!selectedUserModal}
          onClose={() => setSelectedUserModal(null)}
          user={selectedUserModal}
          onUpgrade={(userId) => {
            onPlanChange?.(userId, 'pro');
            setSelectedUserModal(null);
          }}
          onDowngrade={(userId) => {
            onPlanChange?.(userId, 'free');
            setSelectedUserModal(null);
          }}
          onSuspend={(userId) => {
            onSuspend?.(userId, 'Admin suspension from modal');
            setSelectedUserModal(null);
          }}
        />
      )}
    </div>
  );
}

interface UserBillingDetailsProps {
  user: UserBillingProfile;
  onPlanChange?: (userId: string, newPlan: PlanName) => void;
}

function UserBillingDetails({
  user,
  onPlanChange
}: UserBillingDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DetailCard
          label="Account Created"
          value={user.account_created_at.toLocaleDateString()}
          icon={Calendar}
        />
        <DetailCard
          label="Current Plan"
          value={user.current_plan.display_name}
          icon={CreditCard}
        />
        <DetailCard
          label="Total Spent"
          value={`$${user.total_spent}`}
          icon={CreditCard}
        />
        <DetailCard
          label="Status"
          value={user.account_status}
          icon={AlertCircle}
        />
      </div>

      {/* Plan Change */}
      <div className="bg-white p-4 rounded border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Change Plan</h4>
        <div className="flex gap-2">
          {(['free', 'pro', 'enterprise'] as const).map((plan) => (
            <button
              key={plan}
              onClick={() => onPlanChange?.(user.user_id, plan)}
              disabled={user.current_plan.name === plan}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                user.current_plan.name === plan
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
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
    <div className="bg-white p-3 rounded border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-gray-600" />
        <p className="text-xs text-gray-600">{label}</p>
      </div>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}
