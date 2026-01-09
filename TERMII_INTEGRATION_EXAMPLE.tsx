/**
 * EXAMPLE: Integration Guide for Invoice Page
 * Shows how to add SMS sending functionality to existing pages
 * 
 * This is a reference implementation - adapt to your actual InvoiceGeneratorPage
 */

import React, { useState } from 'react';
import { Invoice } from '../types/invoice';
import SMSSendModal from '../components/communication/SMSSendModal';
import { sendInvoiceViaSMS } from '../services/termiiService';
import { MessageCircle, Send } from 'lucide-react';

interface InvoiceGeneratorPageExampleProps {
  // Your existing props
}

export const InvoiceGeneratorPageExample: React.FC<InvoiceGeneratorPageExampleProps> = () => {
  // Your existing state
  const [invoice, setInvoice] = useState<Invoice>({
    invoiceNumber: 'INV-001',
    clientInfo: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+234801234567',
      address: '123 Main St',
    },
    businessInfo: {
      name: 'My Business',
      email: 'business@example.com',
      phone: '+234801234567',
      address: '456 Business Ave',
    },
    items: [],
    summary: {
      subtotal: 50000,
      tax: 5000,
      total: 55000,
      balance: 0,
    },
    issueDate: new Date().toISOString(),
    dueDate: new Date().toISOString(),
    notes: '',
  } as Invoice);

  // SMS Modal state
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [smsSending, setSmsSending] = useState(false);

  // ============================================
  // SMS-RELATED HANDLERS
  // ============================================

  /**
   * Quick send invoice via SMS without modal
   * (shows loading + result inline)
   */
  const handleQuickSendSMS = async () => {
    setSmsSending(true);
    try {
      const response = await sendInvoiceViaSMS(
        invoice.clientInfo.phone,
        invoice.invoiceNumber,
        invoice.clientInfo.name,
        invoice.summary.total,
        window.location.href // Optional: link to invoice
      );

      if (response.code === '01') {
        alert(`✅ SMS sent successfully!\nMessage ID: ${response.message_id}\nRemaining Balance: ${response.balance}`);
      } else {
        alert(`❌ SMS failed: ${response.message}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setSmsSending(false);
    }
  };

  /**
   * Open modal for custom SMS (more control)
   */
  const handleOpenSMSModal = () => {
    if (!invoice.clientInfo.phone) {
      alert('Please add a phone number to the client info first.');
      return;
    }
    setShowSMSModal(true);
  };

  // ============================================
  // EXISTING HANDLERS (Your current code)
  // ============================================

  const handleExportPDF = async () => {
    // Your existing PDF export code
    console.log('Exporting PDF...');
  };

  const handleSaveInvoice = () => {
    // Your existing save code
    console.log('Saving invoice...');
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Invoice Generator</h1>
          <p className="text-gray-600 mt-1">Create and send invoices to your clients</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left: Form (Your existing content) */}
          <div className="col-span-2 space-y-6">
            {/* Invoice Form Fields - Your existing code */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Client Information</h2>
              <input
                type="text"
                placeholder="Client Name"
                value={invoice.clientInfo.name}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    clientInfo: {
                      ...invoice.clientInfo,
                      name: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border rounded mb-3"
              />
              <input
                type="email"
                placeholder="Client Email"
                value={invoice.clientInfo.email}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    clientInfo: {
                      ...invoice.clientInfo,
                      email: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border rounded mb-3"
              />
              <input
                type="tel"
                placeholder="Client Phone (+234...)"
                value={invoice.clientInfo.phone}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    clientInfo: {
                      ...invoice.clientInfo,
                      phone: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border rounded"
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: Include phone number to send invoice via SMS
              </p>
            </div>

            {/* More form fields... */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Invoice Items</h2>
              {/* Your existing invoice items form */}
              <p className="text-gray-600">Add your invoice items here...</p>
            </div>
          </div>

          {/* Right: Actions Sidebar */}
          <div className="space-y-4">
            {/* Preview Card */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div id="invoice-preview" className="p-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {invoice.businessInfo.name}
                  </h3>
                  <p className="text-gray-600">{invoice.businessInfo.email}</p>
                  <p className="text-gray-600">{invoice.businessInfo.phone}</p>
                </div>

                <div className="border-t border-b border-gray-200 py-4 my-4">
                  <p className="text-sm font-semibold text-gray-600">Invoice No.</p>
                  <p className="text-xl font-bold">{invoice.invoiceNumber}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₦{invoice.summary.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">₦{invoice.summary.tax}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-lg">₦{invoice.summary.total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* EXISTING BUTTONS */}
              <button
                onClick={handleSaveInvoice}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Save Invoice
              </button>

              <button
                onClick={handleExportPDF}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                📥 Export as PDF
              </button>

              {/* ===== NEW: SMS SENDING BUTTONS ===== */}

              {/* Option 1: Modal-based SMS (Recommended for custom messages) */}
              <button
                onClick={handleOpenSMSModal}
                disabled={!invoice.clientInfo.phone}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                title={
                  !invoice.clientInfo.phone ? 'Add client phone number first' : ''
                }
              >
                <MessageCircle size={18} />
                📱 Send via SMS
              </button>

              {/* Option 2: Quick SMS (Fast, inline) */}
              <button
                onClick={handleQuickSendSMS}
                disabled={!invoice.clientInfo.phone || smsSending}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                title={
                  !invoice.clientInfo.phone ? 'Add client phone number first' : ''
                }
              >
                <Send size={18} />
                {smsSending ? 'Sending...' : '💬 Quick Send SMS'}
              </button>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                <p className="font-semibold mb-1">📞 SMS Features:</p>
                <ul className="space-y-1 text-blue-600">
                  <li>✓ Send invoice notification</li>
                  <li>✓ Client receives message instantly</li>
                  <li>✓ Pay-per-SMS billing</li>
                  <li>✓ Track message status</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SMS MODAL COMPONENT ===== */}
      {/* Place at bottom so it renders above all content */}
      <SMSSendModal
        isOpen={showSMSModal}
        phoneNumber={invoice.clientInfo.phone}
        documentType="invoice"
        documentNumber={invoice.invoiceNumber}
        clientName={invoice.clientInfo.name}
        onClose={() => setShowSMSModal(false)}
        onSuccess={() => {
          // Optional: Do something after SMS sent
          console.log('Invoice SMS sent successfully');
        }}
        customMessage={`Hello ${invoice.clientInfo.name}, your invoice #${invoice.invoiceNumber} for ₦${invoice.summary.total} is ready. Please settle at your earliest convenience. Thank you.`}
      />
    </div>
  );
};

// ============================================
// MINIMAL INTEGRATION (Copy-paste friendly)
// ============================================

/**
 * Add this to your existing InvoiceGeneratorPage:
 * 
 * 1. Import at top:
 *    import SMSSendModal from '../components/communication/SMSSendModal';
 *    import { sendInvoiceViaSMS } from '../services/termiiService';
 * 
 * 2. Add state in component:
 *    const [showSMSModal, setShowSMSModal] = useState(false);
 * 
 * 3. Add button in your action area:
 *    <button
 *      onClick={() => setShowSMSModal(true)}
 *      disabled={!invoice.clientInfo.phone}
 *      className="px-4 py-2 bg-purple-600 text-white rounded"
 *    >
 *      📱 Send via SMS
 *    </button>
 * 
 * 4. Add modal at bottom:
 *    <SMSSendModal
 *      isOpen={showSMSModal}
 *      phoneNumber={invoice.clientInfo.phone}
 *      documentType="invoice"
 *      documentNumber={invoice.invoiceNumber}
 *      clientName={invoice.clientInfo.name}
 *      onClose={() => setShowSMSModal(false)}
 *    />
 */

// ============================================
// ADVANCED: React Hook Pattern
// ============================================

/**
 * Use useTermii hook directly in component:
 * 
 * import { useTermii } from '../hooks/useTermii';
 * 
 * function MyComponent() {
 *   const { send, loading, error, success } = useTermii({
 *     onSuccess: () => toast.success('SMS sent!'),
 *     onError: (err) => toast.error(err),
 *   });
 * 
 *   return (
 *     <button
 *       onClick={() => send(phone, message)}
 *       disabled={loading}
 *     >
 *       {loading ? 'Sending...' : 'Send'}
 *     </button>
 *   );
 * }
 */

export default InvoiceGeneratorPageExample;
