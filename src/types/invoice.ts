export interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  lineTotal: number;
}

export interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
}

export interface ClientInfo {
  name: string;
  address: string;
  email: string;
  phone: string;
}

export interface PaymentInfo {
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions: string;
}

export interface InvoiceSummary {
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  bankCharges: number;
  vat: number;
  total: number;
  amountInWords: string;
}

export interface Invoice {
  id?: string;
  userId?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  paymentTerms: string;
  businessInfo: BusinessInfo;
  clientInfo: ClientInfo;
  items: InvoiceItem[];
  summary: InvoiceSummary;
  paymentInfo: PaymentInfo;
  notes: string;
  terms: string;
  signature?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  createdAt?: string;
  updatedAt?: string;
}

export const CURRENCIES = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
];

export const PAYMENT_TERMS = [
  'Due on Receipt',
  'Net 7',
  'Net 15',
  'Net 30',
  'Net 60',
];
