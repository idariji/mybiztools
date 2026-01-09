import React, { useState } from 'react';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { Invoice, InvoiceItem, CURRENCIES, PAYMENT_TERMS } from '../../types/invoice';
import { generateInvoiceNumber, calculateLineTotal } from '../../utils/invoiceUtils';

interface InvoiceFormProps {
  invoice: Invoice;
  onChange: (invoice: Invoice) => void;
}

export function InvoiceForm({ invoice, onChange }: InvoiceFormProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(invoice.businessInfo.logo || null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(invoice.signature || null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'signature') => {
    const file = e.target.files?.[0];
    if (file && file.size < 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'logo') {
          setLogoPreview(result);
          onChange({ ...invoice, businessInfo: { ...invoice.businessInfo, logo: result } });
        } else {
          setSignaturePreview(result);
          onChange({ ...invoice, signature: result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      tax: 0,
      lineTotal: 0,
    };
    onChange({ ...invoice, items: [...invoice.items, newItem] });
  };

  const removeItem = (id: string) => {
    onChange({ ...invoice, items: invoice.items.filter(item => item.id !== id) });
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    const updatedItems = invoice.items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        updated.lineTotal = calculateLineTotal(
          updated.quantity,
          updated.unitPrice,
          updated.discount,
          updated.tax
        );
        return updated;
      }
      return item;
    });
    onChange({ ...invoice, items: updatedItems });
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
                    onChange({ ...invoice, businessInfo: { ...invoice.businessInfo, logo: undefined } });
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
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'logo')}
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Business Name *"
            value={invoice.businessInfo.name}
            onChange={(e) => onChange({ ...invoice, businessInfo: { ...invoice.businessInfo, name: e.target.value } })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          />
          <input
            type="email"
            placeholder="Business Email *"
            value={invoice.businessInfo.email}
            onChange={(e) => onChange({ ...invoice, businessInfo: { ...invoice.businessInfo, email: e.target.value } })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Phone Number *"
            value={invoice.businessInfo.phone}
            onChange={(e) => onChange({ ...invoice, businessInfo: { ...invoice.businessInfo, phone: e.target.value } })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Website (optional)"
            value={invoice.businessInfo.website || ''}
            onChange={(e) => onChange({ ...invoice, businessInfo: { ...invoice.businessInfo, website: e.target.value } })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          />
        </div>
        <textarea
          placeholder="Business Address *"
          value={invoice.businessInfo.address}
          onChange={(e) => onChange({ ...invoice, businessInfo: { ...invoice.businessInfo, address: e.target.value } })}
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
            value={invoice.clientInfo.name}
            onChange={(e) => onChange({ ...invoice, clientInfo: { ...invoice.clientInfo, name: e.target.value } })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          />
          <input
            type="email"
            placeholder="Client Email *"
            value={invoice.clientInfo.email}
            onChange={(e) => onChange({ ...invoice, clientInfo: { ...invoice.clientInfo, email: e.target.value } })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Client Phone *"
            value={invoice.clientInfo.phone}
            onChange={(e) => onChange({ ...invoice, clientInfo: { ...invoice.clientInfo, phone: e.target.value } })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          />
        </div>
        <textarea
          placeholder="Client Address *"
          value={invoice.clientInfo.address}
          onChange={(e) => onChange({ ...invoice, clientInfo: { ...invoice.clientInfo, address: e.target.value } })}
          className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          rows={2}
        />
      </div>

      {/* Invoice Details */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
            <input
              type="text"
              value={invoice.invoiceNumber}
              onChange={(e) => onChange({ ...invoice, invoiceNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={invoice.currency}
              onChange={(e) => onChange({ ...invoice, currency: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
            >
              {CURRENCIES.map(curr => (
                <option key={curr.code} value={curr.code}>{curr.symbol} {curr.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
            <input
              type="date"
              value={invoice.invoiceDate}
              onChange={(e) => onChange({ ...invoice, invoiceDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={invoice.dueDate}
              onChange={(e) => onChange({ ...invoice, dueDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
            <select
              value={invoice.paymentTerms}
              onChange={(e) => onChange({ ...invoice, paymentTerms: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
            >
              {PAYMENT_TERMS.map(term => (
                <option key={term} value={term}>{term}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Items</h3>
            <p className="text-xs text-gray-500 mt-1">Add products or services with pricing details</p>
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
          {invoice.items.map((item, index) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
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
                    placeholder="Brief details about the item"
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
                  <label className="block text-xs font-medium text-gray-600 mb-1">Discount %</label>
                  <input
                    type="number"
                    placeholder="e.g., 10"
                    value={item.discount}
                    onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tax %</label>
                  <input
                    type="number"
                    placeholder="e.g., 7.5"
                    value={item.tax}
                    onChange={(e) => updateItem(item.id, 'tax', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="mt-3 text-right">
                <span className="text-sm text-gray-600">Line Total: </span>
                <span className="text-lg font-semibold text-[#1e3a8a]">
                  {CURRENCIES.find(c => c.code === invoice.currency)?.symbol}{item.lineTotal.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Charges</h3>
        <div className="grid grid-cols-2 gap-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Charges (optional)</label>
            <input
              type="number"
              placeholder="0.00"
              value={invoice.summary.bankCharges}
              onChange={(e) => onChange({ 
                ...invoice, 
                summary: { ...invoice.summary, bankCharges: parseFloat(e.target.value) || 0 }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">VAT (7.5% of Total)</label>
            <input
              type="number"
              placeholder="0.00"
              value={invoice.summary.vat}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Bank Name"
            value={invoice.paymentInfo.bankName}
            onChange={(e) => onChange({ ...invoice, paymentInfo: { ...invoice.paymentInfo, bankName: e.target.value } })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Account Name"
            value={invoice.paymentInfo.accountName}
            onChange={(e) => onChange({ ...invoice, paymentInfo: { ...invoice.paymentInfo, accountName: e.target.value } })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Account Number"
            value={invoice.paymentInfo.accountNumber}
            onChange={(e) => onChange({ ...invoice, paymentInfo: { ...invoice.paymentInfo, accountNumber: e.target.value } })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          />
        </div>
        <textarea
          placeholder="Payment Instructions"
          value={invoice.paymentInfo.instructions}
          onChange={(e) => onChange({ ...invoice, paymentInfo: { ...invoice.paymentInfo, instructions: e.target.value } })}
          className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          rows={2}
        />
      </div>

      {/* Notes & Terms */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes & Terms</h3>
        <textarea
          placeholder="Notes to client"
          value={invoice.notes}
          onChange={(e) => onChange({ ...invoice, notes: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent mb-4"
          rows={3}
        />
        <textarea
          placeholder="Terms & Conditions"
          value={invoice.terms}
          onChange={(e) => onChange({ ...invoice, terms: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
          rows={3}
        />
      </div>

      {/* Signature */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Signature</h3>
        <div className="flex items-center gap-4">
          {signaturePreview && (
            <div className="relative">
              <img src={signaturePreview} alt="Signature" className="h-16 w-32 object-contain border border-gray-200 rounded" />
              <button
                onClick={() => {
                  setSignaturePreview(null);
                  onChange({ ...invoice, signature: undefined });
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
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, 'signature')}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
