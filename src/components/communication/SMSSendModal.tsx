/**
 * SMS Send Modal Example
 * Practical component for sending SMS from invoice/receipt pages
 */

import React, { useState } from 'react';
import { useTermii } from '../../hooks/useTermii';
import { formatPhoneNumber } from '../../utils/communicationUtils';
import { X, Send, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export interface SMSSendModalProps {
  isOpen: boolean;
  phoneNumber: string;
  documentType: 'invoice' | 'receipt' | 'quotation' | 'payslip';
  documentNumber: string;
  clientName: string;
  onClose: () => void;
  onSuccess?: () => void;
  customMessage?: string;
}

export const SMSSendModal: React.FC<SMSSendModalProps> = ({
  isOpen,
  phoneNumber,
  documentType,
  documentNumber,
  clientName,
  onClose,
  onSuccess,
  customMessage,
}) => {
  const [messageText, setMessageText] = useState(
    customMessage ||
      `Hello ${clientName}, your ${documentType} #${documentNumber} is ready. Please find attached or reply for more details. - MyBizTools`
  );
  const [channel, setChannel] = useState<'generic' | 'whatsapp'>('generic');
  const [characterCount, setCharacterCount] = useState(messageText.length);

  const { send, loading, error, success, validate, clearError } = useTermii({
    onSuccess: () => {
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    },
  });

  const handleMessageChange = (newMessage: string) => {
    setMessageText(newMessage);
    setCharacterCount(newMessage.length);
  };

  const handleSend = async () => {
    clearError();

    // Validate phone number
    const validation = await validate(phoneNumber);
    if (!validation.isValid) {
      return;
    }

    // Send SMS
    await send(phoneNumber, messageText, channel);
  };

  if (!isOpen) return null;

  const formattedPhone = formatPhoneNumber(phoneNumber);
  const segmentCount = Math.ceil(characterCount / 160);
  const estimatedCost = segmentCount * 2.5; // Approximate cost in NGN

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Send {channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-500 rounded transition"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Recipient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient
            </label>
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <p className="font-semibold text-gray-900">{clientName}</p>
              <p className="text-sm text-gray-600">{formattedPhone}</p>
            </div>
          </div>

          {/* Channel Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Channel
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setChannel('generic')}
                className={`flex-1 py-2 px-3 rounded border-2 font-medium transition ${
                  channel === 'generic'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
                disabled={loading}
              >
                SMS
              </button>
              <button
                type="button"
                onClick={() => setChannel('whatsapp')}
                className={`flex-1 py-2 px-3 rounded border-2 font-medium transition ${
                  channel === 'whatsapp'
                    ? 'border-green-600 bg-green-50 text-green-600'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
                disabled={loading}
              >
                WhatsApp
              </button>
            </div>
          </div>

          {/* Message */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <span className="text-xs text-gray-500">
                {characterCount} / 160 chars
              </span>
            </div>
            <textarea
              value={messageText}
              onChange={(e) => handleMessageChange(e.target.value)}
              placeholder="Enter your message..."
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              disabled={loading}
              maxLength={480}
            />
            {characterCount > 160 && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠ Message will be sent in {segmentCount} parts
              </p>
            )}
          </div>

          {/* Estimated Cost */}
          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Estimated Cost:</span> ₦{estimatedCost.toFixed(2)}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {segmentCount} SMS segment(s) @ ₦{(2.5).toFixed(2)}/segment
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 flex gap-2">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-xs text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded p-3 flex gap-2">
              <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">Success!</p>
                <p className="text-xs text-green-700">Message sent successfully</p>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="bg-gray-50 p-3 rounded text-xs text-gray-600 space-y-1">
            <p>✓ Message will be sent from sender ID: <span className="font-medium">MyBizTools</span></p>
            <p>✓ Delivery confirmation will be provided</p>
            <p>✓ Check account balance if delivery fails</p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-100 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={loading || !messageText.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={18} />
                Send {channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SMSSendModal;

/**
 * Example Usage in Invoice Page:
 * 
 * import { useState } from 'react';
 * import SMSSendModal from '../components/SMSSendModal';
 * 
 * export default function InvoicePage() {
 *   const [showSMSModal, setShowSMSModal] = useState(false);
 *   const [invoice, setInvoice] = useState({...});
 * 
 *   return (
 *     <div>
 *       <button onClick={() => setShowSMSModal(true)}>
 *         Send via SMS
 *       </button>
 * 
 *       <SMSSendModal
 *         isOpen={showSMSModal}
 *         phoneNumber={invoice.clientInfo.phone}
 *         documentType="invoice"
 *         documentNumber={invoice.invoiceNumber}
 *         clientName={invoice.clientInfo.name}
 *         onClose={() => setShowSMSModal(false)}
 *         onSuccess={() => toast.success('SMS sent!')}
 *       />
 *     </div>
 *   );
 * }
 */
