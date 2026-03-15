import { Quotation, QUOTATION_STATUSES } from '../../types/quotation';
import { CURRENCIES } from '../../types/invoice';
import { formatCurrency, formatDate } from '../../utils/invoiceUtils';

interface QuotationPreviewProps {
  quotation: Quotation;
  showWatermark?: boolean;
  id?: string;
}

export function QuotationPreview({ quotation, showWatermark, id = 'quotation-preview' }: QuotationPreviewProps) {
  const currency = CURRENCIES.find(c => c.code === quotation.currency);
  const currencySymbol = currency?.symbol || '$';
  const status = QUOTATION_STATUSES.find(s => s.value === quotation.status);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto relative overflow-hidden" id={id}>
      {showWatermark && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10 rotate-[-35deg] opacity-10 select-none">
          <span className="text-[80px] font-black text-gray-800 whitespace-nowrap tracking-widest">MYBIZTOOLS FREE</span>
        </div>
      )}
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          {quotation.businessInfo.logo && (
            <img src={quotation.businessInfo.logo} alt="Logo" className="h-16 mb-4" />
          )}
          <h2 className="text-2xl font-bold text-[#1e3a8a]">{quotation.businessInfo.name}</h2>
          <p className="text-sm text-gray-600 mt-1">{quotation.businessInfo.address}</p>
          <p className="text-sm text-gray-600">{quotation.businessInfo.phone}</p>
          <p className="text-sm text-gray-600">{quotation.businessInfo.email}</p>
          {quotation.businessInfo.website && (
            <p className="text-sm text-[#FF8A2B]">{quotation.businessInfo.website}</p>
          )}
          {quotation.businessInfo.taxId && (
            <p className="text-sm text-gray-600">Tax ID: {quotation.businessInfo.taxId}</p>
          )}
        </div>
        <div className="text-right">
          <h1 className="text-4xl font-bold text-[#1e3a8a] mb-2">QUOTATION</h1>
          <p className="text-sm text-gray-600">#{quotation.quotationNumber}</p>
          {status && (
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-${status.color}-100 text-${status.color}-700`}>
              {status.label}
            </span>
          )}
        </div>
      </div>

      {/* Quotation Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">QUOTATION FOR:</h3>
          <p className="font-semibold text-gray-900">{quotation.clientInfo.name}</p>
          {quotation.clientInfo.companyName && (
            <p className="text-sm text-gray-600">{quotation.clientInfo.companyName}</p>
          )}
          <p className="text-sm text-gray-600">{quotation.clientInfo.address}</p>
          <p className="text-sm text-gray-600">{quotation.clientInfo.email}</p>
          <p className="text-sm text-gray-600">{quotation.clientInfo.phone}</p>
        </div>
        <div className="text-right">
          <div className="mb-2">
            <span className="text-sm font-semibold text-gray-700">Issue Date: </span>
            <span className="text-sm text-gray-900">{formatDate(quotation.issueDate)}</span>
          </div>
          <div className="mb-2">
            <span className="text-sm font-semibold text-gray-700">Valid Until: </span>
            <span className="text-sm text-gray-900">{formatDate(quotation.validUntil)}</span>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-700">Currency: </span>
            <span className="text-sm text-gray-900">{quotation.currency}</span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="bg-[#1e3a8a] text-white">
            <th className="text-left py-3 px-4 text-sm font-semibold">Item</th>
            <th className="text-center py-3 px-4 text-sm font-semibold">Qty</th>
            <th className="text-right py-3 px-4 text-sm font-semibold">Unit Price</th>
            <th className="text-right py-3 px-4 text-sm font-semibold">VAT %</th>
            <th className="text-right py-3 px-4 text-sm font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {quotation.items.map((item, index) => (
            <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
              <td className="py-3 px-4">
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-600">{item.description}</p>
              </td>
              <td className="text-center py-3 px-4 text-sm text-gray-900">{item.quantity}</td>
              <td className="text-right py-3 px-4 text-sm text-gray-900">
                {formatCurrency(item.unitPrice, currencySymbol)}
              </td>
              <td className="text-right py-3 px-4 text-sm text-gray-900">{item.vat}%</td>
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
              {formatCurrency(quotation.summary.subtotal, currencySymbol)}
            </span>
          </div>
          {quotation.summary.totalVat > 0 && (
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-gray-700">VAT:</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(quotation.summary.totalVat, currencySymbol)}
              </span>
            </div>
          )}
          {quotation.summary.discount > 0 && (
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-gray-700">
                Discount {quotation.summary.discountType === 'percentage' ? '(%)' : ''}:
              </span>
              <span className="text-sm font-semibold text-red-600">
                -{formatCurrency(quotation.summary.discount, currencySymbol)}
              </span>
            </div>
          )}
          <div className="flex justify-between py-3 bg-[#1e3a8a] text-white px-4 rounded-lg mt-2">
            <span className="font-bold">TOTAL:</span>
            <span className="font-bold text-lg">
              {formatCurrency(quotation.summary.total, currencySymbol)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Instructions */}
      {quotation.paymentInstructions && (
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">PAYMENT INSTRUCTIONS</h3>
          <p className="text-sm text-gray-700 whitespace-pre-line">{quotation.paymentInstructions}</p>
        </div>
      )}

      {/* Notes & Terms */}
      {(quotation.notes || quotation.terms) && (
        <div className="mb-8">
          {quotation.notes && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">NOTES</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">{quotation.notes}</p>
            </div>
          )}
          {quotation.terms && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">TERMS & CONDITIONS</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">{quotation.terms}</p>
            </div>
          )}
        </div>
      )}

      {/* Validity Notice */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">
          This quotation is valid until {formatDate(quotation.validUntil)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Thank you for your business!
        </p>
      </div>
    </div>
  );
}
