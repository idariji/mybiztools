import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Printer, Save, ArrowLeft } from 'lucide-react';
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

export function PayslipGeneratorPage() {
  const navigate = useNavigate();
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

  const handleDownloadPDF = async () => {
    if (!validatePayslip()) return;
    const element = document.getElementById('payslip-preview');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${payslip.payslipNumber}.pdf`);
      addToast('Payslip downloaded successfully!', 'success');
    } catch (error) {
      addToast('Failed to download PDF', 'error');
    }
  };

  const handleSaveDraft = () => {
    if (!payslip.employerInfo.name || !payslip.employeeInfo.name) {
      addToast('Please fill in employer and employee names', 'warning');
      return;
    }
    const drafts = JSON.parse(localStorage.getItem('payslip-drafts') || '[]');
    const existingIndex = drafts.findIndex((d: Payslip) => d.payslipNumber === payslip.payslipNumber);
    if (existingIndex >= 0) {
      drafts[existingIndex] = { ...payslip, status: 'draft', updatedAt: new Date().toISOString() };
    } else {
      drafts.push({ ...payslip, status: 'draft', createdAt: new Date().toISOString() });
    }
    localStorage.setItem('payslip-drafts', JSON.stringify(drafts));
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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
            <div>
              <h1 className="text-lg sm:text-3xl font-bold text-gray-900">Generate Payslip</h1>
              <p className="text-xs sm:text-base text-gray-600 mt-1">{payslip.payslipNumber || 'Enter employee ID to generate number'}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button onClick={handleSaveDraft} className="flex items-center justify-center gap-1 px-2 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium flex-1 sm:flex-none" title="Save Draft"><Save className="w-4 h-4" /><span className="hidden sm:inline">Save</span></button>
              <button onClick={() => window.print()} className="flex items-center justify-center gap-1 px-2 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium flex-1 sm:flex-none" title="Print"><Printer className="w-4 h-4" /><span className="hidden sm:inline">Print</span></button>
              <button onClick={handleDownloadPDF} className="flex items-center justify-center gap-1 px-2 sm:px-4 py-2 bg-[#FF8A2B] text-white rounded-lg hover:bg-[#FF6B00] transition-colors text-xs sm:text-sm font-medium flex-1 sm:flex-none" title="Download PDF"><Download className="w-4 h-4" /><span className="hidden sm:inline">PDF</span></button>
            </div>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden px-3 sm:px-6 py-3 bg-white border-b">
          <button onClick={() => setShowPreview(!showPreview)} className="w-full px-4 py-2.5 bg-[#1e3a8a] text-white rounded-lg font-medium text-sm">{showPreview ? 'Edit Payslip' : 'Preview Payslip'}</button>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-3 sm:gap-6 p-3 sm:p-6">
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
      </div>
    </>
  );
}
