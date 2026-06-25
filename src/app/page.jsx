/**
 * Home Page
 * Migrated from: React Home.jsx
 * Features: Hero section with gradient backgrounds, trending products grid
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Sparkles, Zap, Shield, ShoppingBag } from 'lucide-react';
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
    { icon: Sparkles, title: 'Curated Selection',  desc: '10,000+ premium items from 50+ global brands' },
    { icon: Zap,      title: 'Express Delivery',   desc: 'Free next-day shipping on orders over $100' },
    { icon: Shield,   title: 'Authenticated',      desc: 'Every item verified for authenticity guaranteed' },
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
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] md:h-[90vh] flex items-center pt-32 pb-20 md:py-0 overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/10 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-6 z-10"
          >
            <span className="text-accent font-medium tracking-wider uppercase text-sm flex items-center gap-2">
              <Sparkles size={16} /> {hero.badge}
            </span>
            <h1 className="text-5xl md:text-7xl font-medium tracking-tight leading-[1.1]">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">
                {hero.title}
              </span>
            </h1>
            <p className="text-lg text-textMuted max-w-md leading-relaxed">
              {hero.subtitle}
            </p>
            <div className="flex gap-4 mt-4">
              <Link href="/categories" className="btn-primary flex items-center gap-2 w-fit">
                {hero.exploreBtn} <ArrowRight size={18} />
              </Link>
              <Link href="/products" className="btn-outline">
                {hero.trendsBtn}
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[500px] w-full rounded-2xl overflow-hidden glass-panel flex items-center justify-center group cursor-pointer"
          >
            {/* Animated gradient background mesh */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-accent/5 to-surface opacity-95 transition-all duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-radial-gradient from-accent/5 to-transparent blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />

            <div className="z-10 text-center px-8">
              {/* Spinning / Glowing Logo Container */}
              <div className="w-44 h-44 mx-auto rounded-full border border-white/20 flex items-center justify-center backdrop-blur-xl mb-8 relative group-hover:scale-105 group-hover:border-accent/40 transition-all duration-500 shadow-2xl">
                {/* Outer spin rings */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary via-accent to-secondary opacity-15 animate-spin" style={{ animationDuration: '12s' }} />
                <div className="absolute inset-2 rounded-full border border-dashed border-accent/20 animate-spin" style={{ animationDuration: '20s', animationDirection: 'reverse' }} />
                
                {/* Inner glowing core */}
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg relative overflow-hidden group-hover:rotate-12 transition-transform duration-500">
                  {/* Subtle inner reflection */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                  <ShoppingBag size={48} className="text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.4)] animate-pulse" />
                </div>
              </div>

              {/* Brand Typography */}
              <h3 className="text-3xl font-light tracking-[0.25em] text-primary transition-colors duration-300 group-hover:text-accent">
                GR GROUPS
              </h3>
              <div className="h-px w-20 bg-gradient-to-r from-transparent via-accent/40 to-transparent mx-auto my-4" />
              <p className="text-textMuted tracking-widest uppercase text-[10px]">
                {hero.luxuryTag}
              </p>
              <p className="text-secondary font-medium tracking-[0.1em] text-xs mt-4 uppercase bg-white/5 border border-white/10 px-4 py-1.5 rounded-full inline-block backdrop-blur-md">
                {hero.eleganceTag}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass-panel rounded-2xl p-6 text-center hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <feature.icon size={22} className="text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-textMuted text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
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
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <button
                      onClick={() => addToCartHandler(product)}
                      className="w-full bg-white text-black py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors"
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
