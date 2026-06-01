import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, Phone, Mail, Package, MessageCircle, ArrowLeft, Plus, Minus, ShoppingCart, X } from 'lucide-react';
import { API_BASE_URL } from '../config/apiConfig';

interface StoreData {
  store: {
    userId: string;
    storeName: string;
    phone?: string | null;
    email?: string | null;
    tagline?: string | null;
    description?: string | null;
    category?: string | null;
  };
  products: Product[];
}

interface Product {
  id: string;
  name: string;
  category: string;
  sellingPrice: number;
  quantity: number;
  description?: string;
}

interface CartItem {
  product: Product;
  qty: number;
}

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', minimumFractionDigits: 0,
  }).format(amount);
}

export function PublicStorefrontPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCat, setFilterCat] = useState('All');

  // Cart: productId → CartItem
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [showCart, setShowCart] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    if (!storeId) return;
    fetch(`${API_BASE_URL}/api/store/${storeId}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) setData(res.data);
        else setError(res.message || 'Store not found');
      })
      .catch(() => setError('Could not load store. Please try again.'))
      .finally(() => setLoading(false));
  }, [storeId]);

  // ── Cart helpers ────────────────────────────────────────────────────────────

  function addToCart(product: Product) {
    setCart(prev => {
      const next = new Map(prev);
      const existing = next.get(product.id);
      const currentQty = existing?.qty ?? 0;
      if (currentQty >= product.quantity) return prev; // enforce stock
      next.set(product.id, { product, qty: currentQty + 1 });
      return next;
    });
  }

  function removeFromCart(product: Product) {
    setCart(prev => {
      const next = new Map(prev);
      const existing = next.get(product.id);
      if (!existing) return prev;
      if (existing.qty <= 1) next.delete(product.id);
      else next.set(product.id, { ...existing, qty: existing.qty - 1 });
      return next;
    });
  }

  function clearCart() {
    setCart(new Map());
    setShowCart(false);
  }

  const cartItems = Array.from(cart.values());
  const cartTotal = cartItems.reduce((sum, i) => sum + i.product.sellingPrice * i.qty, 0);
  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

  // ── Place order: record in backend then open WhatsApp/Email ─────────────────

  async function placeOrder(channel: 'whatsapp' | 'email') {
    if (!data) return;
    const { store } = data;
    setIsPlacingOrder(true);

    // Record the order in the backend (best-effort — proceed even if it fails)
    try {
      await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: store.userId,
          items: cartItems.map(i => ({
            productId: i.product.id,
            productName: i.product.name,
            quantity: i.qty,
            unitPrice: i.product.sellingPrice,
          })),
        }),
      });
    } catch {
      // Non-fatal: still let the customer contact the seller
    }

    setIsPlacingOrder(false);

    // Build the contact URL and open it
    if (channel === 'whatsapp' && store.phone) {
      const lines = cartItems.map(
        i => `• ${i.qty}x ${i.product.name} — ${formatNaira(i.product.sellingPrice * i.qty)}`
      );
      const msg = [
        `Hi! I'd like to order the following from *${store.storeName}*:`,
        '',
        ...lines,
        '',
        `*Total: ${formatNaira(cartTotal)}*`,
        '',
        'Please confirm availability and payment details. Thank you!',
      ].join('\n');
      window.open(`https://wa.me/${store.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
    } else if (channel === 'email' && store.email) {
      const subject = `Order from ${store.storeName}`;
      const lines = cartItems.map(
        i => `- ${i.qty}x ${i.product.name} (${formatNaira(i.product.sellingPrice * i.qty)})`
      );
      const body = [
        `Hi,`,
        ``,
        `I'd like to place the following order from ${store.storeName}:`,
        ``,
        ...lines,
        ``,
        `Total: ${formatNaira(cartTotal)}`,
        ``,
        `Please confirm availability and payment details.`,
        ``,
        `Thank you!`,
      ].join('\n');
      window.location.href = `mailto:${store.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    clearCart();
  }

  // ── Loading / error states ──────────────────────────────────────────────────

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

  const hasPhone = !!store.phone;
  const hasEmail = !!store.email;
  const canOrder = hasPhone || hasEmail;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F0F3F5]">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold">{store.storeName}</h1>
                {store.category && (
                  <span className="bg-white/20 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {store.category}
                  </span>
                )}
              </div>
              {store.tagline ? (
                <p className="text-white/90 text-sm mt-0.5 italic">{store.tagline}</p>
              ) : (
                <p className="text-white/80 text-sm mt-0.5">
                  {products.length} product{products.length !== 1 ? 's' : ''} available
                </p>
              )}
            </div>
          </div>

          {store.description && (
            <p className="mt-4 text-white/80 text-sm max-w-2xl leading-relaxed">{store.description}</p>
          )}

          {/* Contact buttons */}
          <div className="flex flex-wrap gap-3 mt-5">
            {hasPhone && (
              <a
                href={`https://wa.me/${store.phone!.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            )}
            {hasPhone && (
              <a
                href={`tel:${store.phone}`}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
              >
                <Phone className="w-4 h-4" /> Call
              </a>
            )}
            {hasEmail && (
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

      {/* ── Products ── */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-32">
        {/* Category filter — only show when there are multiple categories */}
        {categories.length > 1 && (
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
            {filtered.map(product => {
              const inCart = cart.get(product.id)?.qty ?? 0;
              const stockLeft = product.quantity - inCart;
              const atMax = inCart >= product.quantity;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] hover:-translate-y-1 transition-all duration-200"
                >
                  {/* Placeholder image block */}
                  <div className="h-28 bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center relative">
                    <Package className="w-10 h-10 text-orange-300" />
                    {inCart > 0 && (
                      <span className="absolute top-2 right-2 bg-[#FF8A2B] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {inCart}
                      </span>
                    )}
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
                    <p className={`text-[11px] mt-0.5 ${stockLeft <= 0 ? 'text-red-400' : stockLeft <= 3 ? 'text-amber-500' : 'text-slate-400'}`}>
                      {stockLeft <= 0 ? 'Out of stock' : stockLeft <= 3 ? `Only ${stockLeft} left` : `${stockLeft} in stock`}
                    </p>

                    {/* Add to cart / quantity controls */}
                    {canOrder && (
                      inCart === 0 ? (
                        <button
                          onClick={() => addToCart(product)}
                          disabled={stockLeft <= 0}
                          className="mt-3 w-full flex items-center justify-center gap-1.5 bg-[#FF8A2B] hover:bg-[#FF6B00] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-semibold py-2 rounded-xl transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add to Cart
                        </button>
                      ) : (
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() => removeFromCart(product)}
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5 text-slate-700" />
                          </button>
                          <span className="flex-1 text-center text-sm font-bold text-slate-900">{inCart}</span>
                          <button
                            onClick={() => addToCart(product)}
                            disabled={atMax}
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#FF8A2B] hover:bg-[#FF6B00] disabled:bg-slate-200 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5 text-white disabled:text-slate-400" />
                          </button>
                        </div>
                      )
                    )}

                    {/* No contact — show message */}
                    {!canOrder && (
                      <p className="mt-3 text-[11px] text-slate-400 text-center">Contact seller to order</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-center text-xs text-slate-400 mt-10">
          Powered by{' '}
          <a href="/" className="text-[#FF8A2B] font-medium hover:underline">
            MyBizTools
          </a>
        </p>
      </div>

      {/* ── Floating Cart Bar ── */}
      {cartCount > 0 && !showCart && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto">
          <button
            onClick={() => setShowCart(true)}
            className="w-full flex items-center justify-between bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 bg-[#FF8A2B] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
              <span className="text-sm font-semibold">{cartCount} item{cartCount !== 1 ? 's' : ''} in cart</span>
            </div>
            <span className="text-sm font-bold text-[#FF8A2B]">{formatNaira(cartTotal)}</span>
          </button>
        </div>
      )}

      {/* ── Cart Sheet ── */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCart(false)} />
          <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col">
            {/* Cart header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-lg">Your Cart</h2>
              <button onClick={() => setShowCart(false)} className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Cart items */}
            <div className="overflow-y-auto flex-1 px-5 py-3 space-y-3">
              {cartItems.map(({ product, qty }) => (
                <div key={product.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-orange-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                    <p className="text-xs text-slate-400">{formatNaira(product.sellingPrice)} each</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => removeFromCart(product)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      <Minus className="w-3 h-3 text-slate-700" />
                    </button>
                    <span className="text-sm font-bold text-slate-900 w-5 text-center">{qty}</span>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={qty >= product.quantity}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#FF8A2B] hover:bg-[#FF6B00] disabled:bg-slate-200 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  <p className="text-sm font-bold text-[#FF8A2B] w-16 text-right shrink-0">
                    {formatNaira(product.sellingPrice * qty)}
                  </p>
                </div>
              ))}
            </div>

            {/* Cart footer */}
            <div className="px-5 py-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Total</span>
                <span className="text-xl font-bold text-slate-900">{formatNaira(cartTotal)}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={clearCart}
                  disabled={isPlacingOrder}
                  className="px-4 py-3 text-sm text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Clear
                </button>

                {hasPhone && (
                  <button
                    onClick={() => placeOrder('whatsapp')}
                    disabled={isPlacingOrder}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#FF8A2B] hover:bg-[#FF6B00] disabled:opacity-60 text-white text-sm font-bold py-3 rounded-xl transition-colors"
                  >
                    {isPlacingOrder ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <MessageCircle className="w-4 h-4" />
                    )}
                    {isPlacingOrder ? 'Placing order…' : 'Order via WhatsApp'}
                  </button>
                )}

                {!hasPhone && hasEmail && (
                  <button
                    onClick={() => placeOrder('email')}
                    disabled={isPlacingOrder}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-bold py-3 rounded-xl transition-colors"
                  >
                    {isPlacingOrder ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                    {isPlacingOrder ? 'Placing order…' : 'Order via Email'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
