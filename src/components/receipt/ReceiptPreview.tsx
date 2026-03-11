import React from 'react';
import { Receipt } from '../../types/receipt';
import { CURRENCIES } from '../../types/invoice';
import { formatCurrency, formatDate } from '../../utils/invoiceUtils';

interface ReceiptPreviewProps {
  receipt: Receipt;
  showWatermark?: boolean;
}

export function ReceiptPreview({ receipt, showWatermark }: ReceiptPreviewProps) {
  const currency = CURRENCIES.find(c => c.code === receipt.currency);
  const currencySymbol = currency?.symbol || '$';

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto relative overflow-hidden" id="receipt-preview">
      {showWatermark && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10 rotate-[-35deg] opacity-10 select-none">
          <span className="text-[80px] font-black text-gray-800 whitespace-nowrap tracking-widest">MYBIZTOOLS FREE</span>
        </div>
      )}
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-[#1e3a8a] pb-6">
        {receipt.businessInfo.logo && (
          <img src={receipt.businessInfo.logo} alt="Logo" className="h-16 mx-auto mb-4" />
        )}
        <h1 className="text-3xl font-bold text-[#1e3a8a] mb-2">RECEIPT</h1>
        <p className="text-sm text-gray-600">#{receipt.receiptNumber}</p>
      </div>

      {/* Business & Customer Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 mb-2">FROM:</h3>
          <p className="font-bold text-gray-900">{receipt.businessInfo.name}</p>
          <p className="text-sm text-gray-600">{receipt.businessInfo.address}</p>
          <p className="text-sm text-gray-600">{receipt.businessInfo.phone}</p>
          <p className="text-sm text-gray-600">{receipt.businessInfo.email}</p>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-gray-500 mb-2">TO:</h3>
          <p className="font-bold text-gray-900">{receipt.customerInfo.name}</p>
          {receipt.customerInfo.email && (
            <p className="text-sm text-gray-600">{receipt.customerInfo.email}</p>
          )}
          {receipt.customerInfo.phone && (
            <p className="text-sm text-gray-600">{receipt.customerInfo.phone}</p>
          )}
          <p className="text-sm text-gray-600 mt-2">
            <span className="font-semibold">Date: </span>
            {formatDate(receipt.receiptDate)}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Payment: </span>
            {receipt.paymentMethod}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-6">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="text-left py-2 text-sm font-semibold text-gray-700">Item</th>
            <th className="text-center py-2 text-sm font-semibold text-gray-700">Qty</th>
            <th className="text-right py-2 text-sm font-semibold text-gray-700">Price</th>
            <th className="text-right py-2 text-sm font-semibold text-gray-700">Total</th>
          </tr>
        </thead>
        <tbody>
          {receipt.items.map((item, index) => (
            <tr key={item.id} className="border-b border-gray-200">
              <td className="py-3 text-sm text-gray-900">{item.name}</td>
              <td className="text-center py-3 text-sm text-gray-900">{item.quantity}</td>
              <td className="text-right py-3 text-sm text-gray-900">
                {formatCurrency(item.unitPrice, currencySymbol)}
              </td>
              <td className="text-right py-3 text-sm font-semibold text-gray-900">
                {formatCurrency(item.lineTotal, currencySymbol)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-700">Subtotal:</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(receipt.summary.subtotal, currencySymbol)}
            </span>
          </div>
          {receipt.summary.vatEnabled && (
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-700">VAT ({receipt.summary.vatRate}%):</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(receipt.summary.vatAmount, currencySymbol)}
              </span>
            </div>
          )}
          {receipt.summary.discount > 0 && (
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-700">Discount:</span>
              <span className="text-sm font-semibold text-red-600">
                -{formatCurrency(receipt.summary.discount, currencySymbol)}
              </span>
            </div>
          )}
          <div className="flex justify-between py-3 bg-[#1e3a8a] text-white px-4 rounded-lg mt-2">
            <span className="font-bold">TOTAL PAID:</span>
            <span className="font-bold text-lg">
              {formatCurrency(receipt.summary.total, currencySymbol)}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {receipt.notes && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">NOTES</h3>
          <p className="text-sm text-gray-600 whitespace-pre-line">{receipt.notes}</p>
        </div>
      )}

      {/* Signature */}
      {receipt.signature && (
        <div className="mt-8 flex justify-end">
          <div>
            <img src={receipt.signature} alt="Signature" className="h-16 mb-2" />
            <div className="border-t border-gray-300 w-48 pt-2">
              <p className="text-xs text-gray-700 text-center">Authorized Signature</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">Thank you for your business!</p>
        <p className="text-xs text-gray-500 mt-1">This is a computer-generated receipt</p>
      </div>
    </div>
  );
}
