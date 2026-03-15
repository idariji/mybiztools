import { Payslip } from '../../types/payslip';
import { formatCurrencyNGN } from '../../utils/payslipUtils';

interface PayslipPreviewProps {
  payslip: Payslip;
  showWatermark?: boolean;
  id?: string;
}

export function PayslipPreview({ payslip, showWatermark, id = 'payslip-preview' }: PayslipPreviewProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto relative overflow-hidden" id={id}>
      {showWatermark && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10 rotate-[-35deg] opacity-10 select-none">
          <span className="text-[80px] font-black text-gray-800 whitespace-nowrap tracking-widest">MYBIZTOOLS FREE</span>
        </div>
      )}
      <div className="border-2 border-[#1e3a8a] rounded-lg p-6">
        {/* Header */}
        <div className="text-center mb-6 pb-4 border-b-2 border-gray-200">
          {payslip.employerInfo.logo && <img src={payslip.employerInfo.logo} alt="Logo" className="h-16 mx-auto mb-3" />}
          <h1 className="text-2xl font-bold text-[#1e3a8a]">PAYSLIP</h1>
          <p className="text-sm text-gray-600 mt-1">{payslip.month} {payslip.year}</p>
          <p className="text-xs text-gray-500">#{payslip.payslipNumber}</p>
        </div>

        {/* Employer & Employee Info */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-xs font-bold text-gray-700 mb-2">EMPLOYER</h3>
            <p className="font-semibold text-sm">{payslip.employerInfo.name}</p>
            <p className="text-xs text-gray-600">{payslip.employerInfo.address}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-xs font-bold text-gray-700 mb-2">EMPLOYEE</h3>
            <p className="font-semibold text-sm">{payslip.employeeInfo.name}</p>
            <p className="text-xs text-gray-600">ID: {payslip.employeeInfo.employeeId}</p>
            <p className="text-xs text-gray-600">{payslip.employeeInfo.position}</p>
            <p className="text-xs text-gray-600">{payslip.employeeInfo.department}</p>
          </div>
        </div>

        {/* Earnings & Deductions */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-bold text-green-700 mb-3 bg-green-50 p-2 rounded">EARNINGS</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span>Basic Salary:</span><span className="font-semibold">{formatCurrencyNGN(payslip.earnings.basicSalary)}</span></div>
              <div className="flex justify-between text-sm"><span>Housing:</span><span className="font-semibold">{formatCurrencyNGN(payslip.earnings.housing)}</span></div>
              <div className="flex justify-between text-sm"><span>Transport:</span><span className="font-semibold">{formatCurrencyNGN(payslip.earnings.transport)}</span></div>
              {payslip.earnings.bonus > 0 && <div className="flex justify-between text-sm"><span>Bonus:</span><span className="font-semibold">{formatCurrencyNGN(payslip.earnings.bonus)}</span></div>}
              {payslip.earnings.overtime > 0 && <div className="flex justify-between text-sm"><span>Overtime:</span><span className="font-semibold">{formatCurrencyNGN(payslip.earnings.overtime)}</span></div>}
              {payslip.earnings.other > 0 && <div className="flex justify-between text-sm"><span>Other:</span><span className="font-semibold">{formatCurrencyNGN(payslip.earnings.other)}</span></div>}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-700 mb-3 bg-red-50 p-2 rounded">DEDUCTIONS</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span>PAYE Tax:</span><span className="font-semibold">{formatCurrencyNGN(payslip.deductions.paye)}</span></div>
              <div className="flex justify-between text-sm"><span>Pension (8%):</span><span className="font-semibold">{formatCurrencyNGN(payslip.deductions.pension)}</span></div>
              <div className="flex justify-between text-sm"><span>NHF (2.5%):</span><span className="font-semibold">{formatCurrencyNGN(payslip.deductions.nhf)}</span></div>
              {payslip.deductions.loans > 0 && <div className="flex justify-between text-sm"><span>Loans:</span><span className="font-semibold">{formatCurrencyNGN(payslip.deductions.loans)}</span></div>}
              {payslip.deductions.other > 0 && <div className="flex justify-between text-sm"><span>Other:</span><span className="font-semibold">{formatCurrencyNGN(payslip.deductions.other)}</span></div>}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="border-t-2 border-gray-300 pt-4">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm font-semibold"><span>Gross Pay:</span><span className="text-green-600">{formatCurrencyNGN(payslip.summary.grossPay)}</span></div>
            <div className="flex justify-between text-sm font-semibold"><span>Total Deductions:</span><span className="text-red-600">{formatCurrencyNGN(payslip.summary.totalDeductions)}</span></div>
          </div>
          <div className="bg-[#1e3a8a] text-white p-4 rounded-lg flex justify-between items-center">
            <span className="font-bold text-lg">NET PAY:</span>
            <span className="font-bold text-2xl">{formatCurrencyNGN(payslip.summary.netPay)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">Payment Date: {new Date(payslip.paymentDate).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500 mt-1">Bank Account: {payslip.employeeInfo.bankAccount}</p>
          <p className="text-xs text-gray-400 mt-3">This is a computer-generated payslip</p>
        </div>
      </div>
    </div>
  );
}
