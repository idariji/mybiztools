import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Store, Globe, ShoppingBag, Share2, Copy, Check,
  Edit, Save, Package, ExternalLink, Wifi, WifiOff,
} from 'lucide-react';
import { DashboardLayout } from '../layout/DashboardLayout';
import { authService } from '../services/authService';
import { API_BASE_URL } from '../config/apiConfig';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StoreSettings {
  storeName: string;
  tagline: string;
  whatsapp: string;
  description: string;
  category: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  sellingPrice: number;
  quantity: number;
  description?: string;
}

const SETTINGS_KEY = 'mybiztools_store_settings';

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: '',
  tagline: '',
  whatsapp: '',
  description: '',
  category: 'General',
};

const CATEGORIES = [
  'General', 'Food & Beverages', 'Fashion & Clothing', 'Electronics',
  'Beauty & Health', 'Home & Office', 'Agriculture', 'Services', 'Other',
];

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', minimumFractionDigits: 0,
  }).format(amount);
}

function authHeaders(): HeadersInit {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StorefrontPage() {
  const user = authService.getCurrentUser();
  const userId = (user as any)?.id ?? '';

  const storeUrl = `${window.location.origin}/store/${userId}`;

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : {
        ...DEFAULT_SETTINGS,
        storeName: (user as any)?.businessName || `${(user as any)?.firstName || ''} ${(user as any)?.lastName || ''}`.trim() || 'My Store',
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [editingSettings, setEditingSettings] = useState(false);
  const [draft, setDraft] = useState<StoreSettings>(settings);
  const [copied, setCopied] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productError, setProductError] = useState('');

  // Load products from inventory
  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    setProductError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/inventory`, { headers: authHeaders() });
      if (!res.ok) {
        setProductError(res.status === 502 || res.status === 503
          ? 'Server is starting up. Please try again in a moment.'
          : `Could not load products (${res.status})`);
        return;
      }
      const data = await res.json();
      if (data.success) setProducts(data.data.filter((p: Product) => p.quantity > 0));
      else setProductError(data.message || 'Failed to load products');
    } catch {
      setProductError('Could not reach server. Check your connection.');
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  function saveSettings() {
    setSettings(draft);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(draft));
    setEditingSettings(false);
  }

  function copyLink() {
    navigator.clipboard.writeText(storeUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const inStockProducts = products.filter(p => p.quantity > 0);
  const categories = [...new Set(inStockProducts.map(p => p.category))];

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="space-y-6 pb-8"
      >
        {/* ── Page Header ── */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-slate-900">Digital Storefront</h1>
            <div className="h-1 w-16 bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] rounded-full mt-2 mb-1" />
            <p className="text-sm text-slate-500">Your public-facing store — share it with customers to browse and order</p>
          </div>
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors shadow"
          >
            <ExternalLink className="w-4 h-4" />
            View Live Store
          </a>
        </div>

        {/* ── Share Link Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] rounded-2xl p-5 text-white shadow-[0_8px_30px_rgba(255,138,43,0.25)]"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Your Store Link</p>
              <p className="text-white/80 text-xs">Share this link on WhatsApp, Instagram, or anywhere</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
            <code className="flex-1 text-xs font-mono truncate">{storeUrl}</code>
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 bg-white text-[#FF8A2B] font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-white/90 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </motion.div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { icon: ShoppingBag, label: 'Products Listed', value: inStockProducts.length, color: 'text-[#FF8A2B]', bg: 'bg-[#FF8A2B]/10' },
            { icon: Store, label: 'Categories', value: categories.length, color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: Share2, label: 'Share Channels', value: '5+', color: 'text-green-600', bg: 'bg-green-50' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.04 }}
              className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-100"
            >
              <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Store Settings ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Store Settings</h2>
            {editingSettings ? (
              <div className="flex gap-2">
                <button
                  onClick={() => { setDraft(settings); setEditingSettings(false); }}
                  className="text-sm text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSettings}
                  className="flex items-center gap-1.5 text-sm font-semibold bg-[#FF8A2B] text-white px-4 py-1.5 rounded-lg hover:bg-[#FF6B00] transition-colors"
                >
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setDraft(settings); setEditingSettings(true); }}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" /> Edit
              </button>
            )}
          </div>

          <div className="p-5">
            {editingSettings ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Store Name', field: 'storeName' as const, placeholder: 'e.g. Amaka\'s Fashion Hub' },
                  { label: 'Tagline', field: 'tagline' as const, placeholder: 'e.g. Quality at your doorstep' },
                  { label: 'WhatsApp Number', field: 'whatsapp' as const, placeholder: 'e.g. 08012345678' },
                ].map(({ label, field, placeholder }) => (
                  <div key={field}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
                    <input
                      value={draft[field]}
                      onChange={e => setDraft(prev => ({ ...prev, [field]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] transition-colors"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Business Category</label>
                  <select
                    value={draft.category}
                    onChange={e => setDraft(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] transition-colors"
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Store Description</label>
                  <textarea
                    value={draft.description}
                    onChange={e => setDraft(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Tell customers what you sell and why they should buy from you..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] transition-colors resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Store Name', value: settings.storeName || '—' },
                  { label: 'Tagline', value: settings.tagline || '—' },
                  { label: 'WhatsApp', value: settings.whatsapp || '—' },
                  { label: 'Category', value: settings.category },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
                    <p className="text-sm text-slate-900 mt-0.5">{value}</p>
                  </div>
                ))}
                {settings.description && (
                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</p>
                    <p className="text-sm text-slate-900 mt-0.5">{settings.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Product Catalog ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-slate-900">Product Catalog</h2>
              <p className="text-xs text-slate-500 mt-0.5">In-stock products shown to customers on your store</p>
            </div>
            <button onClick={loadProducts} className="text-xs text-[#FF8A2B] font-semibold hover:underline">
              Refresh
            </button>
          </div>

          <div className="p-5">
            {loadingProducts ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-[#FF8A2B] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : productError ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                <WifiOff className="w-8 h-8 text-slate-300" />
                <p className="text-sm text-slate-500">{productError}</p>
                <button
                  onClick={loadProducts}
                  className="text-sm font-semibold text-[#FF8A2B] hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : inStockProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                <Package className="w-8 h-8 text-slate-300" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">No products yet</p>
                  <p className="text-xs text-slate-500 mt-0.5">Add products in Inventory — they'll appear here automatically</p>
                </div>
                <a
                  href="/dashboard/inventory"
                  className="text-sm font-semibold text-[#FF8A2B] hover:underline"
                >
                  Go to Inventory →
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {inStockProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border border-slate-100 rounded-xl p-4 hover:border-[#FF8A2B]/30 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="w-9 h-9 rounded-xl bg-[#FF8A2B]/10 flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-4 h-4 text-[#FF8A2B]" />
                      </div>
                      <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 truncate">
                        {product.category}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-900 text-sm truncate">{product.name}</p>
                    {product.description && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{product.description}</p>
                    )}
                    <p className="text-base font-bold text-[#FF8A2B] mt-2">{formatNaira(product.sellingPrice)}</p>
                    <p className="text-xs text-green-600 mt-0.5">{product.quantity} in stock</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Share Channels ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-50 rounded-2xl p-5 border border-slate-100"
        >
          <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
            <Wifi className="w-4 h-4 text-[#FF8A2B]" /> Share your store
          </h3>
          <p className="text-xs text-slate-500 mb-4">Copy your link and paste it wherever your customers are</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'WhatsApp', bg: 'bg-green-500', href: `https://wa.me/?text=Shop+from+my+store+${encodeURIComponent(storeUrl)}` },
              { label: 'Facebook', bg: 'bg-blue-600', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storeUrl)}` },
              { label: 'Twitter/X', bg: 'bg-slate-900', href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(storeUrl)}&text=Shop+from+my+store!` },
              { label: 'Copy Link', bg: 'bg-[#FF8A2B]', action: copyLink },
            ].map(({ label, bg, href, action }) =>
              action ? (
                <button key={label} onClick={action} className={`${bg} text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity`}>
                  {copied && label === 'Copy Link' ? '✓ Copied!' : label}
                </button>
              ) : (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={`${bg} text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity`}>
                  {label}
                </a>
              )
            )}
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
