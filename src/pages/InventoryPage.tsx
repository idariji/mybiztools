import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '../layout/DashboardLayout';
import {
  Package,
  PackagePlus,
  AlertTriangle,
  TrendingDown,
  Search,
  Filter,
  Plus,
  Minus,
  Edit,
  Trash2,
  X,
  ChevronRight,
  BarChart2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { authService } from '../services/authService';
import { API_BASE_URL } from '../config/apiConfig';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unitCost: number;
  sellingPrice: number;
  lowStockThreshold: number;
  supplier?: string;
  createdAt: string;
  updatedAt: string;
}

interface StockMovement {
  id: string;
  productId: string;
  type: 'in' | 'out';
  quantity: number;
  reason: 'Sale' | 'Restock' | 'Damage' | 'Return';
  date: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Electronics',
  'Food & Beverages',
  'Clothing',
  'Stationery',
  'Raw Materials',
  'Other',
];

const STATUS_OPTIONS = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];

// ─── API helpers ──────────────────────────────────────────────────────────────

function authHeaders(): HeadersInit {
  const token = authService.getToken();
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// SKU suggestion only (actual SKU generated server-side if blank)
function generateSKU(category: string): string {
  const prefix =
    category === 'Electronics'
      ? 'ELEC'
      : category === 'Food & Beverages'
      ? 'FNB'
      : category === 'Clothing'
      ? 'CLO'
      : category === 'Stationery'
      ? 'STN'
      : category === 'Raw Materials'
      ? 'RAW'
      : 'OTH';
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${num}`;
}

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

function getStatus(product: Product): 'In Stock' | 'Low Stock' | 'Out of Stock' {
  if (product.quantity === 0) return 'Out of Stock';
  if (product.quantity <= product.lowStockThreshold) return 'Low Stock';
  return 'In Stock';
}

function StatusBadge({ status }: { status: ReturnType<typeof getStatus> }) {
  const cfg = {
    'In Stock': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    'Low Stock': 'bg-amber-50 text-amber-700 border border-amber-200',
    'Out of Stock': 'bg-red-50 text-red-700 border border-red-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg[status]}`}>
      {status}
    </span>
  );
}

// ─── Empty & Modal helpers ────────────────────────────────────────────────────

const emptyForm = {
  name: '',
  sku: '',
  category: 'Electronics',
  quantity: '',
  unitCost: '',
  sellingPrice: '',
  lowStockThreshold: '5',
  supplier: '',
};

type FormState = typeof emptyForm;

// ─── Main Component ───────────────────────────────────────────────────────────

export function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  // UI state
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Add product modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<FormState>>({});

  // Stock adjustment modal
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [adjQty, setAdjQty] = useState('1');
  const [adjReason, setAdjReason] = useState<StockMovement['reason']>('Restock');
  const [adjType, setAdjType] = useState<'in' | 'out'>('in');

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ── Load from API ──────────────────────────────────────────────────────────

  const loadProducts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setApiError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/inventory`, { headers: authHeaders() });
      if (!res.ok) {
        const text = await res.text();
        const isStartingUp = res.status === 502 || res.status === 503 || text.includes('<html');
        setApiError(isStartingUp
          ? 'Server is starting up — retrying in 15 s…'
          : `Server error (${res.status}). Please try again.`);
        if (isStartingUp) setTimeout(() => loadProducts(true), 15000);
        return;
      }
      const data = await res.json();
      if (data.success) setProducts(data.data);
      else setApiError(data.message || 'Failed to load products');
    } catch {
      // Render free tier sleeps — a total network failure usually means the server is spinning up
      setApiError('Server is starting up — retrying in 15 s…');
      setTimeout(() => loadProducts(true), 15000);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // ── Derived stats ───────────────────────────────────────────────────────────

  const totalProducts = products.length;
  const lowStockItems = products.filter(
    (p) => p.quantity > 0 && p.quantity <= p.lowStockThreshold
  );
  const outOfStockItems = products.filter((p) => p.quantity === 0);
  const totalValue = products.reduce((sum, p) => sum + p.quantity * p.unitCost, 0);
  const alertProducts = products.filter((p) => p.quantity <= p.lowStockThreshold);

  // ── Filtered list ───────────────────────────────────────────────────────────

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    const matchCat = filterCategory === 'All' || p.category === filterCategory;
    const matchStatus = filterStatus === 'All' || getStatus(p) === filterStatus;
    return matchSearch && matchCat && matchStatus;
  });

  // ── Add product ─────────────────────────────────────────────────────────────

  function validateForm(): boolean {
    const errs: Partial<FormState> = {};
    if (!form.name.trim()) errs.name = 'Product name is required';
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) < 0)
      errs.quantity = 'Enter a valid quantity';
    if (!form.unitCost || isNaN(Number(form.unitCost)) || Number(form.unitCost) < 0)
      errs.unitCost = 'Enter a valid unit cost';
    if (!form.sellingPrice || isNaN(Number(form.sellingPrice)) || Number(form.sellingPrice) < 0)
      errs.sellingPrice = 'Enter a valid selling price';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleAddProduct() {
    if (!validateForm()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/inventory`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          name: form.name.trim(),
          sku: form.sku.trim() || generateSKU(form.category),
          category: form.category,
          quantity: Number(form.quantity),
          unitCost: Number(form.unitCost),
          sellingPrice: Number(form.sellingPrice),
          lowStockThreshold: Number(form.lowStockThreshold) || 5,
          supplier: form.supplier.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => [data.data, ...prev]);
        setShowAddModal(false);
        setForm(emptyForm);
        setFormErrors({});
      } else {
        setFormErrors({ name: data.message || 'Failed to add product' });
      }
    } catch {
      setFormErrors({ name: 'Could not reach server' });
    } finally {
    }
  }

  // ── Stock adjustment ────────────────────────────────────────────────────────

  async function handleAdjust() {
    if (!adjustProduct) return;
    const delta = Number(adjQty);
    if (!delta || isNaN(delta) || delta <= 0) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/inventory/${adjustProduct.id}/adjust`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ type: adjType, quantity: delta, reason: adjReason }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === adjustProduct.id ? { ...p, quantity: data.data.newQuantity } : p
          )
        );
        setAdjustProduct(null);
        setAdjQty('1');
        setAdjReason('Restock');
        setAdjType('in');
      }
    } catch {
      // silently fail — UI stays open
    } finally {
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/inventory/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      // silently fail
    } finally {
      setDeleteId(null);
    }
  }

  // ── Open add modal ──────────────────────────────────────────────────────────

  function openAddModal() {
    setForm(emptyForm);
    setFormErrors({});
    setShowAddModal(true);
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="space-y-4 sm:space-y-6"
      >
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-slate-900">Inventory</h1>
            <div className="h-1 w-16 bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] rounded-full mt-2 mb-1" />
            <p className="text-sm text-slate-500">Manage your products and stock levels</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF8A2B] hover:bg-[#FF6B00] text-white rounded-xl font-semibold transition-colors shadow-[0_4px_14px_rgba(255,138,43,0.35)] self-start sm:self-auto"
          >
            <PackagePlus className="w-4 h-4" />
            Add Product
          </button>
        </div>

        {/* ── API Error Banner ── */}
        {apiError && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{apiError}</p>
            <button onClick={() => loadProducts()} className="ml-auto text-xs font-semibold text-red-600 hover:underline">Retry</button>
          </div>
        )}

        {/* ── Loading Skeleton ── */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#FF8A2B]/30 border-t-[#FF8A2B] rounded-full animate-spin" />
          </div>
        )}

        {/* ── Main content (hidden while loading) ── */}
        {!loading && <>

        {/* ── Low Stock Alert Banner ── */}
        <AnimatePresence>
          {alertProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
            >
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-800">
                  Stock Alert — {alertProducts.length} product{alertProducts.length > 1 ? 's' : ''} need attention
                </p>
                <p className="text-xs text-amber-700 mt-0.5 truncate">
                  {alertProducts.map((p) => p.name).join(', ')}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Stats Bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Products */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.35 }}
            className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-200 border border-slate-100"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gradient-to-br from-[#FF8A2B] to-[#FF6B00] rounded-xl shadow-md shadow-orange-500/25">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <BarChart2 className="w-4 h-4 text-slate-300" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">{totalProducts}</p>
            <p className="text-xs text-slate-500 mt-0.5">Total Products</p>
          </motion.div>

          {/* Low Stock */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-200 border border-slate-100"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-md shadow-amber-500/25">
                <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              {lowStockItems.length > 0 && (
                <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  {lowStockItems.length}
                </span>
              )}
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-amber-600">{lowStockItems.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Low Stock</p>
          </motion.div>

          {/* Total Value */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35 }}
            className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-200 border border-slate-100"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl shadow-md shadow-green-500/25">
                <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-slate-900 truncate">{formatNaira(totalValue)}</p>
            <p className="text-xs text-slate-500 mt-0.5">Total Value (Cost)</p>
          </motion.div>

          {/* Out of Stock */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.35 }}
            className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-200 border border-slate-100"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gradient-to-br from-red-400 to-rose-600 rounded-xl shadow-md shadow-red-500/25">
                <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              {outOfStockItems.length > 0 && (
                <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  {outOfStockItems.length}
                </span>
              )}
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-red-600">{outOfStockItems.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Out of Stock</p>
          </motion.div>
        </div>

        {/* ── Search & Filters ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35 }}
          className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-100 space-y-3"
        >
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or SKU…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] transition-colors"
              />
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                showFilters
                  ? 'bg-[#FF8A2B]/10 border-[#FF8A2B]/30 text-[#FF6B00]'
                  : 'border-slate-200 text-slate-600 hover:border-[#FF8A2B]/40 hover:text-[#FF6B00]'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Category</label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] transition-colors bg-white"
                    >
                      <option value="All">All Categories</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] transition-colors bg-white"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => { setFilterCategory('All'); setFilterStatus('All'); setSearch(''); }}
                      className="px-4 py-2 text-sm text-slate-500 hover:text-[#FF6B00] font-medium transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Product Table / List ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.35 }}
          className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden"
        >
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wide">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wide">SKU</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wide">Category</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wide">Qty</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wide">Unit Cost</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wide">Sell Price</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wide">Status</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-16 text-slate-400">
                        <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No products found</p>
                        <p className="text-xs mt-1">Try adjusting your search or filters</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((product, i) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ delay: i * 0.04, duration: 0.25 }}
                        className="border-b border-slate-50 hover:bg-orange-50/30 transition-colors group"
                      >
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800">{product.name}</p>
                          {product.supplier && (
                            <p className="text-xs text-slate-400 mt-0.5">{product.supplier}</p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{product.sku}</td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg font-medium">
                            {product.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900">{product.quantity.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-right text-slate-600">{formatNaira(product.unitCost)}</td>
                        <td className="py-3.5 px-4 text-right font-semibold text-[#FF6B00]">{formatNaira(product.sellingPrice)}</td>
                        <td className="py-3.5 px-4 text-center">
                          <StatusBadge status={getStatus(product)} />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => { setAdjustProduct(product); setAdjQty('1'); setAdjType('in'); setAdjReason('Restock'); }}
                              className="p-1.5 rounded-lg hover:bg-[#FF8A2B]/10 text-slate-400 hover:text-[#FF6B00] transition-colors"
                              title="Adjust stock"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteId(product.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="sm:hidden divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium text-sm">No products found</p>
                <p className="text-xs mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              <AnimatePresence>
                {filtered.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                    className="p-4 hover:bg-orange-50/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{product.name}</p>
                        <p className="text-xs font-mono text-slate-400 mt-0.5">{product.sku}</p>
                      </div>
                      <StatusBadge status={getStatus(product)} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                      <div>
                        <p className="text-slate-400">Category</p>
                        <p className="font-medium text-slate-700 mt-0.5">{product.category}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Quantity</p>
                        <p className="font-bold text-slate-900 mt-0.5">{product.quantity}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Sell Price</p>
                        <p className="font-semibold text-[#FF6B00] mt-0.5">{formatNaira(product.sellingPrice)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setAdjustProduct(product); setAdjQty('1'); setAdjType('in'); setAdjReason('Restock'); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold border border-[#FF8A2B]/30 text-[#FF6B00] rounded-xl hover:bg-[#FF8A2B]/10 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Adjust Stock
                      </button>
                      <button
                        onClick={() => setDeleteId(product.id)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Footer summary */}
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700">{totalProducts}</span> products
              </p>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          )}
        </motion.div>

        </>} {/* end !loading */}
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════════
          ADD PRODUCT MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) { setShowAddModal(false); } }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] max-h-[92vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-gradient-to-br from-[#FF8A2B] to-[#FF6B00] rounded-xl">
                    <PackagePlus className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900">Add New Product</h2>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Samsung Galaxy A14"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] transition-colors ${formErrors.name ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                  />
                  {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>}
                </div>

                {/* SKU + Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      SKU <span className="text-xs font-normal text-slate-400">(auto if empty)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ELEC-0001"
                      value={form.sku}
                      onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] transition-colors font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] transition-colors bg-white"
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Quantity + Low Stock Threshold */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={form.quantity}
                      onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                      className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] transition-colors ${formErrors.quantity ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                    />
                    {formErrors.quantity && <p className="mt-1 text-xs text-red-500">{formErrors.quantity}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Low Stock Alert</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="5"
                      value={form.lowStockThreshold}
                      onChange={(e) => setForm((f) => ({ ...f, lowStockThreshold: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] transition-colors"
                    />
                  </div>
                </div>

                {/* Unit Cost + Selling Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Unit Cost (₦) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">₦</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0.00"
                        value={form.unitCost}
                        onChange={(e) => setForm((f) => ({ ...f, unitCost: e.target.value }))}
                        className={`w-full pl-7 pr-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] transition-colors ${formErrors.unitCost ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                      />
                    </div>
                    {formErrors.unitCost && <p className="mt-1 text-xs text-red-500">{formErrors.unitCost}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Selling Price (₦) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">₦</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0.00"
                        value={form.sellingPrice}
                        onChange={(e) => setForm((f) => ({ ...f, sellingPrice: e.target.value }))}
                        className={`w-full pl-7 pr-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] transition-colors ${formErrors.sellingPrice ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                      />
                    </div>
                    {formErrors.sellingPrice && <p className="mt-1 text-xs text-red-500">{formErrors.sellingPrice}</p>}
                  </div>
                </div>

                {/* Supplier */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Supplier <span className="text-xs font-normal text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TechHub Distributors"
                    value={form.supplier}
                    onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] transition-colors"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-slate-100 px-5 py-4 flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProduct}
                  className="flex-1 py-2.5 text-sm font-semibold bg-[#FF8A2B] hover:bg-[#FF6B00] text-white rounded-xl transition-colors shadow-[0_4px_14px_rgba(255,138,43,0.35)]"
                >
                  Add Product
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════════
          STOCK ADJUSTMENT MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {adjustProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setAdjustProduct(null); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-gradient-to-br from-[#FF8A2B] to-[#FF6B00] rounded-xl">
                    <BarChart2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Adjust Stock</h2>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">{adjustProduct.sku}</p>
                  </div>
                </div>
                <button
                  onClick={() => setAdjustProduct(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Product name + current stock */}
                <div className="bg-slate-50 rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{adjustProduct.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{adjustProduct.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">{adjustProduct.quantity}</p>
                    <p className="text-xs text-slate-400">Current Stock</p>
                  </div>
                </div>

                {/* In / Out toggle */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Adjustment Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setAdjType('in'); setAdjReason('Restock'); }}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                        adjType === 'in'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'border-slate-200 text-slate-500 hover:border-emerald-200'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      Stock In
                    </button>
                    <button
                      onClick={() => { setAdjType('out'); setAdjReason('Sale'); }}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                        adjType === 'out'
                          ? 'bg-red-50 border-red-300 text-red-700'
                          : 'border-slate-200 text-slate-500 hover:border-red-200'
                      }`}
                    >
                      <Minus className="w-4 h-4" />
                      Stock Out
                    </button>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setAdjQty((v) => String(Math.max(1, Number(v) - 1)))}
                      className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 hover:border-[#FF8A2B]/40 text-slate-500 hover:text-[#FF6B00] transition-colors flex-shrink-0"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={adjQty}
                      onChange={(e) => setAdjQty(e.target.value)}
                      className="flex-1 text-center text-lg font-bold border border-slate-200 rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] transition-colors"
                    />
                    <button
                      onClick={() => setAdjQty((v) => String(Number(v) + 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 hover:border-[#FF8A2B]/40 text-slate-500 hover:text-[#FF6B00] transition-colors flex-shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Reason</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(adjType === 'in'
                      ? (['Restock', 'Return'] as const)
                      : (['Sale', 'Damage'] as const)
                    ).map((r) => (
                      <button
                        key={r}
                        onClick={() => setAdjReason(r)}
                        className={`py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                          adjReason === r
                            ? 'bg-[#FF8A2B]/10 border-[#FF8A2B]/40 text-[#FF6B00]'
                            : 'border-slate-200 text-slate-500 hover:border-[#FF8A2B]/30'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                {adjQty && Number(adjQty) > 0 && (
                  <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between text-sm">
                    <span className="text-slate-500">New stock will be:</span>
                    <span className={`font-bold text-base ${
                      adjType === 'in'
                        ? 'text-emerald-600'
                        : Math.max(0, adjustProduct.quantity - Number(adjQty)) === 0
                        ? 'text-red-600'
                        : Math.max(0, adjustProduct.quantity - Number(adjQty)) <= adjustProduct.lowStockThreshold
                        ? 'text-amber-600'
                        : 'text-slate-900'
                    }`}>
                      {adjType === 'in'
                        ? adjustProduct.quantity + Number(adjQty)
                        : Math.max(0, adjustProduct.quantity - Number(adjQty))}
                    </span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 pb-5 flex gap-3">
                <button
                  onClick={() => setAdjustProduct(null)}
                  className="flex-1 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdjust}
                  className={`flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors shadow-md ${
                    adjType === 'in'
                      ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25'
                      : 'bg-[#FF8A2B] hover:bg-[#FF6B00] shadow-orange-500/25'
                  }`}
                >
                  Confirm Adjustment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════════
          DELETE CONFIRMATION MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setDeleteId(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 340, damping: 30 }}
              className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] p-6 w-full max-w-sm text-center"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Delete Product?</h3>
              <p className="text-sm text-slate-500 mb-5">
                This action cannot be undone. The product and its data will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
