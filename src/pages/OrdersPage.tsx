import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Check, X, Clock, Package, Phone, Mail, RefreshCw } from 'lucide-react';
import { authService } from '../services/authService';
import { API_BASE_URL } from '../config/apiConfig';
import { useToast } from '../utils/useToast';
import { ToastContainer } from '../components/ui/Toast';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface Order {
  id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalAmount: number;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  notes?: string | null;
  items: OrderItem[];
  createdAt: string;
}

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', minimumFractionDigits: 0,
  }).format(amount);
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const STATUS_TABS = ['all', 'pending', 'confirmed', 'cancelled'] as const;
type StatusTab = typeof STATUS_TABS[number];

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-slate-100 text-slate-500',
};

export function OrdersPage() {
  const { toasts, addToast, removeToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<StatusTab>('pending');
  const [actioning, setActioning] = useState<string | null>(null);

  function authHeaders(): Record<string, string> {
    const token = authService.getToken();
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders?status=${tab}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setOrders(data.data.orders);
      else addToast(data.message || 'Failed to load orders', 'error');
    } catch {
      addToast('Could not reach server', 'error');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  async function confirmOrder(orderId: string) {
    setActioning(orderId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/confirm`, {
        method: 'PUT',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        addToast('Order confirmed — stock updated', 'success');
        fetchOrders();
      } else {
        addToast(data.message || 'Failed to confirm order', 'error');
      }
    } catch {
      addToast('Could not reach server', 'error');
    } finally {
      setActioning(null);
    }
  }

  async function cancelOrder(orderId: string) {
    setActioning(orderId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        addToast('Order cancelled', 'success');
        fetchOrders();
      } else {
        addToast(data.message || 'Failed to cancel order', 'error');
      }
    } catch {
      addToast('Could not reach server', 'error');
    } finally {
      setActioning(null);
    }
  }

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6 pb-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-slate-900">Orders</h1>
            <div className="h-1 w-16 bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] rounded-full mt-2 mb-1" />
            <p className="text-sm text-slate-500">
              Confirm an order to automatically reduce your inventory stock
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUS_TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${
                tab === t
                  ? 'bg-[#FF8A2B] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t}
              {t === 'pending' && pendingCount > 0 && tab !== 'pending' && (
                <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-[#FF8A2B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <ShoppingBag className="w-10 h-10 text-slate-200" />
            <p className="text-slate-500 font-medium">No {tab === 'all' ? '' : tab} orders yet</p>
            <p className="text-slate-400 text-sm max-w-xs">
              {tab === 'pending'
                ? 'New orders from your storefront will appear here'
                : 'Orders will appear here once customers place them'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden"
              >
                {/* Order header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#FF8A2B]/10 flex items-center justify-center">
                      <Package className="w-4 h-4 text-[#FF8A2B]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {timeAgo(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[order.status]}`}>
                      {order.status}
                    </span>
                    <span className="text-base font-bold text-slate-900">{formatNaira(order.totalAmount)}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="px-5 py-3 space-y-1.5">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <span className="text-slate-700">
                        <span className="font-semibold">{item.quantity}x</span> {item.productName}
                      </span>
                      <span className="text-slate-500">{formatNaira(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>

                {/* Customer contact */}
                {(order.customerName || order.customerPhone || order.customerEmail) && (
                  <div className="px-5 pb-3 flex flex-wrap gap-3">
                    {order.customerName && (
                      <span className="text-xs text-slate-500">{order.customerName}</span>
                    )}
                    {order.customerPhone && (
                      <a
                        href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-green-600 hover:underline"
                      >
                        <Phone className="w-3 h-3" /> {order.customerPhone}
                      </a>
                    )}
                    {order.customerEmail && (
                      <a
                        href={`mailto:${order.customerEmail}`}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      >
                        <Mail className="w-3 h-3" /> {order.customerEmail}
                      </a>
                    )}
                  </div>
                )}

                {/* Actions — only for pending orders */}
                {order.status === 'pending' && (
                  <div className="flex gap-2 px-5 py-3 bg-slate-50 border-t border-slate-100">
                    <button
                      onClick={() => cancelOrder(order.id)}
                      disabled={actioning === order.id}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 bg-white rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                    <button
                      onClick={() => confirmOrder(order.id)}
                      disabled={actioning === order.id}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-[#FF8A2B] hover:bg-[#FF6B00] rounded-xl transition-colors disabled:opacity-50"
                    >
                      {actioning === order.id ? (
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      {actioning === order.id ? 'Confirming…' : 'Confirm & Reduce Stock'}
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </>
  );
}
