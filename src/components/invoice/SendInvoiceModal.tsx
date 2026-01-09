import React, { useState } from 'react';
import { X, Send, Mail, MessageSquare } from 'lucide-react';
import { Invoice } from '../../types/invoice';

interface SendInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onSend: (method: 'email' | 'whatsapp', message: string) => void;
}

export function SendInvoiceModal({ isOpen, onClose, invoice, onSend }: SendInvoiceModalProps) {
  const [method, setMethod] = useState<'email' | 'whatsapp'>('email');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const defaultEmailMessage = `Dear ${invoice.clientInfo.name},

Please find attached invoice #${invoice.invoiceNumber} for your review.

Invoice Details:
- Amount: ${invoice.summary.total.toLocaleString()}
- Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}

Payment can be made to:
Bank: ${invoice.paymentInfo.bankName}
Account: ${invoice.paymentInfo.accountNumber}
Account Name: ${invoice.paymentInfo.accountName}

Thank you for your business!

Best regards,
${invoice.businessInfo.name}`;

  const defaultWhatsAppMessage = `Hi ${invoice.clientInfo.name}! 

Invoice #${invoice.invoiceNumber}
Amount: ${invoice.summary.total.toLocaleString()}
Due: ${new Date(invoice.dueDate).toLocaleDateString()}

Payment Details:
${invoice.paymentInfo.bankName}
${invoice.paymentInfo.accountNumber}
${invoice.paymentInfo.accountName}

Thank you! 🙏`;

  const handleSend = () => {
    setIsSending(true);
    const message = customMessage || (method === 'email' ? defaultEmailMessage : defaultWhatsAppMessage);
    
    setTimeout(() => {
      onSend(method, message);
      setIsSending(false);
      setCustomMessage('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Send Invoice</h2>
            <p className="text-sm text-gray-600">Invoice #{invoice.invoiceNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Method Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Send via</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setMethod('email')}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                method === 'email'
                  ? 'border-[#FF8A2B] bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Mail className={`w-5 h-5 ${method === 'email' ? 'text-[#FF8A2B]' : 'text-gray-600'}`} />
              <div className="text-left">
                <p className="font-semibold text-gray-900">Email</p>
                <p className="text-xs text-gray-600">{invoice.clientInfo.email}</p>
              </div>
            </button>

            <button
              onClick={() => setMethod('whatsapp')}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                method === 'whatsapp'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <MessageSquare className={`w-5 h-5 ${method === 'whatsapp' ? 'text-green-600' : 'text-gray-600'}`} />
              <div className="text-left">
                <p className="font-semibold text-gray-900">WhatsApp</p>
                <p className="text-xs text-gray-600">{invoice.clientInfo.phone}</p>
              </div>
            </button>
          </div>
        </div>

        {/* Message Preview */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message {method === 'email' ? '(Email Body)' : '(WhatsApp Text)'}
          </label>
          <textarea
            value={customMessage || (method === 'email' ? defaultEmailMessage : defaultWhatsAppMessage)}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent resize-none"
            rows={12}
          />
          <p className="text-xs text-gray-500 mt-2">
            {method === 'email' 
              ? 'Invoice PDF will be attached automatically'
              : 'Invoice link will be included in the message'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isSending}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#FF8A2B] text-white rounded-xl font-semibold hover:bg-[#FF6B00] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send {method === 'email' ? 'Email' : 'WhatsApp'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
