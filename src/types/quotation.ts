export interface QuotationItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vat: number;
  lineTotal: number;
}

export interface QuotationSummary {
  subtotal: number;
  totalVat: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  total: number;
}

export interface Quotation {
  id?: string;
  userId?: string;
  quotationNumber: string;
  issueDate: string;
  validUntil: string;
  currency: string;
  businessInfo: {
    name: string;
    address: string;
    email: string;
    phone: string;
    website?: string;
    logo?: string;
    taxId?: string;
  };
  clientInfo: {
    name: string;
    companyName?: string;
    address: string;
    email: string;
    phone: string;
  };
  items: QuotationItem[];
  summary: QuotationSummary;
  notes: string;
  terms: string;
  paymentInstructions: string;
  attachments?: string[];
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  publicLink?: string;
  linkExpiry?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const QUOTATION_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'sent', label: 'Sent', color: 'blue' },
  { value: 'accepted', label: 'Accepted', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'expired', label: 'Expired', color: 'orange' },
];
