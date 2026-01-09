import React, { useState, useEffect } from 'react';
import { Calculator, Info } from 'lucide-react';
import { calculateTax } from '../utils/taxUtils';
import { NIGERIAN_TAX_BRACKETS, VAT_RATE, CIT_RATE } from '../types/tax';
import { formatCurrency } from '../utils/budgetUtils';

export const TaxCalculatorPage: React.FC = () => {
  const [income, setIncome] = useState(0);
  const [deductions, setDeductions] = useState(0);
  const [vatAmount, setVatAmount] = useState(0);
  const [taxType, setTaxType] = useState<'personal' | 'corporate'>('personal');
  const [result, setResult] = useState(calculateTax(0, 0, 0));

  useEffect(() => {
    if (taxType === 'personal') {
      setResult(calculateTax(income, deductions, vatAmount));
    } else {
      const taxableIncome = Math.max(0, income - deductions);
      const corporateTax = taxableIncome * CIT_RATE;
      const vat = vatAmount * VAT_RATE;
      setResult({
        income,
        deductions,
        taxableIncome,
        incomeTax: corporateTax,
        vat,
        totalTax: corporateTax + vat,
        netIncome: income - corporateTax - vat
      });
    }
  }, [income, deductions, vatAmount, taxType]);

  return (
    <div className="min-h-screen bg-[#F0F3F5]">
      <div className="px-3 sm:px-6 py-4 sm:py-6 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tax Calculator</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Calculate your Nigerian tax obligations</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-3 sm:gap-6 px-3 sm:px-6 pb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-100">
          <h2 className="text-base sm:text-xl font-semibold mb-4">Tax Information</h2>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Tax Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTaxType('personal')}
                  className={`p-2 sm:p-3 text-xs sm:text-sm border rounded-lg font-medium transition-colors ${
                    taxType === 'personal' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Personal Income Tax
                </button>
                <button
                  onClick={() => setTaxType('corporate')}
                  className={`p-2 sm:p-3 text-xs sm:text-sm border rounded-lg font-medium transition-colors ${
                    taxType === 'corporate' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Corporate Tax (30%)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Annual Income (₦)
              </label>
              <input
                type="number"
                value={income || ''}
                onChange={(e) => setIncome(Number(e.target.value))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Deductions (₦)
              </label>
              <input
                type="number"
                value={deductions || ''}
                onChange={(e) => setDeductions(Number(e.target.value))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Pension, NHF, NHIS, Life Insurance (max 20% of gross income)
              </p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                VAT Taxable Amount (₦)
              </label>
              <input
                type="number"
                value={vatAmount || ''}
                onChange={(e) => setVatAmount(Number(e.target.value))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Amount subject to 7.5% VAT
              </p>
            </div>
          </div>

          {taxType === 'personal' && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex gap-2 sm:gap-3">
                <Info size={20} className="text-blue-600 mt-0.5 flex-shrink-0 w-5 h-5 sm:w-5 sm:h-5" />
                <div className="text-xs sm:text-sm text-blue-900">
                  <p className="font-medium mb-2">Nigerian Tax Brackets (2026)</p>
                  <ul className="space-y-1 text-xs">
                    {NIGERIAN_TAX_BRACKETS.map((bracket, idx) => (
                      <li key={idx}>
                        {formatCurrency(bracket.min)} - {bracket.max ? formatCurrency(bracket.max) : 'Above'}: {(bracket.rate * 100).toFixed(0)}%
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-100">
          <h2 className="text-base sm:text-xl font-semibold mb-4">Tax Calculation</h2>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center py-2 sm:py-3 border-b">
              <span className="text-xs sm:text-base text-gray-600">Gross Income</span>
              <span className="text-sm sm:text-lg font-semibold text-right">{formatCurrency(result.income)}</span>
            </div>

            <div className="flex justify-between items-center py-2 sm:py-3 border-b">
              <span className="text-xs sm:text-base text-gray-600">Less: Deductions</span>
              <span className="text-sm sm:text-lg font-semibold text-green-600 text-right">-{formatCurrency(result.deductions)}</span>
            </div>

            <div className="flex justify-between items-center py-2 sm:py-3 bg-gray-50 px-3 rounded border">
              <span className="text-xs sm:text-base font-medium text-gray-900">Taxable Income</span>
              <span className="text-sm sm:text-lg font-bold text-right">{formatCurrency(result.taxableIncome)}</span>
            </div>

            <div className="flex justify-between items-center py-2 sm:py-3 border-b">
              <span className="text-xs sm:text-base text-gray-600">Income Tax</span>
              <span className="text-sm sm:text-lg font-semibold text-red-600 text-right">{formatCurrency(result.incomeTax)}</span>
            </div>

            <div className="flex justify-between items-center py-2 sm:py-3 border-b">
              <span className="text-xs sm:text-base text-gray-600">VAT (7.5%)</span>
              <span className="text-sm sm:text-lg font-semibold text-red-600 text-right">{formatCurrency(result.vat)}</span>
            </div>

            <div className="flex justify-between items-center py-2 sm:py-3 bg-red-50 px-3 rounded border border-red-200">
              <span className="text-xs sm:text-base font-medium text-red-900">Total Tax</span>
              <span className="text-sm sm:text-lg font-bold text-red-900 text-right">{formatCurrency(result.totalTax)}</span>
            </div>

            <div className="flex justify-between items-center py-3 sm:py-4 bg-green-50 px-3 rounded border border-green-200">
              <span className="text-xs sm:text-base font-medium text-green-900">Net Income</span>
              <span className="text-sm sm:text-lg font-bold text-green-900 text-right">{formatCurrency(result.netIncome)}</span>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <span className="font-semibold">Tax Rate: </span>
              {result.income > 0 ? ((result.totalTax / result.income) * 100).toFixed(2) : '0.00'}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
