import { motion } from 'framer-motion';
import { Store, Link, Eye, ShoppingBag, Share2, Globe, ArrowRight, Sparkles } from 'lucide-react';
import { DashboardLayout } from '../layout/DashboardLayout';

export function StorefrontPage() {
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-slate-900">Digital Storefront</h1>
          <div className="h-1 w-16 bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] rounded-full mt-2 mb-1" />
          <p className="text-sm text-slate-500">Your public-facing store page for customers to discover and order from you</p>
        </div>

        {/* Coming Soon Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] rounded-2xl p-6 text-white shadow-[0_8px_30px_rgba(255,138,43,0.3)]"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">Coming Soon</h2>
              <p className="text-white/90 text-sm">
                Your digital storefront is being built. Soon you'll have a shareable URL like
                <span className="font-mono font-bold"> mybiztools.ng/store/your-business</span> where
                customers can browse your products and place orders directly.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Feature Preview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Globe, title: 'Unique Storefront URL', desc: 'Get a shareable link like mybiztools.ng/store/yourbusiness for customers to find you online.', color: 'from-blue-400 to-blue-600' },
            { icon: ShoppingBag, title: 'Product Catalog', desc: 'Showcase your products with photos, prices, and stock status. Customers can browse anytime.', color: 'from-purple-400 to-purple-600' },
            { icon: Share2, title: 'WhatsApp Orders', desc: 'New customer orders trigger an instant WhatsApp notification to your phone number.', color: 'from-green-400 to-green-600' },
            { icon: Eye, title: 'Storefront Analytics', desc: 'See how many people viewed your store, which products are popular, and conversion rates.', color: 'from-orange-400 to-orange-600' },
            { icon: Link, title: 'SEO Optimised', desc: 'Your storefront is optimised for Google so new customers can find your business online.', color: 'from-rose-400 to-rose-600' },
            { icon: Store, title: 'No Website Needed', desc: 'Works as your complete online presence. Share on WhatsApp, Instagram, Facebook — anywhere.', color: 'from-teal-400 to-teal-600' },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-100"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 shadow-lg`}>
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
              <p className="text-sm text-slate-500">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Notify Me CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div>
            <h3 className="font-semibold text-slate-900">Be first to know when it launches</h3>
            <p className="text-sm text-slate-500 mt-0.5">We'll notify you as soon as your storefront is ready to activate.</p>
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all whitespace-nowrap">
            Notify Me <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
