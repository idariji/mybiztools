/**
 * Promos & Overrides Management
 * Manage promotional offerings, plan overrides, and special grants
 */

import React, { useState } from 'react';
import { Gift, Plus, Trash2, Calendar, Clock, Eye, EyeOff } from 'lucide-react';

interface Override {
  id: string;
  userId: string;
  userName: string;
  email: string;
  overrideType: 'free-promo' | 'discount' | 'plan-upgrade' | 'feature-unlock' | 'comp-account';
  plan?: string;
  duration: string;
  durationDays: number;
  reason: string;
  startDate: string;
  endDate: string;
  appliedBy: string;
  isActive: boolean;
}

interface PromoOverridesProps {
  overrides?: Override[];
  onAddOverride?: (override: Omit<Override, 'id' | 'isActive'>) => void;
  onRemoveOverride?: (overrideId: string) => void;
}

export function PromoOverridesManager({ overrides = [], onAddOverride, onRemoveOverride }: PromoOverridesProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    userName: '',
    email: '',
    overrideType: 'free-promo' as const,
    plan: 'Pro',
    durationDays: 30,
    reason: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const endDate = new Date(now.getTime() + formData.durationDays * 24 * 60 * 60 * 1000);

    onAddOverride?.({
      userId: formData.userId,
      userName: formData.userName,
      email: formData.email,
      overrideType: formData.overrideType,
      plan: formData.plan,
      duration: `${formData.durationDays} days`,
      durationDays: formData.durationDays,
      reason: formData.reason,
      startDate: now.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      appliedBy: 'admin@company.com', // In production, use actual admin email
    });

    setFormData({
      userId: '',
      userName: '',
      email: '',
      overrideType: 'free-promo',
      plan: 'Pro',
      durationDays: 30,
      reason: '',
    });
    setShowForm(false);
  };

  const activeOverrides = overrides.filter((o) => o.isActive);
  const expiredOverrides = overrides.filter((o) => !o.isActive);

  const getOverrideTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'free-promo': '🎁 Free Promo',
      'discount': '💰 Discount',
      'plan-upgrade': '📈 Plan Upgrade',
      'feature-unlock': '🔓 Feature Unlock',
      'comp-account': '🤝 Comp Account',
    };
    return labels[type] || type;
  };

  const getOverrideColor = (type: string) => {
    const colors: Record<string, string> = {
      'free-promo': 'bg-green-50 border-green-200',
      'discount': 'bg-blue-50 border-blue-200',
      'plan-upgrade': 'bg-purple-50 border-purple-200',
      'feature-unlock': 'bg-indigo-50 border-indigo-200',
      'comp-account': 'bg-pink-50 border-pink-200',
    };
    return colors[type] || 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Gift className="w-6 h-6 text-green-600" />
          Promotions & Overrides
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          New Override
        </button>
      </div>

      {/* Add Override Form */}
      {showForm && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Grant Promotional Override</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Name</label>
                <input
                  type="text"
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  placeholder="e.g., John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Override Type</label>
                <select
                  value={formData.overrideType}
                  onChange={(e) => setFormData({ ...formData, overrideType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                >
                  <option value="free-promo">Free Promo (Trial)</option>
                  <option value="discount">Discount Code</option>
                  <option value="plan-upgrade">Plan Upgrade</option>
                  <option value="feature-unlock">Feature Unlock</option>
                  <option value="comp-account">Comp Account</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan (if applicable)</label>
                <select
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                >
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={formData.durationDays}
                  onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="e.g., Loyalty discount, Early adopter, Partnership agreement"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                rows={3}
                required
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
              >
                Grant Override
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Overrides */}
      {activeOverrides.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Eye className="w-5 h-5 text-green-600" />
            Active Overrides ({activeOverrides.length})
          </h3>
          <div className="space-y-3">
            {activeOverrides.map((override) => (
              <div
                key={override.id}
                className={`border rounded-lg p-4 ${getOverrideColor(override.overrideType)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">{getOverrideTypeLabel(override.overrideType)}</h4>
                      {override.plan && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-white bg-opacity-50">
                          {override.plan} Plan
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{override.userName}</p>
                    <p className="text-xs text-gray-600">{override.email}</p>
                    <div className="mt-2 text-xs text-gray-600 space-y-1">
                      <p>
                        <strong>Reason:</strong> {override.reason}
                      </p>
                      <p className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {override.startDate} to {override.endDate}
                      </p>
                      <p className="text-gray-500">Applied by: {override.appliedBy}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveOverride?.(override.id)}
                    className="flex-shrink-0 p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition"
                    title="Remove override"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expired Overrides */}
      {expiredOverrides.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-gray-400" />
            Expired Overrides ({expiredOverrides.length})
          </h3>
          <div className="space-y-3">
            {expiredOverrides.map((override) => (
              <div
                key={override.id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50 opacity-60"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-600">{getOverrideTypeLabel(override.overrideType)}</h4>
                    <p className="text-sm text-gray-600 mt-1">{override.userName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Expired: {override.endDate}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveOverride?.(override.id)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded transition"
                    title="Remove expired override"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {activeOverrides.length === 0 && expiredOverrides.length === 0 && (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <Gift className="w-8 h-8 mx-auto mb-2 opacity-50 text-gray-400" />
          <p className="text-gray-600 text-sm">No promotional overrides have been created yet.</p>
          <p className="text-gray-500 text-xs mt-1">Create one to grant special access or discounts to users.</p>
        </div>
      )}
    </div>
  );
}
