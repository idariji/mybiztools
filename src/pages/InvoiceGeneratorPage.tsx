import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Printer, Save, Send, Sparkles, ArrowLeft } from 'lucide-react';
import { InvoiceForm } from '../components/invoice/InvoiceForm';
import { InvoicePreview } from '../components/invoice/InvoicePreview';
import { DEDAInvoiceModal } from '../components/invoice/DEDAInvoiceModal';
import { SendInvoiceModal } from '../components/invoice/SendInvoiceModal';
import { Invoice } from '../types/invoice';
import { generateInvoiceNumber, numberToWords } from '../utils/invoiceUtils';
import { sendInvoiceEmail, sendInvoiceWhatsApp } from '../services/emailService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '../utils/useToast';
import { ToastContainer } from '../components/ui/Toast';
import { authService } from '../services/authService';
import { hasWatermark } from '../utils/planUtils';
import { safeGetJSON } from '../utils/storage';
import { InvoiceSyncService } from '../services/documentSyncService';
import { MobileBottomNav } from '../layout/MobileBottomNav';

export function InvoiceGeneratorPage() {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  
  // Get user data for pre-filling
  const user = authService.getCurrentUser();
  const showWatermark = hasWatermark(user?.current_plan);
  
  // Check if editing existing invoice
  const initialInvoice = safeGetJSON<Invoice | null>('current-invoice', null);
  
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice || {
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: 'NGN',
    paymentTerms: 'Net 30',
    businessInfo: {
      name: user?.businessName || '',
      address: user?.address || '',
      phone: user?.phone || '',
      email: user?.email || '',
      website: user?.website || '',
    },
    clientInfo: {
      name: '',
      address: '',
      email: '',
      phone: '',
    },
    items: [],
    summary: {
      subtotal: 0,
      totalDiscount: 0,
      totalTax: 0,
      bankCharges: 0,
      vatEnabled: true,
      vat: 0,
      total: 0,
      amountInWords: '',
    },
    paymentInfo: {
      bankName: '',
      accountName: '',
      accountNumber: '',
      instructions: '',
    },
    notes: '',
    terms: '',
    status: 'draft',
  });

  const [showPreview, setShowPreview] = useState(false);
  const [showDEDAModal, setShowDEDAModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);

  // Clear current invoice on mount
  useEffect(() => {
    return () => {
      localStorage.removeItem('current-invoice');
    };
  }, []);

  // Calculate summary whenever items or bank charges change
  useEffect(() => {
    const subtotal = invoice.items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      return sum + itemSubtotal;
    }, 0);

    const totalDiscount = invoice.items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const discountAmount = (itemSubtotal * item.discount) / 100;
      return sum + discountAmount;
    }, 0);

    const totalTax = invoice.items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const discountAmount = (itemSubtotal * item.discount) / 100;
      const afterDiscount = itemSubtotal - discountAmount;
      const taxAmount = (afterDiscount * item.tax) / 100;
      return sum + taxAmount;
    }, 0);

    const subtotalWithCharges = subtotal - totalDiscount + totalTax + invoice.summary.bankCharges;
    const vat = (invoice.summary.vatEnabled ?? true) ? subtotalWithCharges * 0.075 : 0;
    const total = subtotalWithCharges + vat;
    const amountInWords = numberToWords(total, invoice.currency);

    setInvoice(prev => ({
      ...prev,
      summary: {
        ...prev.summary,
        subtotal,
        totalDiscount,
        totalTax,
        vat,
        total,
        amountInWords,
      },
    }));
  }, [invoice.items, invoice.summary.bankCharges]);

  const generatePDFBlob = async (): Promise<Blob | null> => {
    // Use the dedicated off-screen capture element (always visible, no clipping)
    const element = document.getElementById('invoice-capture');
    if (!element) return null;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      // Multi-page support
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      return pdf.output('blob');
    } catch (error) {
      return null;
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const blob = await generatePDFBlob();
      if (!blob) {
        addToast('Failed to generate PDF', 'error');
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoice.invoiceNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      
      addToast('Invoice downloaded successfully!', 'success');
    } catch (error) {
      addToast('Failed to download PDF', 'error');
    }
  };

  const handlePrint = () => {
    if (!validateInvoice()) return;
    window.print();
    addToast('Opening print dialog...', 'info');
  };

  const handleSaveDraft = async () => {
    if (!invoice.businessInfo.name || !invoice.clientInfo.name) {
      addToast('Please fill in business and client names to save draft', 'warning');
      return;
    }

    await InvoiceSyncService.save({ ...invoice, status: 'draft', updatedAt: new Date().toISOString() });
    addToast('Invoice saved as draft!', 'success');
  };

  const handleSendInvoice = () => {
    if (!validateInvoice()) return;
    
    if (!invoice.clientInfo.email && !invoice.clientInfo.phone) {
      addToast('Client email or phone is required to send invoice', 'error');
      return;
    }
    
    setShowSendModal(true);
  };
  
  const handleSendComplete = async (method: 'email' | 'whatsapp', message: string) => {
    try {
      if (method === 'email') {
        const pdfBlob = await generatePDFBlob();
        if (!pdfBlob) {
          addToast('Failed to generate PDF', 'error');
          return;
        }
        
        await sendInvoiceEmail(invoice, message, pdfBlob);
        addToast(`Invoice sent to ${invoice.clientInfo.email}`, 'success');
      } else {
        sendInvoiceWhatsApp(invoice, message);
        addToast('Opening WhatsApp...', 'success');
      }
    } catch (error) {
      addToast('Failed to send invoice. Please try again.', 'error');
    }
  };
  
  const handleGenerateWithDEDA = () => {
    setShowDEDAModal(true);
  };
  
  const handleDEDAGenerate = (generatedData: Partial<Invoice>) => {
    setInvoice(prev => ({
      ...prev,
      ...generatedData,
      clientInfo: {
        ...prev.clientInfo,
        ...generatedData.clientInfo
      },
      items: generatedData.items || prev.items,
      summary: {
        ...prev.summary,
        ...generatedData.summary
      }
    }));
    addToast('Invoice generated from your description!', 'success');
  };

  const validateInvoice = (): boolean => {
    if (!invoice.businessInfo.name || !invoice.businessInfo.email || !invoice.businessInfo.phone || !invoice.businessInfo.address) {
      addToast('Please fill in all business information', 'error');
      return false;
    }
    if (!invoice.clientInfo.name || !invoice.clientInfo.email || !invoice.clientInfo.phone || !invoice.clientInfo.address) {
      addToast('Please fill in all client information', 'error');
      return false;
    }
    if (invoice.items.length === 0) {
      addToast('Please add at least one item', 'error');
      return false;
    }
    if (invoice.items.some(item => !item.name || item.quantity <= 0 || item.unitPrice <= 0)) {
      addToast('Please complete all item details', 'error');
      return false;
    }
    return true;
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="min-h-screen bg-[#F0F3F5]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={() => navigate('/dashboard/invoices')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              title="Back to Invoices"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Create Invoice</h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Invoice #{invoice.invoiceNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={handleGenerateWithDEDA}
              className="flex items-center justify-center gap-1 p-2 sm:px-3 sm:py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all text-xs sm:text-sm font-medium"
              title="Generate with DEDA"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Generate with DEDA</span>
            </button>

            <button
              onClick={handleSaveDraft}
              className="flex items-center justify-center gap-1 p-2 sm:px-3 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium"
              title="Save Draft"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Save</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1 p-2 sm:px-3 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium"
              title="Print"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={() => {
                if (validateInvoice()) {
                  handleDownloadPDF();
                }
              }}
              className="flex items-center justify-center gap-1 p-2 sm:px-3 sm:py-2 bg-[#1e3a8a] text-white rounded-lg hover:bg-[#1e40af] transition-colors text-xs sm:text-sm font-medium"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>

            <button
              onClick={handleSendInvoice}
              className="flex items-center justify-center gap-1 p-2 sm:px-3 sm:py-2 bg-[#FF8A2B] text-white rounded-lg hover:bg-[#FF6B00] transition-colors text-xs sm:text-sm font-medium"
              title="Send Invoice"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Toggle */}
      <div className="lg:hidden px-3 sm:px-6 py-3 sm:py-4 bg-white border-b">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="w-full px-4 py-2 bg-[#1e3a8a] text-white rounded-lg font-medium text-sm"
        >
          {showPreview ? 'Edit Invoice' : 'Preview Invoice'}
        </button>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 p-3 sm:p-6 pb-24 lg:pb-6">
        {/* Left: Form */}
        <div className={`${showPreview ? 'hidden lg:block' : 'block'}`}>
          <InvoiceForm invoice={invoice} onChange={setInvoice} />
        </div>

        {/* Right: Preview */}
        <div className={`${showPreview ? 'block' : 'hidden lg:block'}`}>
          <div className="sticky top-24">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Live Preview</h2>
              <p className="text-sm text-gray-600">This is how your invoice will look</p>
            </div>
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
              <InvoicePreview invoice={invoice} showWatermark={showWatermark} />
            </div>
          </div>
        </div>
      </div>

      {/* Off-screen capture div — always rendered, used for PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '794px', zIndex: -1 }}>
        <InvoicePreview id="invoice-capture" invoice={invoice} showWatermark={showWatermark} />
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #invoice-preview {
            display: block !important;
            position: fixed !important;
            top: 0 !important; left: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            z-index: 9999 !important;
          }
          #invoice-capture { display: none !important; }
        }
      `}</style>
    </div>
    
    <DEDAInvoiceModal
      isOpen={showDEDAModal}
      onClose={() => setShowDEDAModal(false)}
      onGenerate={handleDEDAGenerate}
    />
    
    <SendInvoiceModal
      isOpen={showSendModal}
      onClose={() => setShowSendModal(false)}
      invoice={invoice}
      onSend={handleSendComplete}
    />
    <MobileBottomNav />
    </>
  );
}
