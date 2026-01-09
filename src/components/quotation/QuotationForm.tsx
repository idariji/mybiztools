import React, { useState } from 'react';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { Quotation, QuotationItem } from '../../types/quotation';
import { CURRENCIES } from '../../types/invoice';
import { calculateQuotationLineTotal } from '../../utils/quotationUtils';

interface QuotationFormProps {
  quotation: Quotation;
  onChange: (quotation: Quotation) => void;
}

export function QuotationForm({ quotation, onChange }: QuotationFormProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(quotation.businessInfo.logo || null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size < 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        onChange({ ...quotation, businessInfo: { ...quotation.businessInfo, logo: result } });
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = () => {
    const newItem: QuotationItem = {
      id: Date.now().toString(),
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      vat: 7.5,
      lineTotal: 0,
    };
    onChange({ ...quotation, items: [...quotation.items, newItem] });
  };

  const removeItem = (id: string) => {
    onChange({ ...quotation, items: quotation.items.filter(item => item.id !== id) });
  };

  const updateItem = (id: string, field: keyof QuotationItem, value: any) => {
    const updatedItems = quotation.items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        updated.lineTotal = calculateQuotationLineTotal(updated.quantity, updated.unitPrice, updated.vat);
        return updated;
      }
      return item;
    });
    onChange({ ...quotation, items: updatedItems });
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
                    onChange({ ...quotation, businessInfo: { ...quotation.businessInfo, logo: undefined } });
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
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Business Name *"
            value={quotation.businessInfo.name}
            onChange={(e) => onChange({ ...quotation, businessInfo: { ...quotation.businessInfo, name: e.target.value } })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          />
          <input
            type="email"
            placeholder="Business Email *"
            value={quotation.businessInfo.email}
            onChange={(e) => onChange({ ...quotation, businessInfo: { ...quotation.businessInfo, email: e.target.value } })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Phone Number *"
            value={quotation.businessInfo.phone}
            onChange={(e) => onChange({ ...quotation, businessInfo: { ...quotation.businessInfo, phone: e.target.value } })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Website (optional)"
            value={quotation.businessInfo.website || ''}
            onChange={(e) => onChange({ ...quotation, businessInfo: { ...quotation.businessInfo, website: e.target.value } })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Tax ID / Company Number"
            value={quotation.businessInfo.taxId || ''}
            onChange={(e) => onChange({ ...quotation, businessInfo: { ...quotation.businessInfo, taxId: e.target.value } })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          />
        </div>
        <textarea
          placeholder="Business Address *"
          value={quotation.businessInfo.address}
          onChange={(e) => onChange({ ...quotation, businessInfo: { ...quotation.businessInfo, address: e.target.value } })}
          className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          rows={2}
        />
      </div>

      {/* Client Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Client Name *"
            value={quotation.clientInfo.name}
            onChange={(e) => onChange({ ...quotation, clientInfo: { ...quotation.clientInfo, name: e.target.value } })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Company Name (optional)"
            value={quotation.clientInfo.companyName || ''}
            onChange={(e) => onChange({ ...quotation, clientInfo: { ...quotation.clientInfo, companyName: e.target.value } })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          />
          <input
            type="email"
            placeholder="Client Email *"
            value={quotation.clientInfo.email}
            onChange={(e) => onChange({ ...quotation, clientInfo: { ...quotation.clientInfo, email: e.target.value } })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Client Phone *"
            value={quotation.clientInfo.phone}
            onChange={(e) => onChange({ ...quotation, clientInfo: { ...quotation.clientInfo, phone: e.target.value } })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          />
        </div>
        <textarea
          placeholder="Client Address *"
          value={quotation.clientInfo.address}
          onChange={(e) => onChange({ ...quotation, clientInfo: { ...quotation.clientInfo, address: e.target.value } })}
          className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          rows={2}
        />
      </div>

      {/* Quotation Details */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quotation Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quotation Number</label>
            <input
              type="text"
              value={quotation.quotationNumber}
              onChange={(e) => onChange({ ...quotation, quotationNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={quotation.currency}
              onChange={(e) => onChange({ ...quotation, currency: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
            >
              {CURRENCIES.map(curr => (
                <option key={curr.code} value={curr.code}>{curr.symbol} {curr.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
            <input
              type="date"
              value={quotation.issueDate}
              onChange={(e) => onChange({ ...quotation, issueDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
            <input
              type="date"
              value={quotation.validUntil}
              onChange={(e) => onChange({ ...quotation, validUntil: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Items</h3>
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
          {quotation.items.map((item, index) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Item Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Website Design"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="Brief details"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Quantity *</label>
                  <input
                    type="number"
                    placeholder="e.g., 5"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Unit Price *</label>
                  <input
                    type="number"
                    placeholder="Price per unit"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">VAT %</label>
                  <input
                    type="number"
                    placeholder="e.g., 7.5"
                    value={item.vat}
                    onChange={(e) => updateItem(item.id, 'vat', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="mt-3 text-right">
                <span className="text-sm text-gray-600">Line Total: </span>
                <span className="text-lg font-semibold text-[#1e3a8a]">
                  {CURRENCIES.find(c => c.code === quotation.currency)?.symbol}{item.lineTotal.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discount */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Discount (Optional)</h3>
        <div className="grid grid-cols-2 gap-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
            <select
              value={quotation.summary.discountType}
              onChange={(e) => onChange({ 
                ...quotation, 
                summary: { ...quotation.summary, discountType: e.target.value as 'percentage' | 'fixed' }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
            <input
              type="number"
              placeholder="0"
              value={quotation.summary.discount}
              onChange={(e) => onChange({ 
                ...quotation, 
                summary: { ...quotation.summary, discount: parseFloat(e.target.value) || 0 }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Notes & Terms */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
        <textarea
          placeholder="Notes to client"
          value={quotation.notes}
          onChange={(e) => onChange({ ...quotation, notes: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent mb-4"
          rows={3}
        />
        <textarea
          placeholder="Terms & Conditions"
          value={quotation.terms}
          onChange={(e) => onChange({ ...quotation, terms: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent mb-4"
          rows={3}
        />
        <textarea
          placeholder="Payment Instructions"
          value={quotation.paymentInstructions}
          onChange={(e) => onChange({ ...quotation, paymentInstructions: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          rows={3}
        />
      </div>
    </div>
  );
}
