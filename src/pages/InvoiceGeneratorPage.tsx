import React, { useState, useEffect } from 'react';
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
import { safeGetJSON, safeSetJSON } from '../utils/storage';
import { safePrint } from '../utils/printUtils';

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
    const vat = subtotalWithCharges * 0.075;
    const total = subtotalWithCharges + vat;
    const amountInWords = numberToWords(Math.floor(total));

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
    const element = document.getElementById('invoice-preview');
    if (!element) return null;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
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

    const success = safePrint(`Invoice ${invoice.invoiceNumber}`, 'invoice-preview');
    if (success) {
      addToast('Opening print dialog...', 'info');
    } else {
      addToast('Failed to open print dialog', 'error');
    }
  };

  const handleSaveDraft = () => {
    if (!invoice.businessInfo.name || !invoice.clientInfo.name) {
      addToast('Please fill in business and client names to save draft', 'warning');
      return;
    }

    const drafts = safeGetJSON<Invoice[]>('invoice-drafts', []);
    const existingIndex = drafts.findIndex((d: Invoice) => d.invoiceNumber === invoice.invoiceNumber);

    if (existingIndex >= 0) {
      drafts[existingIndex] = { ...invoice, status: 'draft', updatedAt: new Date().toISOString() };
    } else {
      drafts.push({ ...invoice, status: 'draft', createdAt: new Date().toISOString() });
    }

    safeSetJSON('invoice-drafts', drafts);
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => navigate('/dashboard/invoices')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to Invoices"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Create Invoice</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Invoice #{invoice.invoiceNumber}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleGenerateWithDEDA}
              className="flex items-center justify-center gap-1 px-2 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all text-xs sm:text-sm font-medium flex-1 sm:flex-none"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Generate with DEDA</span>
            </button>
            
            <button
              onClick={handleSaveDraft}
              className="flex items-center justify-center gap-1 px-2 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium flex-1 sm:flex-none"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Save</span>
            </button>
            
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1 px-2 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium flex-1 sm:flex-none"
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
              className="flex items-center justify-center gap-1 px-2 sm:px-4 py-2 bg-[#1e3a8a] text-white rounded-lg hover:bg-[#1e40af] transition-colors text-xs sm:text-sm font-medium flex-1 sm:flex-none"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>
            
            <button
              onClick={handleSendInvoice}
              className="flex items-center justify-center gap-1 px-2 sm:px-4 py-2 bg-[#FF8A2B] text-white rounded-lg hover:bg-[#FF6B00] transition-colors text-xs sm:text-sm font-medium flex-1 sm:flex-none"
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
      <div className="grid lg:grid-cols-2 gap-6 p-6">
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

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-preview, #invoice-preview * {
            visibility: visible;
          }
          #invoice-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
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
    </>
  );
}
