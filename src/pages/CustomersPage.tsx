import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Tag,
  Search,
  Filter,
  MessageCircle,
  Star,
  Trash2,
  Edit,
  ChevronRight,
  X,
  Download,
  Upload,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  phone: string;
  email?: string;
  address?: string;
  tag: 'VIP' | 'Wholesale' | 'Retail' | 'Inactive';
  notes?: string;
  birthday?: string;
  createdAt: string;
  lastContactAt?: string;
  totalSpend: number;
}

type TagType = Customer['tag'];
type FilterTag = TagType | 'All';

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'crm-customers';

const TAG_STYLES: Record<TagType, string> = {
  VIP: 'bg-yellow-100 text-yellow-800',
  Wholesale: 'bg-blue-100 text-blue-800',
  Retail: 'bg-green-100 text-green-800',
  Inactive: 'bg-slate-100 text-slate-600',
};

const SAMPLE_CUSTOMERS: Customer[] = [
  {
    id: 'sample-1',
    firstName: 'Amara',
    lastName: 'Okafor',
    businessName: 'Amara Fabrics Ltd',
    phone: '08012345678',
    email: 'amara@amarafabrics.ng',
    address: '14 Allen Avenue, Ikeja, Lagos',
    tag: 'VIP',
    notes: 'Bulk orders every quarter. Prefers Ankara fabrics.',
    birthday: '1985-03-22',
    createdAt: '2024-01-15T08:00:00.000Z',
    lastContactAt: '2024-11-20T10:30:00.000Z',
    totalSpend: 485000,
  },
  {
    id: 'sample-2',
    firstName: 'Chukwuemeka',
    lastName: 'Nwosu',
    businessName: '',
    phone: '07098765432',
    email: 'emeka.nwosu@gmail.com',
    address: '5 Wuse Zone 4, Abuja',
    tag: 'Wholesale',
    notes: 'Reseller from Abuja. Usually orders 50+ units.',
    birthday: '',
    createdAt: '2024-03-08T09:15:00.000Z',
    lastContactAt: '2024-12-01T14:00:00.000Z',
    totalSpend: 210000,
  },
  {
    id: 'sample-3',
    firstName: 'Ngozi',
    lastName: 'Eze',
    businessName: '',
    phone: '09011223344',
    email: '',
    address: 'Trans-Ekulu, Enugu',
    tag: 'Retail',
    notes: 'Walk-in customer. Buys during festive seasons.',
    birthday: '1992-12-05',
    createdAt: '2024-06-20T11:00:00.000Z',
    lastContactAt: '2024-10-15T16:45:00.000Z',
    totalSpend: 37500,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return `cust-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) return '234' + digits.slice(1);
  if (digits.startsWith('234')) return digits;
  return '234' + digits;
}

function buildWhatsAppUrl(phone: string, name: string): string {
  const normalized = normalizePhone(phone);
  return `https://wa.me/${normalized}?text=Hello%20${encodeURIComponent(name)}`;
}

function isActiveThisMonth(customer: Customer): boolean {
  if (!customer.lastContactAt) return false;
  const now = new Date();
  const last = new Date(customer.lastContactAt);
  return last.getFullYear() === now.getFullYear() && last.getMonth() === now.getMonth();
}

function loadCustomers(): Customer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return SAMPLE_CUSTOMERS;
}

function saveCustomers(customers: Customer[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  } catch {}
}

// ─── Empty form state ─────────────────────────────────────────────────────────

const EMPTY_FORM: Omit<Customer, 'id' | 'createdAt' | 'totalSpend'> = {
  firstName: '',
  lastName: '',
  businessName: '',
  phone: '',
  email: '',
  address: '',
  tag: 'Retail',
  notes: '',
  birthday: '',
  lastContactAt: '',
};

// ─── Toast (self-contained) ───────────────────────────────────────────────────

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastItem['type'] = 'success') => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

const TOAST_COLORS: Record<ToastItem['type'], string> = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-[#FF8A2B]',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function TagBadge({ tag }: { tag: TagType }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${TAG_STYLES[tag]}`}>
      {tag === 'VIP' && <Star className="w-3 h-3" />}
      {tag}
    </span>
  );
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

interface CustomerModalProps {
  initial?: Customer | null;
  onSave: (data: Omit<Customer, 'id' | 'createdAt' | 'totalSpend'>) => void;
  onClose: () => void;
}

function CustomerModal({ initial, onSave, onClose }: CustomerModalProps) {
  const [form, setForm] = useState<typeof EMPTY_FORM>(
    initial
      ? {
          firstName: initial.firstName,
          lastName: initial.lastName,
          businessName: initial.businessName ?? '',
          phone: initial.phone,
          email: initial.email ?? '',
          address: initial.address ?? '',
          tag: initial.tag,
          notes: initial.notes ?? '',
          birthday: initial.birthday ?? '',
          lastContactAt: initial.lastContactAt ?? '',
        }
      : EMPTY_FORM
  );

  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY_FORM, string>>>({});

  function handleChange(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  }

  const inputClass =
    'w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] transition-colors';

  const labelClass = 'block text-xs font-semibold text-slate-600 mb-1';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <motion.div
          className="relative z-10 bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FF8A2B]/10 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-[#FF8A2B]" />
              </div>
              <h2 className="font-bold text-slate-800">{initial ? 'Edit Customer' : 'Add Customer'}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>First Name *</label>
                <input
                  className={`${inputClass} ${errors.firstName ? 'border-red-400' : ''}`}
                  placeholder="Amara"
                  value={form.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                />
                {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className={labelClass}>Last Name *</label>
                <input
                  className={`${inputClass} ${errors.lastName ? 'border-red-400' : ''}`}
                  placeholder="Okafor"
                  value={form.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                />
                {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className={labelClass}>Business Name</label>
              <input
                className={inputClass}
                placeholder="Amara Fabrics Ltd (optional)"
                value={form.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass}>Phone Number *</label>
              <input
                className={`${inputClass} ${errors.phone ? 'border-red-400' : ''}`}
                placeholder="08012345678"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                type="tel"
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input
                className={inputClass}
                placeholder="amara@example.com"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                type="email"
              />
            </div>

            <div>
              <label className={labelClass}>Address</label>
              <input
                className={inputClass}
                placeholder="14 Allen Avenue, Lagos"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Tag</label>
                <select
                  className={inputClass}
                  value={form.tag}
                  onChange={(e) => handleChange('tag', e.target.value as TagType)}
                >
                  <option value="Retail">Retail</option>
                  <option value="Wholesale">Wholesale</option>
                  <option value="VIP">VIP</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Birthday</label>
                <input
                  className={inputClass}
                  type="date"
                  value={form.birthday}
                  onChange={(e) => handleChange('birthday', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Notes</label>
              <textarea
                className={`${inputClass} resize-none`}
                rows={3}
                placeholder="Any notes about this customer..."
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#FF8A2B] text-white text-sm font-semibold hover:bg-[#FF6B00] transition-colors shadow-[0_2px_8px_rgba(255,138,43,0.3)]"
              >
                {initial ? 'Save Changes' : 'Add Customer'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Customer Detail Drawer ───────────────────────────────────────────────────

interface DetailDrawerProps {
  customer: Customer;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}

function DetailDrawer({ customer, onClose, onEdit, onDelete, onUpdateNotes }: DetailDrawerProps) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(customer.notes ?? '');
  const fullName = `${customer.firstName} ${customer.lastName}`;

  function handleSaveNotes() {
    onUpdateNotes(customer.id, notes);
    setEditingNotes(false);
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-stretch justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

        {/* Drawer */}
        <motion.div
          className="relative z-10 bg-white w-full sm:w-[420px] h-full overflow-y-auto shadow-2xl"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800">Customer Profile</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Avatar + Name */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF8A2B] to-[#FF6B00] flex items-center justify-center text-white text-2xl font-bold shadow-[0_2px_8px_rgba(255,138,43,0.35)]">
                {customer.firstName[0]}{customer.lastName[0]}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{fullName}</h3>
                {customer.businessName && (
                  <p className="text-sm text-slate-500">{customer.businessName}</p>
                )}
                <div className="mt-1">
                  <TagBadge tag={customer.tag} />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-xs text-slate-500">Total Spend</p>
                <p className="text-base font-bold text-[#FF8A2B] mt-0.5">{formatNaira(customer.totalSpend)}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-xs text-slate-500">Customer Since</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">{formatDate(customer.createdAt)}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-xs text-slate-500">Last Contact</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">
                  {customer.lastContactAt ? formatDate(customer.lastContactAt) : '—'}
                </p>
              </div>
              {customer.birthday && (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs text-slate-500">Birthday</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">
                    {new Date(customer.birthday + 'T00:00:00').toLocaleDateString('en-NG', {
                      day: 'numeric',
                      month: 'long',
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Contact Details */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</h4>
              <a
                href={`tel:${customer.phone}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-orange-50 hover:border-[#FF8A2B]/20 transition-colors group"
              >
                <Phone className="w-4 h-4 text-[#FF8A2B]" />
                <span className="text-sm font-medium text-slate-700">{customer.phone}</span>
              </a>
              {customer.email && (
                <a
                  href={`mailto:${customer.email}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-orange-50 hover:border-[#FF8A2B]/20 transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#FF8A2B]" />
                  <span className="text-sm font-medium text-slate-700 break-all">{customer.email}</span>
                </a>
              )}
              {customer.address && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <MapPin className="w-4 h-4 text-[#FF8A2B] mt-0.5" />
                  <span className="text-sm font-medium text-slate-700">{customer.address}</span>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes</h4>
                <button
                  onClick={() => setEditingNotes(!editingNotes)}
                  className="text-xs text-[#FF8A2B] font-semibold hover:underline"
                >
                  {editingNotes ? 'Cancel' : 'Edit'}
                </button>
              </div>
              {editingNotes ? (
                <div className="space-y-2">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] resize-none transition-colors"
                    placeholder="Notes about this customer..."
                  />
                  <button
                    onClick={handleSaveNotes}
                    className="w-full py-2 rounded-xl bg-[#FF8A2B] text-white text-sm font-semibold hover:bg-[#FF6B00] transition-colors"
                  >
                    Save Notes
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 min-h-[56px]">
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">
                    {customer.notes || <span className="text-slate-400 italic">No notes yet</span>}
                  </p>
                </div>
              )}
            </div>

            {/* Follow-up Reminder */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Follow-up Reminder</h4>
              <div className="p-3 rounded-xl bg-orange-50 border border-[#FF8A2B]/20 flex items-start gap-3">
                <Tag className="w-4 h-4 text-[#FF8A2B] mt-0.5" />
                <p className="text-xs text-slate-600">
                  {customer.lastContactAt
                    ? `Last contacted ${formatDate(customer.lastContactAt)}. Consider reaching out via WhatsApp.`
                    : 'No contact recorded yet. Send a WhatsApp message to get started.'}
                </p>
              </div>
              <a
                href={buildWhatsAppUrl(customer.phone, fullName)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Message on WhatsApp
              </a>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => onEdit(customer)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete ${fullName}? This cannot be undone.`)) {
                    onDelete(customer.id);
                    onClose();
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Customer Row Card ────────────────────────────────────────────────────────

interface CustomerRowProps {
  customer: Customer;
  onClick: () => void;
  onDelete: (id: string) => void;
  index: number;
}

function CustomerRow({ customer, onClick, onDelete, index }: CustomerRowProps) {
  const fullName = `${customer.firstName} ${customer.lastName}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, delay: index * 0.04 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-4 flex items-center gap-3 cursor-pointer hover:shadow-[0_4px_16px_rgba(255,138,43,0.12)] hover:border-[#FF8A2B]/20 transition-all group"
      onClick={onClick}
    >
      {/* Avatar */}
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF8A2B]/80 to-[#FF6B00] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
        {customer.firstName[0]}{customer.lastName[0]}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-slate-800 text-sm truncate">{fullName}</p>
          <TagBadge tag={customer.tag} />
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Phone className="w-3 h-3" />
            {customer.phone}
          </span>
          {customer.businessName && (
            <span className="text-xs text-slate-400 truncate">{customer.businessName}</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="text-xs text-slate-400">Since {formatDate(customer.createdAt)}</span>
          <span className="text-xs font-semibold text-[#FF8A2B]">{formatNaira(customer.totalSpend)}</span>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <a
          href={buildWhatsAppUrl(customer.phone, fullName)}
          target="_blank"
          rel="noopener noreferrer"
          title="WhatsApp"
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
        </a>
        <button
          title="Delete"
          onClick={() => {
            if (window.confirm(`Delete ${fullName}?`)) onDelete(customer.id);
          }}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#FF8A2B] transition-colors" />
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(() => loadCustomers());
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState<FilterTag>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const { toasts, addToast, removeToast } = useToast();

  // Persist to localStorage whenever customers change
  useEffect(() => {
    saveCustomers(customers);
  }, [customers]);

  // Computed stats
  const totalCustomers = customers.length;
  const vipCount = customers.filter((c) => c.tag === 'VIP').length;
  const activeThisMonth = customers.filter(isActiveThisMonth).length;
  const totalValue = customers.reduce((sum, c) => sum + c.totalSpend, 0);

  // Filtered list
  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.businessName ?? '').toLowerCase().includes(q) ||
      (c.email ?? '').toLowerCase().includes(q);
    const matchTag = filterTag === 'All' || c.tag === filterTag;
    return matchSearch && matchTag;
  });

  // CRUD
  const handleAddCustomer = useCallback(
    (data: Omit<Customer, 'id' | 'createdAt' | 'totalSpend'>) => {
      const newCustomer: Customer = {
        ...data,
        id: generateId(),
        createdAt: new Date().toISOString(),
        totalSpend: 0,
      };
      setCustomers((prev) => [newCustomer, ...prev]);
      setShowAddModal(false);
      addToast(`${data.firstName} ${data.lastName} added!`, 'success');
    },
    [addToast]
  );

  const handleEditCustomer = useCallback(
    (data: Omit<Customer, 'id' | 'createdAt' | 'totalSpend'>) => {
      if (!editingCustomer) return;
      setCustomers((prev) =>
        prev.map((c) => (c.id === editingCustomer.id ? { ...c, ...data } : c))
      );
      // Update selected customer if open
      setSelectedCustomer((prev) =>
        prev?.id === editingCustomer.id ? { ...prev, ...data } : prev
      );
      setEditingCustomer(null);
      addToast('Customer updated!', 'success');
    },
    [editingCustomer, addToast]
  );

  const handleDeleteCustomer = useCallback(
    (id: string) => {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      addToast('Customer removed.', 'info');
    },
    [addToast]
  );

  const handleUpdateNotes = useCallback(
    (id: string, notes: string) => {
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, notes } : c)));
      setSelectedCustomer((prev) => (prev?.id === id ? { ...prev, notes } : prev));
      addToast('Notes saved.', 'success');
    },
    [addToast]
  );

  const handleOpenEdit = useCallback((customer: Customer) => {
    setEditingCustomer(customer);
    setSelectedCustomer(null);
  }, []);

  const handleImportCSV = () => {
    addToast('CSV import coming soon!', 'info');
  };

  const FILTER_TAGS: FilterTag[] = ['All', 'VIP', 'Wholesale', 'Retail', 'Inactive'];

  return (
    <div className="min-h-screen bg-[#F0F3F5]">
      {/* ── Header ── */}
      <div className="px-4 sm:px-6 py-5 sm:py-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Customers</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your customer relationships</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleImportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Import CSV</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF8A2B] text-white text-sm font-semibold hover:bg-[#FF6B00] shadow-[0_2px_8px_rgba(255,138,43,0.3)] transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Add Customer
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div className="px-4 sm:px-6 mb-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Total Customers',
              value: totalCustomers,
              icon: Users,
              color: 'text-[#FF8A2B]',
              bg: 'bg-[#FF8A2B]/10',
            },
            {
              label: 'VIP Customers',
              value: vipCount,
              icon: Star,
              color: 'text-yellow-600',
              bg: 'bg-yellow-100',
            },
            {
              label: 'Active This Month',
              value: activeThisMonth,
              icon: MessageCircle,
              color: 'text-green-600',
              bg: 'bg-green-100',
            },
            {
              label: 'Total Value',
              value: formatNaira(totalValue),
              icon: Tag,
              color: 'text-blue-600',
              bg: 'bg-blue-100',
              wide: true,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-4 flex items-center gap-3"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 truncate">{stat.label}</p>
                <p className={`text-lg font-bold ${stat.color} truncate`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="px-4 sm:px-6 mb-4 flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, phone, business..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-colors"
          />
        </div>

        {/* Tag filter pills – desktop */}
        <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
          {FILTER_TAGS.map((t) => (
            <button
              key={t}
              onClick={() => setFilterTag(t)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                filterTag === t
                  ? 'bg-[#FF8A2B] text-white border-[#FF8A2B] shadow-[0_2px_8px_rgba(255,138,43,0.25)]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#FF8A2B]/40'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tag filter dropdown – mobile */}
        <div className="sm:hidden relative">
          <button
            onClick={() => setShowFilterMenu((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
          >
            <Filter className="w-4 h-4" />
            {filterTag}
          </button>
          <AnimatePresence>
            {showFilterMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute right-0 top-full mt-1 z-30 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden"
              >
                {FILTER_TAGS.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setFilterTag(t);
                      setShowFilterMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                      filterTag === t
                        ? 'bg-[#FF8A2B]/10 text-[#FF8A2B]'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Customer List ── */}
      <div className="px-4 sm:px-6 pb-8 space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-semibold">No customers found</p>
              <p className="text-slate-400 text-sm mt-1">
                {search || filterTag !== 'All'
                  ? 'Try adjusting your search or filter.'
                  : 'Add your first customer to get started.'}
              </p>
              {!search && filterTag === 'All' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF8A2B] text-white text-sm font-semibold hover:bg-[#FF6B00] transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Customer
                </button>
              )}
            </motion.div>
          ) : (
            filtered.map((customer, idx) => (
              <CustomerRow
                key={customer.id}
                customer={customer}
                index={idx}
                onClick={() => setSelectedCustomer(customer)}
                onDelete={handleDeleteCustomer}
              />
            ))
          )}
        </AnimatePresence>

        {filtered.length > 0 && (
          <p className="text-center text-xs text-slate-400 pt-2">
            Showing {filtered.length} of {totalCustomers} customer{totalCustomers !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* ── Add Modal ── */}
      <AnimatePresence>
        {showAddModal && (
          <CustomerModal
            key="add-modal"
            onSave={handleAddCustomer}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {editingCustomer && (
          <CustomerModal
            key="edit-modal"
            initial={editingCustomer}
            onSave={handleEditCustomer}
            onClose={() => setEditingCustomer(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Detail Drawer ── */}
      <AnimatePresence>
        {selectedCustomer && (
          <DetailDrawer
            key={`drawer-${selectedCustomer.id}`}
            customer={selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
            onEdit={(c) => {
              setSelectedCustomer(null);
              handleOpenEdit(c);
            }}
            onDelete={(id) => {
              handleDeleteCustomer(id);
              setSelectedCustomer(null);
            }}
            onUpdateNotes={handleUpdateNotes}
          />
        )}
      </AnimatePresence>

      {/* ── Toast Container ── */}
      <div className="fixed top-5 right-5 z-[200] space-y-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className={`${TOAST_COLORS[t.type]} text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 min-w-[240px] max-w-xs`}
            >
              <p className="flex-1 text-sm font-semibold">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="p-0.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
