/**
 * Categories Page
 * Redesigned for Luxury Storefront Theme
 */

'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Shirt, Watch, Footprints, Gem, Scissors, Briefcase } from 'lucide-react';

const categories = [
  { name: 'Streetwear', description: 'Urban fashion that pushes boundaries.', icon: Shirt, count: 48, gradient: 'from-[#123026] to-[#b89d70]' },
  { name: 'Tech Wear', description: 'Where function meets futurism.', icon: Briefcase, count: 32, gradient: 'from-[#1b4335] to-[#c9b083]' },
  { name: 'Footwear', description: 'Limited drops to everyday essentials.', icon: Footprints, count: 56, gradient: 'from-[#123026] to-[#c9b083]' },
  { name: 'Formal', description: 'Tailored perfection for the distinguished.', icon: Scissors, count: 24, gradient: 'from-[#1b4335] to-[#b89d70]' },
  { name: 'Accessories', description: 'Watches, wallets, and finishing touches.', icon: Watch, count: 72, gradient: 'from-[#123026] to-[#b89d70]' },
  { name: 'Knitwear', description: 'Premium merino, cashmere, and wool.', icon: Gem, count: 18, gradient: 'from-[#1b4335] to-[#c9b083]' },
];

function CategoriesContent() {
  return (
    <div className="container mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold font-serif text-[#123026] mb-4">
          Shop by{" "}
          <span className="text-[#b89d70]">
            Category
          </span>
        </h1>
        <p className="text-[#6a7571] text-lg max-w-2xl mx-auto">
          Explore our curated collections, crafted with meticulous attention to detail.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat, i) => (
          <motion.div key={cat.name} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Link href={`/products?category=${encodeURIComponent(cat.name)}`}>
              <div className="group glass-panel rounded-2xl p-8 transition-all duration-500 hover:-translate-y-3 hover:shadow-luxury relative overflow-hidden bg-white/70 border border-[#eae8e4]/60">
                <div className={`absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br ${cat.gradient} rounded-full blur-[60px] opacity-10 group-hover:opacity-25 transition-opacity duration-500`} />
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                  <cat.icon size={28} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold font-serif text-[#123026] mb-2 group-hover:text-[#b89d70] transition-colors">{cat.name}</h3>
                <p className="text-[#6a7571] text-sm leading-relaxed mb-4">{cat.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#123026] bg-[#123026]/5 px-3 py-1 rounded-full font-semibold">
                    {cat.count} Products
                  </span>
                  <span className="flex items-center gap-1 text-[#b89d70] text-sm font-semibold group-hover:gap-3 transition-all">
                    Explore <ArrowRight size={16} />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-20">
        <p className="text-[#6a7571] mb-4">Looking for something specific?</p>
        <Link href="/products" className="inline-flex items-center gap-2 bg-[#123026] hover:bg-[#1b4335] text-white font-bold px-6 py-3 rounded-full shadow-luxury transition-all">
          Browse All Products <ArrowRight size={18} />
        </Link>
      </motion.div>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <div className="bg-[#f5f3ef] min-h-screen pt-28 pb-16">
      <Suspense fallback={<div className="text-center py-24 text-[#6a7571]">Loading collections...</div>}>
        <CategoriesContent />
      </Suspense>
    </div>
  );
}
