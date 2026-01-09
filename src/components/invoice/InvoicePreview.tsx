import React from 'react';
import { Invoice, CURRENCIES } from '../../types/invoice';
import { formatCurrency, formatDate } from '../../utils/invoiceUtils';

interface InvoicePreviewProps {
  invoice: Invoice;
}

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const currency = CURRENCIES.find(c => c.code === invoice.currency);
  const currencySymbol = currency?.symbol || '$';

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto" id="invoice-preview">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          {invoice.businessInfo.logo && (
            <img src={invoice.businessInfo.logo} alt="Logo" className="h-16 mb-4" />
          )}
          <h2 className="text-2xl font-bold text-[#1e3a8a]">{invoice.businessInfo.name}</h2>
          <p className="text-sm text-gray-600 mt-1">{invoice.businessInfo.address}</p>
          <p className="text-sm text-gray-600">{invoice.businessInfo.phone}</p>
          <p className="text-sm text-gray-600">{invoice.businessInfo.email}</p>
          {invoice.businessInfo.website && (
            <p className="text-sm text-[#FF8A2B]">{invoice.businessInfo.website}</p>
          )}
        </div>
        <div className="text-right">
          <h1 className="text-4xl font-bold text-[#1e3a8a] mb-2">INVOICE</h1>
          <p className="text-sm text-gray-600">#{invoice.invoiceNumber}</p>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">BILL TO:</h3>
          <p className="font-semibold text-gray-900">{invoice.clientInfo.name}</p>
          <p className="text-sm text-gray-600">{invoice.clientInfo.address}</p>
          <p className="text-sm text-gray-600">{invoice.clientInfo.email}</p>
          <p className="text-sm text-gray-600">{invoice.clientInfo.phone}</p>
        </div>
        <div className="text-right">
          <div className="mb-2">
            <span className="text-sm font-semibold text-gray-700">Invoice Date: </span>
            <span className="text-sm text-gray-900">{formatDate(invoice.invoiceDate)}</span>
          </div>
          <div className="mb-2">
            <span className="text-sm font-semibold text-gray-700">Due Date: </span>
            <span className="text-sm text-gray-900">{formatDate(invoice.dueDate)}</span>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-700">Payment Terms: </span>
            <span className="text-sm text-gray-900">{invoice.paymentTerms}</span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="bg-[#1e3a8a] text-white">
            <th className="text-left py-3 px-4 text-sm font-semibold">Item</th>
            <th className="text-center py-3 px-4 text-sm font-semibold">Qty</th>
            <th className="text-right py-3 px-4 text-sm font-semibold">Price</th>
            <th className="text-right py-3 px-4 text-sm font-semibold">Discount</th>
            <th className="text-right py-3 px-4 text-sm font-semibold">Tax</th>
            <th className="text-right py-3 px-4 text-sm font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
              <td className="py-3 px-4">
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-600">{item.description}</p>
              </td>
              <td className="text-center py-3 px-4 text-sm text-gray-900">{item.quantity}</td>
              <td className="text-right py-3 px-4 text-sm text-gray-900">
                {formatCurrency(item.unitPrice, currencySymbol)}
              </td>
              <td className="text-right py-3 px-4 text-sm text-gray-900">{item.discount}%</td>
              <td className="text-right py-3 px-4 text-sm text-gray-900">{item.tax}%</td>
              <td className="text-right py-3 px-4 text-sm font-semibold text-gray-900">
                {formatCurrency(item.lineTotal, currencySymbol)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="flex justify-end mb-8">
        <div className="w-80">
          <div className="flex justify-between py-2 border-b">
            <span className="text-sm text-gray-700">Subtotal:</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(invoice.summary.subtotal, currencySymbol)}
            </span>
          </div>
          {invoice.summary.totalDiscount > 0 && (
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-gray-700">Discount:</span>
              <span className="text-sm font-semibold text-red-600">
                -{formatCurrency(invoice.summary.totalDiscount, currencySymbol)}
              </span>
            </div>
          )}
          {invoice.summary.totalTax > 0 && (
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-gray-700">Tax:</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(invoice.summary.totalTax, currencySymbol)}
              </span>
            </div>
          )}
          {invoice.summary.bankCharges > 0 && (
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-gray-700">Bank Charges:</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(invoice.summary.bankCharges, currencySymbol)}
              </span>
            </div>
          )}
          {invoice.summary.vat > 0 && (
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-gray-700">VAT (7.5%):</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(invoice.summary.vat, currencySymbol)}
              </span>
            </div>
          )}
          <div className="flex justify-between py-3 bg-[#1e3a8a] text-white px-4 rounded-lg mt-2">
            <span className="font-bold">TOTAL:</span>
            <span className="font-bold text-lg">
              {formatCurrency(invoice.summary.total, currencySymbol)}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-2 italic">
            Amount in words: {invoice.summary.amountInWords}
          </p>
        </div>
      </div>

      {/* Payment Info */}
      {invoice.paymentInfo.bankName && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">PAYMENT DETAILS</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Bank Name:</p>
              <p className="font-semibold text-gray-900">{invoice.paymentInfo.bankName}</p>
            </div>
            <div>
              <p className="text-gray-600">Account Name:</p>
              <p className="font-semibold text-gray-900">{invoice.paymentInfo.accountName}</p>
            </div>
            <div>
              <p className="text-gray-600">Account Number:</p>
              <p className="font-semibold text-gray-900">{invoice.paymentInfo.accountNumber}</p>
            </div>
          </div>
          {invoice.paymentInfo.instructions && (
            <p className="text-xs text-gray-600 mt-3">{invoice.paymentInfo.instructions}</p>
          )}
        </div>
      )}

      {/* Notes & Terms */}
      {(invoice.notes || invoice.terms) && (
        <div className="mb-8">
          {invoice.notes && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">NOTES</h3>
              <p className="text-sm text-gray-600">{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">TERMS & CONDITIONS</h3>
              <p className="text-sm text-gray-600">{invoice.terms}</p>
            </div>
          )}
        </div>
      )}

      {/* Signature */}
      {invoice.signature && (
        <div className="mt-8">
          <img src={invoice.signature} alt="Signature" className="h-16 mb-2" />
          <div className="border-t border-gray-300 w-48 pt-2">
            <p className="text-sm text-gray-700">Authorized Signature</p>
          </div>
        </div>
      )}
    </div>
  );
}
