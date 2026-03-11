import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Printer, Save, ArrowLeft, Share2 } from 'lucide-react';
import { ReceiptForm } from '../components/receipt/ReceiptForm';
import { ReceiptPreview } from '../components/receipt/ReceiptPreview';
import { Receipt } from '../types/receipt';
import { generateReceiptNumber } from '../utils/receiptUtils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '../utils/useToast';
import { ToastContainer } from '../components/ui/Toast';
import { safeGetJSON, safeSetJSON } from '../utils/storage';
import { safePrint } from '../utils/printUtils';
import { authService } from '../services/authService';
import { hasWatermark } from '../utils/planUtils';

export function ReceiptGeneratorPage() {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const showWatermark = hasWatermark(authService.getCurrentUser()?.current_plan);
  const [receipt, setReceipt] = useState<Receipt>({
    receiptNumber: generateReceiptNumber(),
    receiptDate: new Date().toISOString().split('T')[0],
    currency: 'NGN',
    businessInfo: {
      name: '',
      address: '',
      email: '',
      phone: '',
    },
    customerInfo: {
      name: '',
    },
    items: [],
    summary: {
      subtotal: 0,
      vatEnabled: false,
      vatRate: 7.5,
      vatAmount: 0,
      discount: 0,
      total: 0,
    },
    paymentMethod: 'Cash',
    notes: '',
    status: 'draft',
  });

  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const subtotal = receipt.items.reduce((sum, item) => sum + item.lineTotal, 0);
    const vatAmount = receipt.summary.vatEnabled ? (subtotal * receipt.summary.vatRate) / 100 : 0;
    const total = subtotal + vatAmount - receipt.summary.discount;

    setReceipt(prev => ({
      ...prev,
      summary: {
        ...prev.summary,
        subtotal,
        vatAmount,
        total,
      },
    }));
  }, [receipt.items, receipt.summary.vatEnabled, receipt.summary.vatRate, receipt.summary.discount]);

  const generatePDFBlob = async (): Promise<Blob | null> => {
    const element = document.getElementById('receipt-preview');
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
    if (!validateReceipt()) return;

    try {
      const blob = await generatePDFBlob();
      if (!blob) {
        addToast('Failed to generate PDF', 'error');
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${receipt.receiptNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      
      addToast('Receipt downloaded successfully!', 'success');
    } catch (error) {
      addToast('Failed to download PDF', 'error');
    }
  };

  const handlePrint = () => {
    if (!validateReceipt()) return;

    const success = safePrint(`Receipt ${receipt.receiptNumber}`, 'receipt-preview');
    if (success) {
      addToast('Opening print dialog...', 'info');
    } else {
      addToast('Failed to open print dialog', 'error');
    }
  };

  const handleSaveDraft = () => {
    if (!receipt.businessInfo.name || !receipt.customerInfo.name) {
      addToast('Please fill in business and customer names to save', 'warning');
      return;
    }

    const drafts = safeGetJSON<Receipt[]>('receipt-drafts', []);
    const existingIndex = drafts.findIndex((d: Receipt) => d.receiptNumber === receipt.receiptNumber);

    if (existingIndex >= 0) {
      drafts[existingIndex] = { ...receipt, status: 'draft', updatedAt: new Date().toISOString() };
    } else {
      drafts.push({ ...receipt, status: 'draft', createdAt: new Date().toISOString() });
    }

    safeSetJSON('receipt-drafts', drafts);
    addToast('Receipt saved as draft!', 'success');
  };

  const handleShare = () => {
    if (!validateReceipt()) return;
    
    const shareText = `Receipt #${receipt.receiptNumber}\nFrom: ${receipt.businessInfo.name}\nTo: ${receipt.customerInfo.name}\nTotal: ${receipt.summary.total.toFixed(2)} ${receipt.currency}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Receipt ${receipt.receiptNumber}`,
        text: shareText,
      }).then(() => {
        addToast('Receipt shared successfully!', 'success');
      }).catch(() => {
        navigator.clipboard.writeText(shareText);
        addToast('Receipt details copied to clipboard!', 'success');
      });
    } else {
      navigator.clipboard.writeText(shareText);
      addToast('Receipt details copied to clipboard!', 'success');
    }
  };

  const validateReceipt = (): boolean => {
    if (!receipt.businessInfo.name || !receipt.businessInfo.email || !receipt.businessInfo.phone || !receipt.businessInfo.address) {
      addToast('Please fill in all business information', 'error');
      return false;
    }
    if (!receipt.customerInfo.name) {
      addToast('Please fill in customer name', 'error');
      return false;
    }
    if (receipt.items.length === 0) {
      addToast('Please add at least one item', 'error');
      return false;
    }
    if (receipt.items.some(item => !item.name || item.quantity <= 0 || item.unitPrice <= 0)) {
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
                onClick={() => navigate('/dashboard/receipts')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Receipts"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Create Receipt</h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Receipt #{receipt.receiptNumber}</p>
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
                onClick={handleShare}
                className="flex items-center justify-center gap-1 px-2 sm:px-4 py-2 bg-[#FF8A2B] text-white rounded-lg hover:bg-[#FF6B00] transition-colors text-xs sm:text-sm font-medium flex-1 sm:flex-none"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden px-3 sm:px-6 py-3 sm:py-4 bg-white border-b">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="w-full px-2 sm:px-4 py-2 bg-[#1e3a8a] text-white rounded-lg"
          >
            {showPreview ? 'Edit Receipt' : 'Preview Receipt'}
          </button>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6 p-6">
          {/* Left: Form */}
          <div className={`${showPreview ? 'hidden lg:block' : 'block'}`}>
            <ReceiptForm receipt={receipt} onChange={setReceipt} />
          </div>

          {/* Right: Preview */}
          <div className={`${showPreview ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-24">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Live Preview</h2>
                <p className="text-xs sm:text-sm text-gray-600">This is how your receipt will look</p>
              </div>
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                <ReceiptPreview receipt={receipt} showWatermark={showWatermark} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
