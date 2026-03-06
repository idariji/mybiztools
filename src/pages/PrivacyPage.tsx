import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Hexagon } from 'lucide-react';

export function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1e3a8a] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Hexagon className="w-8 h-8 fill-[#FF8A2B] text-[#FF8A2B]" />
            <span className="text-xl font-bold">MyBizTools</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-blue-200">Last updated: January 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-[#FF8A2B] transition-colors mb-8 font-medium"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8 text-slate-700">

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Introduction</h2>
            <p>Idariji Concept ("we", "us", or "our") operates MyBizTools. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service. Please read this policy carefully.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Information We Collect</h2>
            <p className="mb-3 font-medium">Account Information</p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Name, email address, and password when you register.</li>
              <li>Business name and contact details you provide in your profile.</li>
            </ul>
            <p className="mb-3 font-medium">Usage Data</p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Documents you create (invoices, receipts, quotations, payslips, etc.).</li>
              <li>Features you use and how frequently you use them.</li>
              <li>Device information, browser type, and IP address.</li>
            </ul>
            <p className="mb-3 font-medium">Payment Information</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Payment transactions are processed by Monipoint. We do not store full card details.</li>
              <li>We retain transaction references and subscription status.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To provide, operate, and improve the Service.</li>
              <li>To process payments and manage your subscription.</li>
              <li>To send transactional emails (verification, password reset, invoices).</li>
              <li>To send service updates and promotional communications (you may opt out).</li>
              <li>To detect and prevent fraud or abuse.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Data Storage & Security</h2>
            <p className="mb-3">Your data is stored on secure cloud servers. We implement industry-standard security measures including:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>HTTPS encryption for all data in transit.</li>
              <li>Passwords are hashed and never stored in plain text.</li>
              <li>JWT-based authentication with session timeouts.</li>
              <li>Regular security audits and monitoring.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Data Sharing</h2>
            <p className="mb-3">We do not sell your personal data. We may share your information with:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Payment processors</strong> (Monipoint) to complete transactions.</li>
              <li><strong>Email providers</strong> to deliver transactional emails.</li>
              <li><strong>Analytics tools</strong> to understand usage patterns (anonymised).</li>
              <li><strong>Law enforcement</strong> when required by law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Cookies</h2>
            <p>We use cookies and similar technologies to maintain your session, remember your preferences, and analyse usage. You can control cookies through your browser settings, though disabling them may affect Service functionality.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Access</strong> the personal data we hold about you.</li>
              <li><strong>Correct</strong> inaccurate or incomplete data.</li>
              <li><strong>Delete</strong> your account and associated data.</li>
              <li><strong>Export</strong> your data in a portable format.</li>
              <li><strong>Opt out</strong> of marketing communications at any time.</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, contact us at <a href="mailto:support@mybiztools.com" className="text-[#FF8A2B] font-semibold hover:underline">support@mybiztools.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Data Retention</h2>
            <p>We retain your data for as long as your account is active. Upon account deletion, we will delete your personal data within 30 days, except where retention is required by law.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">9. Children's Privacy</h2>
            <p>MyBizTools is not intended for users under 18 years of age. We do not knowingly collect data from minors. If you believe a minor has created an account, please contact us.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by email or via a notice in the Service. Continued use of the Service after changes constitutes your acceptance.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">11. Contact Us</h2>
            <p>For any privacy-related questions or requests, please contact us at <a href="mailto:support@mybiztools.com" className="text-[#FF8A2B] font-semibold hover:underline">support@mybiztools.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
