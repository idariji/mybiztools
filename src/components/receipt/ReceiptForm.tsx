import React, { useState } from 'react';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { Receipt, ReceiptItem, PAYMENT_METHODS } from '../../types/receipt';
import { CURRENCIES } from '../../types/invoice';
import { calculateReceiptLineTotal } from '../../utils/receiptUtils';

interface ReceiptFormProps {
  receipt: Receipt;
  onChange: (receipt: Receipt) => void;
}

export function ReceiptForm({ receipt, onChange }: ReceiptFormProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(receipt.businessInfo.logo || null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(receipt.signature || null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'signature') => {
    const file = e.target.files?.[0];
    if (file && file.size < 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'logo') {
          setLogoPreview(result);
          onChange({ ...receipt, businessInfo: { ...receipt.businessInfo, logo: result } });
        } else {
          setSignaturePreview(result);
          onChange({ ...receipt, signature: result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = () => {
    const newItem: ReceiptItem = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      unitPrice: 0,
      lineTotal: 0,
    };
    onChange({ ...receipt, items: [...receipt.items, newItem] });
  };

  const removeItem = (id: string) => {
    onChange({ ...receipt, items: receipt.items.filter(item => item.id !== id) });
  };

  const updateItem = (id: string, field: keyof ReceiptItem, value: any) => {
    const updatedItems = receipt.items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        updated.lineTotal = calculateReceiptLineTotal(updated.quantity, updated.unitPrice);
        return updated;
      }
      return item;
    });
    onChange({ ...receipt, items: updatedItems });
  };

  return (
    <div className="space-y-6">
      {/* Business Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo</label>
          <div className="flex items-center gap-4">
            {logoPreview && (
              <div className="relative">
                <img src={logoPreview} alt="Logo" className="h-16 w-16 object-contain" />
                <button
                  onClick={() => {
                    setLogoPreview(null);
                    onChange({ ...receipt, businessInfo: { ...receipt.businessInfo, logo: undefined } });
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span className="text-sm">Upload Logo</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'logo')} />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Business Name *"
            value={receipt.businessInfo.name}
            onChange={(e) => onChange({ ...receipt, businessInfo: { ...receipt.businessInfo, name: e.target.value } })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          />
          <input
            type="email"
            placeholder="Business Email *"
            value={receipt.businessInfo.email}
            onChange={(e) => onChange({ ...receipt, businessInfo: { ...receipt.businessInfo, email: e.target.value } })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Phone Number *"
            value={receipt.businessInfo.phone}
            onChange={(e) => onChange({ ...receipt, businessInfo: { ...receipt.businessInfo, phone: e.target.value } })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          />
        </div>
        <textarea
          placeholder="Business Address *"
          value={receipt.businessInfo.address}
          onChange={(e) => onChange({ ...receipt, businessInfo: { ...receipt.businessInfo, address: e.target.value } })}
          className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          rows={2}
        />
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Customer Name *"
            value={receipt.customerInfo.name}
            onChange={(e) => onChange({ ...receipt, customerInfo: { ...receipt.customerInfo, name: e.target.value } })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          />
          <input
            type="email"
            placeholder="Customer Email (optional)"
            value={receipt.customerInfo.email || ''}
            onChange={(e) => onChange({ ...receipt, customerInfo: { ...receipt.customerInfo, email: e.target.value } })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Customer Phone (optional)"
            value={receipt.customerInfo.phone || ''}
            onChange={(e) => onChange({ ...receipt, customerInfo: { ...receipt.customerInfo, phone: e.target.value } })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          />
        </div>
      </div>

      {/* Receipt Details */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Receipt Details</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
            <input
              type="text"
              value={receipt.receiptNumber}
              onChange={(e) => onChange({ ...receipt, receiptNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={receipt.receiptDate}
              onChange={(e) => onChange({ ...receipt, receiptDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={receipt.currency}
              onChange={(e) => onChange({ ...receipt, currency: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
            >
              {CURRENCIES.map(curr => (
                <option key={curr.code} value={curr.code}>{curr.symbol} {curr.name}</option>
              ))}
            </select>
          </div>
          <div className="col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={receipt.paymentMethod}
              onChange={(e) => onChange({ ...receipt, paymentMethod: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
            >
              {PAYMENT_METHODS.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Items Purchased</h3>
            <p className="text-xs text-gray-500 mt-1">Add products or services</p>
          </div>
          <button
            onClick={addItem}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF8A2B] text-white rounded-lg hover:bg-[#FF6B00]"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        <div className="space-y-4">
          {receipt.items.map((item, index) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Item Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Product Name"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Quantity *</label>
                  <input
                    type="number"
                    placeholder="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Unit Price *</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="mt-3 text-right">
                <span className="text-sm text-gray-600">Line Total: </span>
                <span className="text-lg font-semibold text-[#1e3a8a]">
                  {CURRENCIES.find(c => c.code === receipt.currency)?.symbol}{item.lineTotal.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VAT & Discount */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax & Discount</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="vatEnabled"
              checked={receipt.summary.vatEnabled}
              onChange={(e) => onChange({ 
                ...receipt, 
                summary: { ...receipt.summary, vatEnabled: e.target.checked }
              })}
              className="w-4 h-4 text-[#FF8A2B] border-gray-300 rounded focus:ring-[#FF8A2B]"
            />
            <label htmlFor="vatEnabled" className="ml-2 text-sm font-medium text-gray-700">
              Enable VAT
            </label>
          </div>
          {receipt.summary.vatEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">VAT Rate (%)</label>
              <input
                type="number"
                placeholder="7.5"
                value={receipt.summary.vatRate}
                onChange={(e) => onChange({ 
                  ...receipt, 
                  summary: { ...receipt.summary, vatRate: parseFloat(e.target.value) || 0 }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
            <input
              type="number"
              placeholder="0.00"
              value={receipt.summary.discount}
              onChange={(e) => onChange({ 
                ...receipt, 
                summary: { ...receipt.summary, discount: parseFloat(e.target.value) || 0 }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
        <textarea
          placeholder="Additional notes or terms..."
          value={receipt.notes}
          onChange={(e) => onChange({ ...receipt, notes: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          rows={3}
        />
      </div>

      {/* Signature */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Signature (Optional)</h3>
        <div className="flex items-center gap-4">
          {signaturePreview && (
            <div className="relative">
              <img src={signaturePreview} alt="Signature" className="h-16 w-32 object-contain border border-gray-200 rounded" />
              <button
                onClick={() => {
                  setSignaturePreview(null);
                  onChange({ ...receipt, signature: undefined });
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span className="text-sm">Upload Signature</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'signature')} />
          </label>
        </div>
      </div>
    </div>
  );
}
