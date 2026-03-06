import React, { useState } from 'react';
import { Calculator, Info } from 'lucide-react';
import { calculatePaye, calculateCit, calculateWht, calculateVat } from '../utils/taxUtils';
import { PAYE_BRACKETS, WHT_RATES, VAT_RATE } from '../types/tax';
import type { PayeCalculation, CitCalculation, WhtCalculation } from '../types/tax';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 }).format(n);

const pct = (n: number) => n.toFixed(2) + '%';

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${active
        ? 'bg-[#FF8A2B] text-white shadow'
        : 'bg-white text-slate-600 hover:bg-orange-50 border border-slate-200'}`}
    >{label}</button>
  );
}

function Row({ label, value, sub, highlight, positive, negative }: {
  label: string; value: string; sub?: string;
  highlight?: boolean; positive?: boolean; negative?: boolean;
}) {
  return (
    <div className={`flex justify-between items-center py-2.5 px-3 rounded-lg ${
      highlight ? 'bg-orange-50 border border-orange-200' : 'border-b border-slate-100'}`}>
      <div>
        <span className={`text-sm ${highlight ? 'font-bold text-slate-900' : 'text-slate-600'}`}>{label}</span>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <span className={`text-sm font-bold ${
        highlight ? 'text-[#FF8A2B]' : positive ? 'text-green-700' : negative ? 'text-red-600' : 'text-slate-900'}`}>
        {value}
      </span>
    </div>
  );
}

// ------- PAYE -------
function PayeTab() {
  const [gross, setGross] = useState('');
  const result: PayeCalculation | null = gross && Number(gross) > 0 ? calculatePaye(Number(gross)) : null;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h3 className="font-semibold text-slate-900">Annual Gross Income</h3>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Enter annual gross income (₦)</label>
          <input type="number" value={gross} onChange={e => setGross(e.target.value)}
            placeholder="e.g. 3600000"
            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]" />
          <p className="text-xs text-slate-400 mt-1">= ₦{gross ? Number(gross).toLocaleString() : '0'} / year</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-900 space-y-1">
          <p className="font-semibold mb-1">How PAYE is calculated (PITA 2011)</p>
          <p>1. CRA = ₦200,000 + 20% of gross income</p>
          <p>2. Deduct: Pension (8%), NHF (2.5%), NHIS (1.75%)</p>
          <p>3. Apply graduated brackets to taxable income:</p>
          <div className="mt-1 space-y-0.5">
            {PAYE_BRACKETS.map((b, i) => (
              <div key={i} className="flex justify-between">
                <span>{b.label}</span><span className="font-medium">{(b.rate * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">PAYE Breakdown</h3>
        {!result ? (
          <p className="text-slate-400 text-sm text-center mt-10">Enter income to see calculation</p>
        ) : (
          <div className="space-y-1.5">
            <Row label="Gross Annual Income" value={fmt(result.grossIncome)} />
            <Row label="Consolidated Relief Allowance" value={`-${fmt(result.cra)}`} negative sub="₦200,000 + 20% of gross" />
            <Row label="Pension (Employee 8%)" value={`-${fmt(result.pension)}`} negative />
            <Row label="NHF (2.5% of basic)" value={`-${fmt(result.nhf)}`} negative />
            <Row label="NHIS (1.75%)" value={`-${fmt(result.nhis)}`} negative />
            <Row label="Taxable Income" value={fmt(result.taxableIncome)} highlight />
            {result.bracketBreakdown.length > 0 && (
              <div className="my-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 mb-1">Tax by bracket</p>
                {result.bracketBreakdown.map((b, i) => (
                  <div key={i} className="flex justify-between text-xs text-slate-600 py-0.5">
                    <span>{b.label}</span><span>{fmt(b.tax)}</span>
                  </div>
                ))}
              </div>
            )}
            <Row label="Annual PAYE" value={fmt(result.annualPaye)} negative />
            <Row label="Monthly PAYE" value={fmt(result.monthlyPaye)} negative />
            <Row label="Monthly Gross Pay" value={fmt(result.monthlyGross)} />
            <Row label="Monthly Net Pay" value={fmt(result.monthlyNet)} positive highlight />
            <p className="text-xs text-slate-500 pt-1">Effective tax rate: <strong>{pct(result.effectiveRate)}</strong></p>
          </div>
        )}
      </div>
    </div>
  );
}

// ------- CIT -------
function CitTab() {
  const [turnover, setTurnover] = useState('');
  const [profit, setProfit] = useState('');
  const result: CitCalculation | null =
    turnover && profit ? calculateCit(Number(turnover), Number(profit)) : null;

  const sizeLabel = (s: string) =>
    s === 'small'  ? 'Small company (< ₦25m turnover) — 0% CIT' :
    s === 'medium' ? 'Medium company (₦25m–₦100m) — 20% CIT' :
                     'Large company (> ₦100m) — 30% CIT';

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h3 className="font-semibold text-slate-900">Company Details</h3>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Annual Turnover (₦)</label>
          <input type="number" value={turnover} onChange={e => setTurnover(e.target.value)}
            placeholder="e.g. 150000000"
            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Assessable Profit (₦)</label>
          <input type="number" value={profit} onChange={e => setProfit(e.target.value)}
            placeholder="e.g. 40000000"
            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]" />
          <p className="text-xs text-slate-400 mt-1">Profit before tax after allowable deductions</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-900 space-y-1">
          <p className="font-semibold">CIT Rates (CITA + Finance Acts)</p>
          <p>Small (&lt; ₦25m turnover): <strong>0%</strong> (Finance Act 2020)</p>
          <p>Medium (₦25m–₦100m): <strong>20%</strong></p>
          <p>Large (&gt; ₦100m): <strong>30%</strong></p>
          <p className="mt-1">+ Education Tax (TETFund): <strong>3%</strong> of assessable profit (Finance Act 2021)</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">CIT Breakdown</h3>
        {!result ? (
          <p className="text-slate-400 text-sm text-center mt-10">Enter company figures to see calculation</p>
        ) : (
          <div className="space-y-1.5">
            <div className="mb-3 px-3 py-2 bg-orange-50 rounded-lg text-xs font-semibold text-orange-700 border border-orange-200">
              {sizeLabel(result.companySize)}
            </div>
            <Row label="Annual Turnover" value={fmt(result.turnover)} />
            <Row label="Assessable Profit" value={fmt(result.assessableProfit)} />
            <Row label={`Company Income Tax (${pct(result.citRate * 100)})`} value={fmt(result.cit)} negative />
            <Row label="Education Tax / TETFund (3%)" value={fmt(result.educationTax)} negative />
            <Row label="Total Tax" value={fmt(result.totalTax)} negative highlight />
            <Row label="Net Profit After Tax" value={fmt(result.netProfit)} positive highlight />
            <p className="text-xs text-slate-500 pt-1">Effective tax rate: <strong>{pct(result.effectiveRate)}</strong></p>
          </div>
        )}
      </div>
    </div>
  );
}

// ------- VAT -------
function VatTab() {
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState<'exclusive' | 'inclusive'>('exclusive');
  let base = 0, vat = 0, total = 0;
  if (amount && Number(amount) > 0) {
    if (mode === 'exclusive') {
      base = Number(amount); const r = calculateVat(base); vat = r.vat; total = r.total;
    } else {
      total = Number(amount); base = total / (1 + VAT_RATE); vat = total - base;
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h3 className="font-semibold text-slate-900">VAT Calculator</h3>
        <div className="grid grid-cols-2 gap-2">
          {(['exclusive', 'inclusive'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`py-2 text-sm rounded-lg border font-medium transition-colors ${mode === m ? 'border-[#FF8A2B] bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {m === 'exclusive' ? 'Exclusive (+ VAT)' : 'Inclusive (VAT in)'}
            </button>
          ))}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            {mode === 'exclusive' ? 'Amount Before VAT (₦)' : 'Total Amount Including VAT (₦)'}
          </label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]" />
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-900">
          <p className="font-semibold">VAT in Nigeria</p>
          <p className="mt-1">Rate: <strong>7.5%</strong> (Finance Act 2020, effective Feb 2020)</p>
          <p>Registration threshold: <strong>₦25 million</strong> annual turnover</p>
          <p className="mt-1 text-blue-700">Raised from 5% to 7.5% by Finance Act 2020.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">VAT Breakdown</h3>
        {!amount || Number(amount) <= 0 ? (
          <p className="text-slate-400 text-sm text-center mt-10">Enter amount to calculate</p>
        ) : (
          <div className="space-y-1.5">
            <Row label="Base Amount" value={fmt(base)} />
            <Row label="VAT (7.5%)" value={fmt(vat)} negative />
            <Row label="Total Amount" value={fmt(total)} positive highlight />
          </div>
        )}
      </div>
    </div>
  );
}

// ------- WHT -------
function WhtTab() {
  const [type, setType] = useState(WHT_RATES[0].key);
  const [amount, setAmount] = useState('');
  const result: WhtCalculation | null =
    amount && Number(amount) > 0 ? calculateWht(type, Number(amount)) : null;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h3 className="font-semibold text-slate-900">Withholding Tax</h3>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Payment Type</label>
          <select value={type} onChange={e => setType(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]">
            {WHT_RATES.map(w => (
              <option key={w.key} value={w.key}>{w.label} — {(w.rate * 100).toFixed(0)}%</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Gross Amount (₦)</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]" />
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-900">
          <p className="font-semibold">Withholding Tax (WHT)</p>
          <p className="mt-1">Deducted at source by the payer, remitted to FIRS or State IRS. Acts as advance income tax payment.</p>
          <p className="mt-1">Most payment types: <strong>10%</strong></p>
          <p>Contracts &amp; Agency: <strong>5%</strong></p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">WHT Breakdown</h3>
        {!result ? (
          <p className="text-slate-400 text-sm text-center mt-10">Enter amount to calculate</p>
        ) : (
          <div className="space-y-1.5">
            <Row label="Payment Type" value={result.paymentType} />
            <Row label="Gross Amount" value={fmt(result.grossAmount)} />
            <Row label={`WHT (${pct(result.whtRate * 100)})`} value={fmt(result.whtAmount)} negative />
            <Row label="Net Amount Payable" value={fmt(result.netPayable)} positive highlight />
          </div>
        )}
      </div>
    </div>
  );
}

// ------- Main Page -------
type ActiveTab = 'paye' | 'cit' | 'vat' | 'wht';

export const TaxCalculatorPage: React.FC = () => {
  const [active, setActive] = useState<ActiveTab>('paye');
  const tabs: { key: ActiveTab; label: string }[] = [
    { key: 'paye', label: 'PAYE / Income Tax' },
    { key: 'cit',  label: 'Company Tax (CIT)' },
    { key: 'vat',  label: 'VAT' },
    { key: 'wht',  label: 'Withholding Tax' },
  ];

  return (
    <div className="min-h-screen bg-[#F0F3F5] pb-10">
      <div className="px-4 sm:px-6 py-6 mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Calculator className="w-7 h-7 text-[#FF8A2B]" />
          Nigerian Tax Calculator
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          PAYE · Company Income Tax · VAT · Withholding Tax — based on current FIRS regulations
        </p>
      </div>

      <div className="px-4 sm:px-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(t => <Tab key={t.key} label={t.label} active={active === t.key} onClick={() => setActive(t.key)} />)}
        </div>

        {active === 'paye' && <PayeTab />}
        {active === 'cit'  && <CitTab />}
        {active === 'vat'  && <VatTab />}
        {active === 'wht'  && <WhtTab />}

        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>Disclaimer:</strong> This calculator is for informational purposes only, based on FIRS regulations,
            PITA 2011, CITA, and Finance Acts up to 2023. Consult a qualified tax professional or FIRS for official assessments.
          </span>
        </div>
      </div>
    </div>
  );
};
