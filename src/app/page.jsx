/**
 * Home Page
 * Migrated from: React Home.jsx
 * Features: Hero section with gradient backgrounds, trending products grid
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Sparkles, Zap, Shield, ShoppingBag, Award, Gem, Headphones } from 'lucide-react';
import Link from 'next/link';
import useCartStore from '@/store/useCartStore';
import toast from 'react-hot-toast';
import useLanguageStore from '@/store/useLanguageStore';

const trendingProducts = [
  { id: '1', name: 'Neon Stealth Hoodie V1', category: 'Urban Outerwear', price: 149.0, rating: 4.9, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop' },
  { id: '2', name: 'Neon Stealth Hoodie V2', category: 'Urban Outerwear', price: 149.0, rating: 4.8, image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop' },
  { id: '3', name: 'Obsidian Tech Jacket', category: 'Tech Wear', price: 229.0, rating: 4.9, image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=600&auto=format&fit=crop' },
  { id: '4', name: 'Phantom Runner Pro', category: 'Footwear', price: 189.0, rating: 4.7, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop' },
];

export default function HomePage() {
  const { addToCart } = useCartStore();
  const { locale } = useLanguageStore();

  // Dynamic hero content from WordPress
  const [heroContent, setHeroContent] = useState(null);
  // Dynamic products from WooCommerce
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Feature cards — static branding text
  const features = [
    { icon: Award,      title: 'Premium Quality',  desc: 'Handpicked products of uncompromising quality.' },
    { icon: Gem,        title: 'Timeless Design',  desc: 'Elegance that transcends trends and time.' },
    { icon: Shield,     title: 'Secure Shopping',  desc: 'Advanced security for a worry-free experience.' },
    { icon: Headphones, title: 'Dedicated Support',desc: 'We\'re here to help, whenever you need us.' },
  ];

  // Fetch WordPress page content for hero
  useEffect(() => {
    async function loadHero() {
      try {
        const res = await fetch(`/api/wp-page?slug=home&lang=${locale}`);
        if (res.ok) {
          const data = await res.json();
          setHeroContent(data);
        }
      } catch (err) {
        // Hero falls back to English defaults below
        console.warn('[HomePage] WordPress hero fetch failed:', err.message);
      }
    }
    loadHero();
  }, [locale]);

  // Fetch products from WooCommerce
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await fetch(`/api/products?lang=${locale}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.slice(0, 8));
        }
      } catch (err) {
        console.error('Failed to fetch products for landing page:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [locale]);

  // Hero text: WordPress content takes priority, falls back to English defaults
  const hero = {
    badge:    heroContent?.acf?.hero_badge    || 'Next Generation Shopping',
    title:    heroContent?.acf?.hero_title    || 'Redefining Luxury Aesthetics',
    subtitle: heroContent?.acf?.hero_subtitle || 'Experience the future of e-commerce. Premium products tailored for the modern individual with impeccable taste.',
    exploreBtn: heroContent?.acf?.explore_btn || 'Explore Collection',
    trendsBtn:  heroContent?.acf?.trends_btn  || 'View Trends',
    luxuryTag:  heroContent?.acf?.luxury_tag  || 'Luxury E-Commerce',
    eleganceTag:heroContent?.acf?.elegance_tag|| 'Redefining Elegance',
    trendingTitle: heroContent?.acf?.trending_title || 'Trending Now',
    trendingSub:   heroContent?.acf?.trending_sub   || 'The most coveted items of the season',
    viewAll:    heroContent?.acf?.view_all    || 'View All',
    quickAdd:   heroContent?.acf?.quick_add   || 'Quick Add',
    ctaTitle:   heroContent?.acf?.cta_title   || 'Join the Elite',
    ctaSub:     heroContent?.acf?.cta_sub     || 'Create an account to unlock exclusive deals, early access to drops, and personalized recommendations.',
    ctaBtn:     heroContent?.acf?.cta_btn     || 'Get Started',
    newBadge:   heroContent?.acf?.new_badge   || 'New',
  };

  const addToCartHandler = (product) => {
    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : product.image || '';
    addToCart({ 
      id: product.id, 
      name: product.name || product.title, 
      price: product.price, 
      image: imageUrl,
      stock: product.stock,
      qty: 1 
    });
    toast.success(`${product.name || product.title} added to cart`);
  };

  return (
    <div className="w-full min-h-screen bg-background text-[#123026]">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center pt-28 pb-16 md:py-0 overflow-hidden bg-transparent">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-10 left-10 w-[450px] h-[450px] bg-[#b89d70]/8 rounded-full blur-[120px] -z-10 animate-pulse-slow" />
        <div className="absolute bottom-10 right-10 w-[550px] h-[550px] bg-[#123026]/6 rounded-full blur-[140px] -z-10 animate-pulse-slow" style={{ animationDelay: '2s' }} />



        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center z-10">
          {/* Hero Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f4f2ee] border border-[#e5dec9] text-[#a4865d] text-[10px] md:text-xs font-bold tracking-widest uppercase w-fit">
              <span className="text-[#b89d70] text-sm leading-none mt-[-2px]">✦</span> {hero.badge}
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-light tracking-tight leading-[1.1] text-[#123026] font-serif">
              Redefining <br className="hidden md:block" />
              <span className="italic font-normal text-[#123026]/95">Luxury</span> Aesthetics
            </h1>

            {/* Gold Horizontal Line */}
            <div className="h-[2px] w-24 bg-[#b89d70] my-2" />
            
            <p className="text-sm md:text-base text-[#6a7571] max-w-md leading-relaxed font-sans font-light">
              {hero.subtitle}
            </p>
            
            <div className="flex items-center gap-4 mt-4">
              <Link href="/categories" className="group btn-primary flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300">
                {hero.exploreBtn} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/products" className="btn-outline px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300">
                {hero.trendsBtn}
              </Link>
            </div>
          </motion.div>

          {/* Hero Right Visuals */}
          <div className="relative w-full flex items-center justify-center">


            {/* The Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 35 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              className="relative h-[480px] md:h-[520px] w-full rounded-[32px] overflow-hidden border border-white/50 shadow-luxury bg-white/20 backdrop-blur-xl flex flex-col justify-between p-12 group cursor-pointer"
            >
              {/* Soft wave patterns inside the card */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#123026]/5 via-[#b89d70]/4 to-white/10 -z-10" />
              <svg className="absolute inset-0 w-full h-full text-[#123026]/4 pointer-events-none -z-10" viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M-50,320 C80,290 120,440 270,390 C370,360 410,470 500,430" stroke="currentColor" strokeWidth="1.5" />
                <path d="M-50,270 C60,230 160,390 260,340 C360,300 400,430 500,390" stroke="currentColor" strokeWidth="1.0" strokeDasharray="3 3" />
              </svg>



              {/* Central Branding Medallion */}
              <div className="m-auto flex flex-col items-center text-center z-10 select-none">
                {/* Outer Translucent Ring */}
                <div className="w-44 h-44 md:w-48 md:h-48 rounded-full bg-white/35 border border-white/30 backdrop-blur-md flex items-center justify-center shadow-xl mb-6 relative animate-float">
                  {/* Inner Green/Gold Medallion */}
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-[#123026] border-[2.5px] border-[#b89d70] flex items-center justify-center shadow-2xl relative transition-transform duration-500 hover:scale-105">
                    <ShoppingBag size={36} className="text-[#b89d70] stroke-[1.2]" />
                  </div>
                </div>

                {/* Typography */}
                <h3 className="text-xl md:text-2xl font-light tracking-[0.25em] text-[#123026] uppercase">
                  GR GROUPS
                </h3>
                <div className="h-[1.5px] w-12 bg-[#b89d70]/40 my-3" />
                <p className="text-[9px] font-bold tracking-[0.2em] text-[#6a7571] uppercase">
                  {hero.luxuryTag}
                </p>
                <p className="text-[10px] font-bold tracking-[0.15em] text-[#123026] mt-4 uppercase border border-[#123026]/10 px-4 py-1.5 rounded-full bg-white/40 shadow-sm backdrop-blur-md">
                  {hero.eleganceTag}
                </p>
              </div>

              {/* 3D Pedestal in the Card bottom */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-20 flex flex-col justify-end z-10 pointer-events-none">
                {/* Cylinder Top Face (elliptical shape) */}
                <div className="w-full h-8 bg-gradient-to-r from-[#faf9f6] via-white to-[#f0efe9] border border-[#b89d70]/50 rounded-[100%/32px] shadow-sm relative flex items-center justify-center">
                  {/* Gold Inner Circle rim */}
                  <div className="absolute inset-[3px] border border-[#b89d70]/30 rounded-[100%/30px]" />
                </div>
                {/* Cylinder Body */}
                <div className="w-full h-12 bg-gradient-to-b from-white via-[#f3f2eb] to-[#e6e5dd] border-x border-b border-[#b89d70]/20 rounded-b-[40%] shadow-[0_15px_35px_rgba(18,48,38,0.06)] relative overflow-hidden">
                  {/* Marble Texture overlay */}
                  <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/white-marble.png')]" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 container mx-auto px-6 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="glass-panel rounded-[28px] p-6 md:p-8 bg-white/70 border border-[#eae8e4]/60 shadow-luxury max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-4 text-left border-b border-[#eae8e4]/40 last:border-b-0 pb-5 last:pb-0 lg:pb-0 lg:border-b-0 lg:border-r border-[#eae8e4]/40 lg:last:border-r-0 lg:px-4 lg:first:pl-0 lg:last:pr-0">
              <div className="w-12 h-12 rounded-full bg-[#f4f2ee] border border-[#e5dec9]/20 flex items-center justify-center text-[#123026] flex-shrink-0 shadow-sm">
                <feature.icon size={20} className="stroke-[1.5]" />
              </div>
              <div className="flex flex-col">
                <h4 className="font-semibold text-sm text-[#123026] font-sans">{feature.title}</h4>
                <p className="text-xs text-[#6a7571] mt-0.5 leading-snug font-sans font-light">{feature.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Trending Section */}
      <section className="py-24 container mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">{hero.trendingTitle}</h2>
            <p className="text-textMuted">{hero.trendingSub}</p>
          </div>
          <Link
            href="/products"
            className="text-accent hover:text-white transition-colors flex items-center gap-2 text-sm"
          >
            {hero.viewAll} <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="product-card animate-pulse">
                <div className="h-64 bg-surface rounded-xl skeleton" />
                <div className="space-y-2 mt-4">
                  <div className="h-4 bg-surface rounded skeleton w-3/4" />
                  <div className="h-3 bg-surface rounded skeleton w-1/2" />
                  <div className="h-5 bg-surface rounded skeleton w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-textMuted">No products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="product-card group"
              >
                <div className="h-64 bg-surface rounded-xl overflow-hidden relative">
                  {product.isNewArrival && (
                    <div className="absolute top-3 left-3 z-10 bg-primary/20 text-accent px-2 py-1 rounded text-xs backdrop-blur-md border border-primary/30">
                      {hero.newBadge}
                    </div>
                  )}
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name || product.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name || product.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary/20 to-accent/20 flex items-center justify-center">
                          <Star size={24} className="text-accent/60" />
                        </div>
                      </div>
                    </>
                  )}
                  <div className="absolute inset-0 bg-[#123026]/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <button
                      onClick={() => addToCartHandler(product)}
                      className="w-full bg-white text-[#123026] py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#b89d70] hover:text-white transition-colors duration-300"
                    >
                      {hero.quickAdd}
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="font-medium text-lg">{product.name || product.title}</h4>
                  <p className="text-textMuted text-sm mb-2">{product.category || "Uncategorized"}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-textLight">${Number(product.price || 0).toFixed(2)}</span>
                    <div className="flex items-center text-yellow-400 text-sm gap-1">
                      <Star size={14} fill="currentColor" />
                      <span className="text-textLight">{product.rating || product.ratings || 0}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="py-20 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-panel rounded-3xl p-12 md:p-20 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-[80px]" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {hero.ctaTitle}
            </h2>
            <p className="text-textMuted text-lg max-w-lg mx-auto mb-8">
              {hero.ctaSub}
            </p>
            <Link href="/register" className="btn-primary inline-flex items-center gap-2">
              {hero.ctaBtn} <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
