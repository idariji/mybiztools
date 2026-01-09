export interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Receipt {
  id?: string;
  userId?: string;
  receiptNumber: string;
  receiptDate: string;
  currency: string;
  businessInfo: {
    name: string;
    address: string;
    email: string;
    phone: string;
    logo?: string;
  };
  customerInfo: {
    name: string;
    email?: string;
    phone?: string;
  };
  items: ReceiptItem[];
  summary: {
    subtotal: number;
    vatEnabled: boolean;
    vatRate: number;
    vatAmount: number;
    discount: number;
    total: number;
  };
  paymentMethod: string;
  notes: string;
  signature?: string;
  status: 'draft' | 'issued';
  createdAt?: string;
  updatedAt?: string;
}

export const PAYMENT_METHODS = [
  'Cash',
  'Bank Transfer',
  'Card',
  'Mobile Money',
  'Cheque',
  'Other',
];
