import { useState, useEffect } from 'react';
import { Download, Printer, Save } from 'lucide-react';
import { PayslipForm } from '../components/payslip/PayslipForm';
import { PayslipPreview } from '../components/payslip/PayslipPreview';
import { Payslip, calculatePAYE, calculatePension, calculateNHF } from '../types/payslip';
import { generatePayslipNumber } from '../utils/payslipUtils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '../utils/useToast';
import { ToastContainer } from '../components/ui/Toast';
import { authService } from '../services/authService';
import { hasWatermark } from '../utils/planUtils';
import { MobileBottomNav } from '../layout/MobileBottomNav';
import { PayslipSyncService } from '../services/documentSyncService';

export function PayslipGeneratorPage() {
  const { toasts, addToast, removeToast } = useToast();
  const showWatermark = hasWatermark(authService.getCurrentUser()?.current_plan);
  const [payslip, setPayslip] = useState<Payslip>({
    payslipNumber: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    employerInfo: { name: '', address: '', email: '', phone: '' },
    employeeInfo: { name: '', employeeId: '', department: '', position: '', email: '', bankAccount: '' },
    earnings: { basicSalary: 0, housing: 0, transport: 0, bonus: 0, overtime: 0, other: 0 },
    deductions: { paye: 0, pension: 0, nhf: 0, loans: 0, other: 0 },
    summary: { grossPay: 0, totalDeductions: 0, netPay: 0 },
    paymentDate: new Date().toISOString().split('T')[0],
    status: 'draft',
  });

  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (payslip.employeeInfo.employeeId) {
      setPayslip(prev => ({ ...prev, payslipNumber: generatePayslipNumber(prev.month, prev.year, prev.employeeInfo.employeeId) }));
    }
  }, [payslip.month, payslip.year, payslip.employeeInfo.employeeId]);

  useEffect(() => {
    const grossPay = Object.values(payslip.earnings).reduce((sum, val) => sum + val, 0);
    const annualGross = grossPay * 12;
    const paye = calculatePAYE(annualGross);
    const pension = calculatePension(grossPay);
    const nhf = calculateNHF(grossPay);
    
    const totalDeductions = paye + pension.employee + nhf + payslip.deductions.loans + payslip.deductions.other;
    const netPay = grossPay - totalDeductions;

    setPayslip(prev => ({
      ...prev,
      deductions: { ...prev.deductions, paye, pension: pension.employee, nhf },
      summary: { grossPay, totalDeductions, netPay },
    }));
  }, [payslip.earnings, payslip.deductions.loans, payslip.deductions.other]);

  const generatePDFBlob = async (): Promise<Blob | null> => {
    const element = document.getElementById('payslip-capture');
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
    } catch {
      return null;
    }
  };

  const handleDownloadPDF = async () => {
    if (!validatePayslip()) return;
    try {
      const blob = await generatePDFBlob();
      if (!blob) { addToast('Failed to generate PDF', 'error'); return; }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${payslip.payslipNumber || 'payslip'}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      addToast('Payslip downloaded successfully!', 'success');
    } catch {
      addToast('Failed to download PDF', 'error');
    }
  };

  const handleSaveDraft = async () => {
    if (!payslip.employerInfo.name || !payslip.employeeInfo.name) {
      addToast('Please fill in employer and employee names', 'warning');
      return;
    }
    await PayslipSyncService.save({ ...payslip, status: 'draft', updatedAt: new Date().toISOString() });
    addToast('Payslip saved as draft!', 'success');
  };

  const validatePayslip = (): boolean => {
    if (!payslip.employerInfo.name || !payslip.employeeInfo.name || !payslip.employeeInfo.employeeId) {
      addToast('Please fill in all required fields', 'error');
      return false;
    }
    if (payslip.earnings.basicSalary <= 0) {
      addToast('Basic salary must be greater than zero', 'error');
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
            <div className="min-w-0">
              <h1 className="text-lg sm:text-3xl font-bold text-gray-900 truncate">Generate Payslip</h1>
              <p className="text-xs sm:text-base text-gray-600 truncate">{payslip.payslipNumber || 'Enter employee ID to generate number'}</p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <button onClick={handleSaveDraft} className="flex items-center justify-center gap-1 p-2 sm:px-3 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium" title="Save Draft"><Save className="w-4 h-4" /><span className="hidden sm:inline">Save</span></button>
              <button onClick={() => window.print()} className="flex items-center justify-center gap-1 p-2 sm:px-3 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium" title="Print"><Printer className="w-4 h-4" /><span className="hidden sm:inline">Print</span></button>
              <button onClick={handleDownloadPDF} className="flex items-center justify-center gap-1 p-2 sm:px-3 sm:py-2 bg-[#FF8A2B] text-white rounded-lg hover:bg-[#FF6B00] transition-colors text-xs sm:text-sm font-medium" title="Download PDF"><Download className="w-4 h-4" /><span className="hidden sm:inline">PDF</span></button>
            </div>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden px-3 sm:px-6 py-3 bg-white border-b">
          <button onClick={() => setShowPreview(!showPreview)} className="w-full px-4 py-2.5 bg-[#1e3a8a] text-white rounded-lg font-medium text-sm">{showPreview ? 'Edit Payslip' : 'Preview Payslip'}</button>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-3 sm:gap-6 p-3 sm:p-6 pb-24 lg:pb-6">
          <div className={`${showPreview ? 'hidden lg:block' : 'block'}`}>
            <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-6 border border-slate-100">
              <PayslipForm payslip={payslip} onChange={setPayslip} />
            </div>
          </div>
          <div className={`${showPreview ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-24">
              <div className="mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Live Preview</h2>
                <p className="text-xs sm:text-sm text-gray-600">Nigerian PAYE 2026 compliant</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-auto max-h-[calc(100vh-200px)]">
                <PayslipPreview payslip={payslip} showWatermark={showWatermark} />
              </div>
            </div>
          </div>
        </div>

        {/* Off-screen capture div — always rendered, used for PDF generation */}
        <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '794px', zIndex: -1 }}>
          <PayslipPreview id="payslip-capture" payslip={payslip} showWatermark={showWatermark} />
        </div>

        {/* Print Styles */}
        <style>{`
          @media print {
            body > * { display: none !important; }
            #payslip-preview {
              display: block !important;
              position: fixed !important;
              top: 0 !important; left: 0 !important;
              width: 100% !important;
              height: auto !important;
              overflow: visible !important;
              z-index: 9999 !important;
            }
            #payslip-capture { display: none !important; }
          }
        `}</style>
      </div>
    <MobileBottomNav />
    </>
  );
}
