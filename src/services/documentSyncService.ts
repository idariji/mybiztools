import { authService } from './authService';

const API_BASE = '/api/generator';

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

// ── INVOICES ──
export const InvoiceSyncService = {
  async getAll(): Promise<any[]> {
    try {
      const data = await apiFetch('/invoices');
      return data.invoices || data || [];
    } catch {
      const raw = localStorage.getItem('invoice-drafts');
      return raw ? JSON.parse(raw) : [];
    }
  },
  async save(invoice: any): Promise<void> {
    try {
      if (invoice.id) {
        await apiFetch(`/invoices/${invoice.id}`, { method: 'PUT', body: JSON.stringify(invoice) });
      } else {
        const result = await apiFetch('/invoices', { method: 'POST', body: JSON.stringify(invoice) });
        invoice.id = result.id || result.invoice?.id;
      }
    } catch {
      // fallback: save to localStorage
      const drafts = JSON.parse(localStorage.getItem('invoice-drafts') || '[]');
      const idx = drafts.findIndex((d: any) => d.invoiceNumber === invoice.invoiceNumber);
      if (idx >= 0) drafts[idx] = invoice; else drafts.push(invoice);
      localStorage.setItem('invoice-drafts', JSON.stringify(drafts));
    }
  },
  async delete(id: string): Promise<void> {
    try { await apiFetch(`/invoices/${id}`, { method: 'DELETE' }); } catch { /* local only */ }
  },
};

// ── QUOTATIONS ──
export const QuotationSyncService = {
  async getAll(): Promise<any[]> {
    try {
      const data = await apiFetch('/quotations');
      return data.quotations || data || [];
    } catch {
      const raw = localStorage.getItem('quotation-drafts');
      return raw ? JSON.parse(raw) : [];
    }
  },
  async save(quotation: any): Promise<void> {
    try {
      if (quotation.id) {
        await apiFetch(`/quotations/${quotation.id}`, { method: 'PUT', body: JSON.stringify(quotation) });
      } else {
        const result = await apiFetch('/quotations', { method: 'POST', body: JSON.stringify(quotation) });
        quotation.id = result.id || result.quotation?.id;
      }
    } catch {
      const drafts = JSON.parse(localStorage.getItem('quotation-drafts') || '[]');
      const idx = drafts.findIndex((d: any) => d.quotationNumber === quotation.quotationNumber);
      if (idx >= 0) drafts[idx] = quotation; else drafts.push(quotation);
      localStorage.setItem('quotation-drafts', JSON.stringify(drafts));
    }
  },
  async delete(id: string): Promise<void> {
    try { await apiFetch(`/quotations/${id}`, { method: 'DELETE' }); } catch { /* local only */ }
  },
};

// ── RECEIPTS ──
export const ReceiptSyncService = {
  async getAll(): Promise<any[]> {
    try {
      const data = await apiFetch('/receipts');
      return data.receipts || data || [];
    } catch {
      const raw = localStorage.getItem('receipt-drafts');
      return raw ? JSON.parse(raw) : [];
    }
  },
  async save(receipt: any): Promise<void> {
    try {
      if (receipt.id) {
        await apiFetch(`/receipts/${receipt.id}`, { method: 'PUT', body: JSON.stringify(receipt) });
      } else {
        const result = await apiFetch('/receipts', { method: 'POST', body: JSON.stringify(receipt) });
        receipt.id = result.id || result.receipt?.id;
      }
    } catch {
      const drafts = JSON.parse(localStorage.getItem('receipt-drafts') || '[]');
      const idx = drafts.findIndex((d: any) => d.receiptNumber === receipt.receiptNumber);
      if (idx >= 0) drafts[idx] = receipt; else drafts.push(receipt);
      localStorage.setItem('receipt-drafts', JSON.stringify(drafts));
    }
  },
  async delete(id: string): Promise<void> {
    try { await apiFetch(`/receipts/${id}`, { method: 'DELETE' }); } catch { /* local only */ }
  },
};

// ── PAYSLIPS ──
export const PayslipSyncService = {
  async getAll(): Promise<any[]> {
    try {
      const data = await apiFetch('/payslips');
      return data.payslips || data || [];
    } catch {
      const raw = localStorage.getItem('payslip-drafts');
      return raw ? JSON.parse(raw) : [];
    }
  },
  async save(payslip: any): Promise<void> {
    try {
      if (payslip.id) {
        await apiFetch(`/payslips/${payslip.id}`, { method: 'PUT', body: JSON.stringify(payslip) });
      } else {
        const result = await apiFetch('/payslips', { method: 'POST', body: JSON.stringify(payslip) });
        payslip.id = result.id || result.payslip?.id;
      }
    } catch {
      const drafts = JSON.parse(localStorage.getItem('payslip-drafts') || '[]');
      const idx = drafts.findIndex((d: any) => d.payslipNumber === payslip.payslipNumber);
      if (idx >= 0) drafts[idx] = payslip; else drafts.push(payslip);
      localStorage.setItem('payslip-drafts', JSON.stringify(drafts));
    }
  },
  async delete(id: string): Promise<void> {
    try { await apiFetch(`/payslips/${id}`, { method: 'DELETE' }); } catch { /* local only */ }
  },
};
