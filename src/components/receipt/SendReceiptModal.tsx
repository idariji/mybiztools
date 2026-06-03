import { useState, useEffect, useRef } from 'react';
import { X, Send, Mail, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { Receipt } from '../../types/receipt';

interface SendReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: Receipt;
  onSend: (method: 'email' | 'whatsapp', message: string) => Promise<boolean>;
}

export function SendReceiptModal({ isOpen, onClose, receipt, onSend }: SendReceiptModalProps) {
  const [method, setMethod] = useState<'email' | 'whatsapp'>('email');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState('');
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      setIsSending(false);
      setSent(false);
      setSendError('');
      setCustomMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const defaultEmailMessage = `Dear ${receipt.customerInfo.name},

Please find attached Receipt #${receipt.receiptNumber} for your records.

Receipt Details:
- Amount Paid: ${receipt.summary.total.toLocaleString()} ${receipt.currency}
- Date: ${new Date(receipt.receiptDate).toLocaleDateString()}
- Payment Method: ${receipt.paymentMethod}

Thank you for your business!

Best regards,
${receipt.businessInfo.name}`;

  const defaultWhatsAppMessage = `Hi ${receipt.customerInfo.name}!

Receipt #${receipt.receiptNumber}
Amount: ${receipt.summary.total.toLocaleString()} ${receipt.currency}
Date: ${new Date(receipt.receiptDate).toLocaleDateString()}
Payment: ${receipt.paymentMethod}

Thank you for your payment! 🙏`;

  const handleSend = async () => {
    setSendError('');
    setIsSending(true);
    const message = customMessage || (method === 'email' ? defaultEmailMessage : defaultWhatsAppMessage);
    const sendMethod = method;

    const success = await onSend(sendMethod, message);

    if (success) {
      setIsSending(false);
      setSent(true);
      closeTimerRef.current = setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setIsSending(false);
      setSendError(
        method === 'email'
          ? 'Failed to send email. Please check the address and try again.'
          : 'Failed to open WhatsApp. Please try again.'
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Send Receipt</h2>
            <p className="text-sm text-gray-600">Receipt #{receipt.receiptNumber}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSending}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Success state */}
        {sent ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-9 h-9 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-slate-800">
              {method === 'email' ? 'Receipt sent successfully!' : 'WhatsApp opened!'}
            </p>
            <p className="text-sm text-slate-400">This window will close automatically…</p>
          </div>
        ) : (
          <>
            {sendError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {sendError}
              </div>
            )}

            {/* Method Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Send via</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMethod('email')}
                  disabled={isSending}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all disabled:opacity-50 ${
                    method === 'email' ? 'border-[#FF8A2B] bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Mail className={`w-5 h-5 ${method === 'email' ? 'text-[#FF8A2B]' : 'text-gray-600'}`} />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Email</p>
                    <p className="text-xs text-gray-600">{receipt.customerInfo.email || 'No email provided'}</p>
                  </div>
                </button>

                <button
                  onClick={() => setMethod('whatsapp')}
                  disabled={isSending}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all disabled:opacity-50 ${
                    method === 'whatsapp' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <MessageSquare className={`w-5 h-5 ${method === 'whatsapp' ? 'text-green-600' : 'text-gray-600'}`} />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">WhatsApp</p>
                    <p className="text-xs text-gray-600">{receipt.customerInfo.phone || 'No phone provided'}</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Message */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message {method === 'email' ? '(Email Body)' : '(WhatsApp Text)'}
              </label>
              <textarea
                value={customMessage || (method === 'email' ? defaultEmailMessage : defaultWhatsAppMessage)}
                onChange={(e) => setCustomMessage(e.target.value)}
                disabled={isSending}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent resize-none disabled:opacity-50"
                rows={12}
              />
              <p className="text-xs text-gray-500 mt-2">
                {method === 'email'
                  ? 'Receipt PDF will be attached automatically'
                  : 'Receipt details will be included in the message'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isSending}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={isSending}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#FF8A2B] text-white rounded-xl font-semibold hover:bg-[#FF6B00] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send {method === 'email' ? 'Email' : 'WhatsApp'}
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
