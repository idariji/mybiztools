import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Hexagon } from 'lucide-react';

export function TermsPage() {
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
          <h1 className="text-4xl font-bold mb-2">Terms & Conditions</h1>
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
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using MyBizTools ("the Service"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the Service. MyBizTools is operated by Idariji Concept.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Description of Service</h2>
            <p>MyBizTools provides a suite of business tools including invoice generation, receipt creation, quotation management, payslip generation, budget tracking, tax calculation, business card design, social media planning, and an AI-powered assistant (DEDA). The Service is provided on a subscription basis with a free tier available.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. User Accounts</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>You must provide accurate and complete information when creating an account.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You are responsible for all activities that occur under your account.</li>
              <li>You must notify us immediately of any unauthorised use of your account.</li>
              <li>Accounts are for individual use only and may not be shared with others.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Subscription Plans & Payments</h2>
            <p className="mb-3">MyBizTools offers Free, Pro, and Enterprise plans. Paid plans are billed in Nigerian Naira (₦) on a monthly or yearly basis.</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Payments are processed securely via Monipoint.</li>
              <li>Subscriptions auto-renew unless cancelled before the renewal date.</li>
              <li>Refunds are handled on a case-by-case basis — contact support within 7 days of a charge.</li>
              <li>We reserve the right to change pricing with 30 days' notice.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Use the Service for any unlawful purpose or in violation of any regulations.</li>
              <li>Resell, redistribute, or sublicense access to the Service.</li>
              <li>Attempt to gain unauthorised access to any part of the Service.</li>
              <li>Use automated tools to scrape or extract data from the Service.</li>
              <li>Upload malicious code, viruses, or harmful content.</li>
              <li>Use the AI assistant (DEDA) to generate illegal or harmful content.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Intellectual Property</h2>
            <p>All content, features, and functionality of MyBizTools — including but not limited to text, graphics, logos, and software — are owned by Idariji Concept and protected by applicable intellectual property laws. Documents you create using the Service remain your property.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Data & Privacy</h2>
            <p>Your use of the Service is also governed by our <button onClick={() => navigate('/privacy')} className="text-[#FF8A2B] font-semibold hover:underline">Privacy Policy</button>. By using MyBizTools, you consent to the collection and use of your data as described therein.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Disclaimers</h2>
            <p className="mb-3">The Service is provided "as is" without warranties of any kind. In particular:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Tax calculations are for guidance only and do not constitute professional tax advice.</li>
              <li>AI-generated content from DEDA should be reviewed before use.</li>
              <li>We do not guarantee uninterrupted or error-free operation of the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">9. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, Idariji Concept shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to loss of data, loss of profits, or business interruption.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">10. Termination</h2>
            <p>We reserve the right to suspend or terminate your account at any time for violation of these Terms. You may cancel your account at any time from your account settings. Upon termination, your right to use the Service ceases immediately.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">11. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes shall be subject to the exclusive jurisdiction of the courts of Nigeria.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">12. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at <a href="mailto:support@mybiztools.com" className="text-[#FF8A2B] font-semibold hover:underline">support@mybiztools.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
