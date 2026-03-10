import React from 'react';
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
  return <footer className="bg-slate-950 text-slate-300 pt-24 pb-12 border-t border-slate-800 relative overflow-hidden">
      {/* Top Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF8A2B] via-[#FF6B00] to-amber-500"></div>

      {/* Background Glow */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FF8A2B]/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-2xl mb-6">
              <Hexagon className="fill-[#FF8A2B] text-[#FF8A2B]" />
              MyBizTools
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-xs">
              The all-in-one business operating system for African
              entrepreneurs. Run your business smarter, faster, and
              professionally.
            </p>
            <div className="flex gap-4">
              {SOCIAL_LINKS.map(({ Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-[#FF8A2B] hover:text-white transition-all duration-300 hover:-translate-y-1">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Quick Links</h3>
            <ul className="space-y-4 text-sm">
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
            <h3 className="text-white font-bold mb-6 text-lg">Popular Tools</h3>
            <ul className="space-y-4 text-sm">
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
            <h3 className="text-white font-bold mb-6 text-lg">Stay Updated</h3>
            <p className="text-slate-400 text-sm mb-4">
              Get the latest business tips and tool updates.
            </p>
            <div className="flex gap-2">
              <input type="email" placeholder="Enter your email" className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 w-full" />
              <button className="bg-[#FF8A2B] hover:bg-[#FF6B00] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
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