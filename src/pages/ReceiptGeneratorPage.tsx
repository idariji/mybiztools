import { useState, useEffect } from 'react';
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
import { MobileBottomNav } from '../layout/MobileBottomNav';
import { authService } from '../services/authService';
import { hasWatermark } from '../utils/planUtils';

export function ReceiptGeneratorPage() {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const showWatermark = hasWatermark(authService.getCurrentUser()?.current_plan);

  // Check if editing an existing receipt (set by ReceiptPage handleView)
  const initialReceipt = safeGetJSON<Receipt | null>('current-receipt', null);

  const [receipt, setReceipt] = useState<Receipt>(initialReceipt || {
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

  // Clear the stored receipt after loading
  useEffect(() => {
    localStorage.removeItem('current-receipt');
  }, []);

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
    const element = document.getElementById('receipt-capture');
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
    window.print();
    addToast('Opening print dialog...', 'info');
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
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <button
                onClick={() => navigate('/dashboard/receipts')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                title="Back to Receipts"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Create Receipt</h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">Receipt #{receipt.receiptNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
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
                onClick={handleDownloadPDF}
                className="flex items-center justify-center gap-1 p-2 sm:px-3 sm:py-2 bg-[#1e3a8a] text-white rounded-lg hover:bg-[#1e40af] transition-colors text-xs sm:text-sm font-medium"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">PDF</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-1 p-2 sm:px-3 sm:py-2 bg-[#FF8A2B] text-white rounded-lg hover:bg-[#FF6B00] transition-colors text-xs sm:text-sm font-medium"
                title="Share"
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
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 p-3 sm:p-6 pb-24 lg:pb-6">
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

      {/* Off-screen capture div for PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '794px', zIndex: -1 }}>
        <ReceiptPreview id="receipt-capture" receipt={receipt} showWatermark={showWatermark} />
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt-preview, #receipt-preview * { visibility: visible; }
          #receipt-preview { position: absolute; left: 0; top: 0; width: 100%; }
          #receipt-capture { display: none; }
        }
      `}</style>
    <MobileBottomNav />
    </>
  );
}
