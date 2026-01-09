import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Payslip, MONTHS } from '../../types/payslip';

interface PayslipFormProps {
  payslip: Payslip;
  onChange: (payslip: Payslip) => void;
}

export function PayslipForm({ payslip, onChange }: PayslipFormProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(payslip.employerInfo.logo || null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size < 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        onChange({ ...payslip, employerInfo: { ...payslip.employerInfo, logo: reader.result as string } });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Employer Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Employer Information</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
          <div className="flex items-center gap-4">
            {logoPreview && (
              <div className="relative">
                <img src={logoPreview} alt="Logo" className="h-16 w-16 object-contain" />
                <button onClick={() => { setLogoPreview(null); onChange({ ...payslip, employerInfo: { ...payslip.employerInfo, logo: undefined } }); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span className="text-sm">Upload Logo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Company Name *" value={payslip.employerInfo.name} onChange={(e) => onChange({ ...payslip, employerInfo: { ...payslip.employerInfo, name: e.target.value } })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent" />
          <input type="email" placeholder="Company Email *" value={payslip.employerInfo.email} onChange={(e) => onChange({ ...payslip, employerInfo: { ...payslip.employerInfo, email: e.target.value } })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent" />
          <input type="text" placeholder="Phone Number *" value={payslip.employerInfo.phone} onChange={(e) => onChange({ ...payslip, employerInfo: { ...payslip.employerInfo, phone: e.target.value } })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent" />
        </div>
        <textarea placeholder="Company Address *" value={payslip.employerInfo.address} onChange={(e) => onChange({ ...payslip, employerInfo: { ...payslip.employerInfo, address: e.target.value } })} className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent" rows={2} />
      </div>

      {/* Employee Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Employee Name *" value={payslip.employeeInfo.name} onChange={(e) => onChange({ ...payslip, employeeInfo: { ...payslip.employeeInfo, name: e.target.value } })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent" />
          <input type="text" placeholder="Employee ID *" value={payslip.employeeInfo.employeeId} onChange={(e) => onChange({ ...payslip, employeeInfo: { ...payslip.employeeInfo, employeeId: e.target.value } })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent" />
          <input type="text" placeholder="Department *" value={payslip.employeeInfo.department} onChange={(e) => onChange({ ...payslip, employeeInfo: { ...payslip.employeeInfo, department: e.target.value } })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent" />
          <input type="text" placeholder="Position *" value={payslip.employeeInfo.position} onChange={(e) => onChange({ ...payslip, employeeInfo: { ...payslip.employeeInfo, position: e.target.value } })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent" />
          <input type="email" placeholder="Employee Email *" value={payslip.employeeInfo.email} onChange={(e) => onChange({ ...payslip, employeeInfo: { ...payslip.employeeInfo, email: e.target.value } })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent" />
          <input type="text" placeholder="Bank Account *" value={payslip.employeeInfo.bankAccount} onChange={(e) => onChange({ ...payslip, employeeInfo: { ...payslip.employeeInfo, bankAccount: e.target.value } })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent" />
        </div>
      </div>

      {/* Period */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pay Period</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select value={payslip.month} onChange={(e) => onChange({ ...payslip, month: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent">
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input type="number" value={payslip.year} onChange={(e) => onChange({ ...payslip, year: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
            <input type="date" value={payslip.paymentDate} onChange={(e) => onChange({ ...payslip, paymentDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent" />
          </div>
        </div>
      </div>

      {/* Earnings */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-green-700 mb-4">Earnings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary *</label><input type="number" placeholder="0.00" value={payslip.earnings.basicSalary} onChange={(e) => onChange({ ...payslip, earnings: { ...payslip.earnings, basicSalary: parseFloat(e.target.value) || 0 } })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Housing Allowance</label><input type="number" placeholder="0.00" value={payslip.earnings.housing} onChange={(e) => onChange({ ...payslip, earnings: { ...payslip.earnings, housing: parseFloat(e.target.value) || 0 } })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Transport Allowance</label><input type="number" placeholder="0.00" value={payslip.earnings.transport} onChange={(e) => onChange({ ...payslip, earnings: { ...payslip.earnings, transport: parseFloat(e.target.value) || 0 } })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Bonus</label><input type="number" placeholder="0.00" value={payslip.earnings.bonus} onChange={(e) => onChange({ ...payslip, earnings: { ...payslip.earnings, bonus: parseFloat(e.target.value) || 0 } })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Overtime</label><input type="number" placeholder="0.00" value={payslip.earnings.overtime} onChange={(e) => onChange({ ...payslip, earnings: { ...payslip.earnings, overtime: parseFloat(e.target.value) || 0 } })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Other Earnings</label><input type="number" placeholder="0.00" value={payslip.earnings.other} onChange={(e) => onChange({ ...payslip, earnings: { ...payslip.earnings, other: parseFloat(e.target.value) || 0 } })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent" /></div>
        </div>
      </div>

      {/* Deductions */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-red-700 mb-4">Deductions</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">PAYE Tax (Auto)</label><input type="number" placeholder="0.00" value={payslip.deductions.paye} readOnly className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Pension 8% (Auto)</label><input type="number" placeholder="0.00" value={payslip.deductions.pension} readOnly className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">NHF 2.5% (Auto)</label><input type="number" placeholder="0.00" value={payslip.deductions.nhf} readOnly className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Loans/Advances</label><input type="number" placeholder="0.00" value={payslip.deductions.loans} onChange={(e) => onChange({ ...payslip, deductions: { ...payslip.deductions, loans: parseFloat(e.target.value) || 0 } })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Other Deductions</label><input type="number" placeholder="0.00" value={payslip.deductions.other} onChange={(e) => onChange({ ...payslip, deductions: { ...payslip.deductions, other: parseFloat(e.target.value) || 0 } })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent" /></div>
        </div>
      </div>
    </div>
  );
}
