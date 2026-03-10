import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Printer, Save, Send, ArrowLeft, Link as LinkIcon, FileText } from 'lucide-react';
import { QuotationForm } from '../components/quotation/QuotationForm';
import { QuotationPreview } from '../components/quotation/QuotationPreview';
import { Quotation } from '../types/quotation';
import { generateQuotationNumber, generatePublicLink } from '../utils/quotationUtils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '../utils/useToast';
import { ToastContainer } from '../components/ui/Toast';
import { safeGetJSON, safeSetJSON } from '../utils/storage';
import { safePrint } from '../utils/printUtils';
import { authService } from '../services/authService';
import { hasWatermark } from '../utils/planUtils';

export function QuotationGeneratorPage() {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const showWatermark = hasWatermark(authService.getCurrentUser()?.current_plan);

  // Check if editing an existing quotation (set by QuotationPage handleView)
  const initialQuotation = safeGetJSON<Quotation | null>('current-quotation', null);

  const [quotation, setQuotation] = useState<Quotation>(initialQuotation || {
    quotationNumber: generateQuotationNumber(),
    issueDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: 'NGN',
    businessInfo: {
      name: '',
      address: '',
      email: '',
      phone: '',
      website: '',
      taxId: '',
    },
    clientInfo: {
      name: '',
      companyName: '',
      address: '',
      email: '',
      phone: '',
    },
    items: [],
    summary: {
      subtotal: 0,
      totalVat: 0,
      discount: 0,
      discountType: 'percentage',
      total: 0,
    },
    notes: '',
    terms: '',
    paymentInstructions: '',
    status: 'draft',
  });

  // Clear the stored quotation after loading
  useEffect(() => {
    localStorage.removeItem('current-quotation');
  }, []);

  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const subtotal = quotation.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const totalVat = quotation.items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      return sum + (itemSubtotal * item.vat) / 100;
    }, 0);

    let discountAmount = 0;
    if (quotation.summary.discountType === 'percentage') {
      discountAmount = (subtotal * quotation.summary.discount) / 100;
    } else {
      discountAmount = quotation.summary.discount;
    }

    const total = subtotal + totalVat - discountAmount;

    setQuotation(prev => ({
      ...prev,
      summary: {
        ...prev.summary,
        subtotal,
        totalVat,
        total,
      },
    }));
  }, [quotation.items, quotation.summary.discount, quotation.summary.discountType]);

  const generatePDFBlob = async (): Promise<Blob | null> => {
    const element = document.getElementById('quotation-preview');
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
    if (!validateQuotation()) return;

    try {
      const blob = await generatePDFBlob();
      if (!blob) {
        addToast('Failed to generate PDF', 'error');
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${quotation.quotationNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      
      addToast('Quotation downloaded successfully!', 'success');
    } catch (error) {
      addToast('Failed to download PDF', 'error');
    }
  };

  const handlePrint = () => {
    if (!validateQuotation()) return;

    const success = safePrint(`Quotation ${quotation.quotationNumber}`, 'quotation-preview');
    if (success) {
      addToast('Opening print dialog...', 'info');
    } else {
      addToast('Failed to open print dialog', 'error');
    }
  };

  const handleSaveDraft = () => {
    if (!quotation.businessInfo.name || !quotation.clientInfo.name) {
      addToast('Please fill in business and client names to save draft', 'warning');
      return;
    }

    const drafts = safeGetJSON<Quotation[]>('quotation-drafts', []);
    const existingIndex = drafts.findIndex((d: Quotation) => d.quotationNumber === quotation.quotationNumber);

    if (existingIndex >= 0) {
      drafts[existingIndex] = { ...quotation, status: 'draft', updatedAt: new Date().toISOString() };
    } else {
      drafts.push({ ...quotation, status: 'draft', createdAt: new Date().toISOString() });
    }

    safeSetJSON('quotation-drafts', drafts);
    addToast('Quotation saved as draft!', 'success');
  };

  const handleGenerateLink = () => {
    if (!validateQuotation()) return;

    const publicLink = generatePublicLink(quotation.quotationNumber);
    const linkExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    setQuotation(prev => ({ ...prev, publicLink, linkExpiry, status: 'sent' }));
    
    navigator.clipboard.writeText(publicLink);
    addToast('Public link copied to clipboard!', 'success');
  };

  const handleConvertToInvoice = () => {
    if (!validateQuotation()) return;
    addToast('Converting to invoice...', 'info');
    setTimeout(() => {
      navigate('/dashboard/invoices/create', { state: { fromQuotation: quotation } });
    }, 1000);
  };

  const validateQuotation = (): boolean => {
    if (!quotation.businessInfo.name || !quotation.businessInfo.email || !quotation.businessInfo.phone || !quotation.businessInfo.address) {
      addToast('Please fill in all business information', 'error');
      return false;
    }
    if (!quotation.clientInfo.name || !quotation.clientInfo.email || !quotation.clientInfo.phone || !quotation.clientInfo.address) {
      addToast('Please fill in all client information', 'error');
      return false;
    }
    if (quotation.items.length === 0) {
      addToast('Please add at least one item', 'error');
      return false;
    }
    if (quotation.items.some(item => !item.name || item.quantity <= 0 || item.unitPrice <= 0)) {
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
                onClick={() => navigate('/dashboard/quotations')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Quotations"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Create Quotation</h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Quotation #{quotation.quotationNumber}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
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
                onClick={handleDownloadPDF}
                className="flex items-center justify-center gap-1 px-2 sm:px-4 py-2 bg-[#1e3a8a] text-white rounded-lg hover:bg-[#1e40af] transition-colors text-xs sm:text-sm font-medium flex-1 sm:flex-none"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">PDF</span>
              </button>
              
              <button
                onClick={handleGenerateLink}
                className="flex items-center justify-center gap-1 px-2 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium flex-1 sm:flex-none"
              >
                <LinkIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Link</span>
              </button>
              
              <button
                onClick={handleConvertToInvoice}
                className="flex items-center justify-center gap-1 px-2 sm:px-4 py-2 bg-[#FF8A2B] text-white rounded-lg hover:bg-[#FF6B00] transition-colors text-xs sm:text-sm font-medium flex-1 sm:flex-none"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Invoice</span>
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
            {showPreview ? 'Edit Quotation' : 'Preview Quotation'}
          </button>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6 p-6">
          {/* Left: Form */}
          <div className={`${showPreview ? 'hidden lg:block' : 'block'}`}>
            <QuotationForm quotation={quotation} onChange={setQuotation} />
          </div>

          {/* Right: Preview */}
          <div className={`${showPreview ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-24">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Live Preview</h2>
                <p className="text-xs sm:text-sm text-gray-600">This is how your quotation will look</p>
              </div>
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                <QuotationPreview quotation={quotation} showWatermark={showWatermark} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
