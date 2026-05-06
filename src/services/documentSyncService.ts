import { API_BASE_URL } from '../config/apiConfig';
import { authService } from './authService';

const API_BASE = `${API_BASE_URL}/api/generator`;

function getHeaders() {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...(options.headers || {}) },
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

// Backend response shape: { success: true, data: { [key]: value } }
const extract = (resp: any, key: string): any[] =>
  resp?.data?.[key] ?? resp?.[key] ?? [];

const extractId = (resp: any, key: string): string | undefined =>
  resp?.data?.[key]?.id ?? resp?.data?.id ?? resp?.id ?? resp?.[key]?.id;

// Returns a user-scoped localStorage key so different users never share data
function localKey(base: string): string {
  const userId = authService.getCurrentUser()?.id;
  return userId ? `${base}-${userId}` : base;
}

// ── INVOICES ──
export const InvoiceSyncService = {
  async getAll(): Promise<any[]> {
    try {
      const resp = await apiFetch('/invoices');
      return extract(resp, 'invoices');
    } catch {
      const raw = localStorage.getItem(localKey('invoice-drafts'));
      return raw ? JSON.parse(raw) : [];
    }
  },

  async save(invoice: any): Promise<string | undefined> {
    try {
      if (invoice.id) {
        await apiFetch(`/invoices/${invoice.id}`, {
          method: 'PUT',
          body: JSON.stringify(invoice),
        });
        return invoice.id;
      } else {
        const result = await apiFetch('/invoices', {
          method: 'POST',
          body: JSON.stringify(invoice),
        });
        invoice.id = extractId(result, 'invoice');
        return invoice.id;
      }
    } catch {
      const key = localKey('invoice-drafts');
      const drafts = JSON.parse(localStorage.getItem(key) || '[]');
      const idx = drafts.findIndex((d: any) => d.invoiceNumber === invoice.invoiceNumber);
      if (idx >= 0) drafts[idx] = invoice;
      else drafts.push(invoice);
      localStorage.setItem(key, JSON.stringify(drafts));
      return invoice.id;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiFetch(`/invoices/${id}`, { method: 'DELETE' });
    } catch {
      /* local only */
    }
  },
};

// ── QUOTATIONS ──
export const QuotationSyncService = {
  async getAll(): Promise<any[]> {
    try {
      const resp = await apiFetch('/quotations');
      return extract(resp, 'quotations');
    } catch {
      const raw = localStorage.getItem(localKey('quotation-drafts'));
      return raw ? JSON.parse(raw) : [];
    }
  },

  async save(quotation: any): Promise<string | undefined> {
    try {
      if (quotation.id) {
        await apiFetch(`/quotations/${quotation.id}`, {
          method: 'PUT',
          body: JSON.stringify(quotation),
        });
        return quotation.id;
      } else {
        const result = await apiFetch('/quotations', {
          method: 'POST',
          body: JSON.stringify(quotation),
        });
        quotation.id = extractId(result, 'quotation');
        return quotation.id;
      }
    } catch {
      const key = localKey('quotation-drafts');
      const drafts = JSON.parse(localStorage.getItem(key) || '[]');
      const idx = drafts.findIndex((d: any) => d.quotationNumber === quotation.quotationNumber);
      if (idx >= 0) drafts[idx] = quotation;
      else drafts.push(quotation);
      localStorage.setItem(key, JSON.stringify(drafts));
      return quotation.id;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiFetch(`/quotations/${id}`, { method: 'DELETE' });
    } catch {
      /* local only */
    }
  },
};

// ── RECEIPTS ──
export const ReceiptSyncService = {
  async getAll(): Promise<any[]> {
    try {
      const resp = await apiFetch('/receipts');
      return extract(resp, 'receipts');
    } catch {
      const raw = localStorage.getItem(localKey('receipt-drafts'));
      return raw ? JSON.parse(raw) : [];
    }
  },

  async save(receipt: any): Promise<string | undefined> {
    // Map frontend nested Receipt shape to the flat shape the backend expects
    const payload = {
      receiptNumber:    receipt.receiptNumber,
      receiptDate:      receipt.receiptDate,
      currency:         receipt.currency,
      paymentMethod:    receipt.paymentMethod,
      paymentReference: receipt.paymentReference,
      notes:            receipt.notes,
      status:           receipt.status,
      customerName:     receipt.customerInfo?.name  ?? receipt.customerName,
      customerEmail:    receipt.customerInfo?.email ?? receipt.customerEmail,
      customerPhone:    receipt.customerInfo?.phone ?? receipt.customerPhone,
      subtotal:         receipt.summary?.subtotal   ?? receipt.subtotal,
      taxAmount:        receipt.summary?.vatAmount  ?? receipt.taxAmount,
      total:            receipt.summary?.total      ?? receipt.total,
      items: (receipt.items || []).map((item: any) => ({
        description: item.name ?? item.description,
        quantity:    item.quantity,
        unitPrice:   item.unitPrice,
        amount:      item.lineTotal ?? item.amount,
      })),
      documentData: receipt,
    };

    try {
      if (receipt.id) {
        await apiFetch(`/receipts/${receipt.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        return receipt.id;
      } else {
        const result = await apiFetch('/receipts', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        receipt.id = extractId(result, 'receipt');
        return receipt.id;
      }
    } catch {
      const key = localKey('receipt-drafts');
      const drafts = JSON.parse(localStorage.getItem(key) || '[]');
      const idx = drafts.findIndex((d: any) => d.receiptNumber === receipt.receiptNumber);
      if (idx >= 0) drafts[idx] = receipt;
      else drafts.push(receipt);
      localStorage.setItem(key, JSON.stringify(drafts));
      return receipt.id;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiFetch(`/receipts/${id}`, { method: 'DELETE' });
    } catch {
      /* local only */
    }
  },
};

// ── PAYSLIPS ──
export const PayslipSyncService = {
  async getAll(): Promise<any[]> {
    try {
      const resp = await apiFetch('/payslips');
      return extract(resp, 'payslips');
    } catch {
      const raw = localStorage.getItem(localKey('payslip-drafts'));
      return raw ? JSON.parse(raw) : [];
    }
  },

  async save(payslip: any): Promise<void> {
    try {
      if (payslip.id) {
        await apiFetch(`/payslips/${payslip.id}`, {
          method: 'PUT',
          body: JSON.stringify(payslip),
        });
      } else {
        const result = await apiFetch('/payslips', {
          method: 'POST',
          body: JSON.stringify(payslip),
        });
        payslip.id = extractId(result, 'payslip');
      }
    } catch {
      const key = localKey('payslip-drafts');
      const drafts = JSON.parse(localStorage.getItem(key) || '[]');
      const idx = drafts.findIndex((d: any) => d.payslipNumber === payslip.payslipNumber);
      if (idx >= 0) drafts[idx] = payslip;
      else drafts.push(payslip);
      localStorage.setItem(key, JSON.stringify(drafts));
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiFetch(`/payslips/${id}`, { method: 'DELETE' });
    } catch {
      /* local only */
    }
  },
};
