import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, Phone, Mail, Package, MessageCircle, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../config/apiConfig';

interface StoreData {
  store: {
    userId: string;
    storeName: string;
    phone?: string | null;
    email?: string | null;
  };
  products: {
    id: string;
    name: string;
    category: string;
    sellingPrice: number;
    quantity: number;
    description?: string;
  }[];
}

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', minimumFractionDigits: 0,
  }).format(amount);
}

export function PublicStorefrontPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCat, setFilterCat] = useState('All');

  useEffect(() => {
    if (!userId) return;
    fetch(`${API_BASE_URL}/api/store/${userId}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) setData(res.data);
        else setError(res.message || 'Store not found');
      })
      .catch(() => setError('Could not load store. Please try again.'))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F3F5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-[#FF8A2B] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading store…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F0F3F5] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-slate-700 mb-1">Store not found</h2>
          <p className="text-slate-400 text-sm mb-4">{error || 'This store link may be invalid.'}</p>
          <button onClick={() => navigate('/')} className="text-[#FF8A2B] text-sm font-medium hover:underline">
            ← Go to MyBizTools
          </button>
        </div>
      </div>
    );
  }

  const { store, products } = data;
  const categories = ['All', ...new Set(products.map(p => p.category))];
  const filtered = filterCat === 'All' ? products : products.filter(p => p.category === filterCat);

  const whatsappMsg = (productName: string) =>
    `https://wa.me/${(store.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi! I'm interested in buying "${productName}" from your store.`)}`;

  return (
    <div className="min-h-screen bg-[#F0F3F5]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{store.storeName}</h1>
              <p className="text-white/80 text-sm mt-0.5">
                {products.length} product{products.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-wrap gap-3 mt-5">
            {store.phone && (
              <a
                href={`https://wa.me/${store.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            )}
            {store.phone && (
              <a
                href={`tel:${store.phone}`}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
              >
                <Phone className="w-4 h-4" /> Call
              </a>
            )}
            {store.email && (
              <a
                href={`mailto:${store.email}`}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
              >
                <Mail className="w-4 h-4" /> Email
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Category filter */}
        {categories.length > 2 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filterCat === cat
                    ? 'bg-[#FF8A2B] text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No products in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filtered.map(product => (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] hover:-translate-y-1 transition-all duration-200"
              >
                {/* Product colour block */}
                <div className="h-28 bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                  <Package className="w-10 h-10 text-orange-300" />
                </div>
                <div className="p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {product.category}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900 mt-0.5 line-clamp-2">{product.name}</h3>
                  {product.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{product.description}</p>
                  )}
                  <p className="text-base font-bold text-[#FF8A2B] mt-2">{formatNaira(product.sellingPrice)}</p>
                  <p className="text-[11px] text-slate-400">{product.quantity} in stock</p>

                  {store.phone && (
                    <a
                      href={whatsappMsg(product.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 w-full flex items-center justify-center gap-1.5 bg-[#FF8A2B] hover:bg-[#FF6B00] text-white text-xs font-semibold py-2 rounded-xl transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Order via WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-slate-400 mt-10">
          Powered by{' '}
          <a href="/" className="text-[#FF8A2B] font-medium hover:underline">
            MyBizTools
          </a>
        </p>
      </div>
    </div>
  );
}
