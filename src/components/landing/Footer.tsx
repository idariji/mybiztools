import { Facebook, Twitter, Linkedin, Instagram, Hexagon, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const SOCIAL_LINKS = [
  { Icon: Twitter, href: 'https://twitter.com/mybiztools', label: 'Twitter' },
  { Icon: Linkedin, href: 'https://linkedin.com/company/mybiztools', label: 'LinkedIn' },
  { Icon: Instagram, href: 'https://instagram.com/mybiztools', label: 'Instagram' },
  { Icon: Facebook, href: 'https://facebook.com/mybiztools', label: 'Facebook' },
];

const QUICK_LINKS = [
  { label: 'Home', to: '/', external: false },
  { label: 'Features', to: '/#features', external: false },
  { label: 'Pricing', to: '/#pricing', external: false },
  { label: 'Contact', to: 'mailto:support@mybiztools.app', external: true },
];

const TOOL_LINKS = [
  { label: 'Invoice Generator', to: '/login' },
  { label: 'Receipt Maker', to: '/login' },
  { label: 'Tax Calculator', to: '/login' },
  { label: 'Budget Tracker', to: '/login' },
  { label: 'DEDA AI Assistant', to: '/login' },
];

export function Footer() {
  return <footer className="bg-slate-950 text-slate-300 pt-16 sm:pt-24 pb-10 sm:pb-12 border-t border-slate-800 relative overflow-hidden">
      {/* Top Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF8A2B] via-[#FF6B00] to-amber-500"></div>

      {/* Background Glow */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FF8A2B]/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-10 sm:mb-16">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 text-white font-bold text-xl sm:text-2xl mb-5 sm:mb-6">
              <Hexagon className="fill-[#FF8A2B] text-[#FF8A2B]" />
              MyBizTools
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 sm:mb-8 max-w-xs">
              The all-in-one business operating system for African
              entrepreneurs. Run your business smarter, faster, and
              professionally.
            </p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map(({ Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="w-11 h-11 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-[#FF8A2B] hover:text-white transition-all duration-300 hover:-translate-y-1">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-5 sm:mb-6 text-base sm:text-lg">Quick Links</h3>
            <ul className="space-y-3 sm:space-y-4 text-sm">
              {QUICK_LINKS.map(({ label, to, external }) => (
                <li key={label}>
                  {external ? (
                    <a href={to} className="hover:text-[#FF8A2B] transition-colors flex items-center gap-2 group">
                      <span className="w-1 h-1 rounded-full bg-[#FF8A2B] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {label}
                    </a>
                  ) : (
                    <Link to={to} className="hover:text-[#FF8A2B] transition-colors flex items-center gap-2 group">
                      <span className="w-1 h-1 rounded-full bg-[#FF8A2B] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-white font-bold mb-5 sm:mb-6 text-base sm:text-lg">Popular Tools</h3>
            <ul className="space-y-3 sm:space-y-4 text-sm">
              {TOOL_LINKS.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="hover:text-[#FF8A2B] transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-[#FF8A2B] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-bold mb-5 sm:mb-6 text-base sm:text-lg">Stay Updated</h3>
            <p className="text-slate-400 text-sm mb-4">
              Get the latest business tips and tool updates.
            </p>
            <div className="flex gap-2">
              <input type="email" placeholder="Enter your email" className="bg-slate-900 border border-slate-800 rounded-lg px-3 sm:px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF8A2B] w-full min-w-0" />
              <button className="bg-[#FF8A2B] hover:bg-[#FF6B00] text-white px-3 sm:px-4 py-2.5 rounded-lg text-sm font-bold transition-colors shrink-0">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6 sm:pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-500 text-center sm:text-left">
          <p>© 2025 MyBizTools. All rights reserved. &nbsp;·&nbsp; <Link to="/terms" className="hover:text-[#FF8A2B] transition-colors">Terms</Link> &nbsp;·&nbsp; <Link to="/privacy" className="hover:text-[#FF8A2B] transition-colors">Privacy</Link></p>
          <p className="flex items-center gap-1">
            Powered by{' '}
            <span className="text-slate-300 font-medium">Idariji Concept</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500 ml-1" />
          </p>
        </div>
      </div>
    </footer>;
}
