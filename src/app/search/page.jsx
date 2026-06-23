/**
 * Search Results Page
 * Migrated from: React SearchPage.jsx
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingBag, SearchX } from 'lucide-react';
import useCartStore from '@/store/useCartStore';
import toast from 'react-hot-toast';
import Link from 'next/link';

const ALL_PRODUCTS = [
  { id: '1', name: 'Neon Stealth Hoodie', category: 'Streetwear', price: 149.0, rating: 4.9, description: 'Premium urban stealth hoodie with reflective neon accents.' },
  { id: '2', name: 'Obsidian Tech Jacket', category: 'Tech Wear', price: 229.0, rating: 4.9, description: 'Water-resistant tech jacket with magnetic closures.' },
  { id: '3', name: 'Phantom Runner Pro', category: 'Footwear', price: 189.0, rating: 4.7, description: 'Ultra-lightweight running shoes with carbon fiber plate.' },
  { id: '4', name: 'Midnight Velvet Blazer', category: 'Formal', price: 899.0, rating: 4.8, description: 'Italian velvet blazer with hand-stitched lapels.' },
  { id: '5', name: 'Heritage Leather Boots', category: 'Footwear', price: 649.0, rating: 4.7, description: 'Full-grain leather boots with Goodyear welt construction.' },
  { id: '6', name: 'Titanium Chronograph Watch', category: 'Accessories', price: 2499.0, rating: 5.0, description: 'Swiss-made automatic movement with sapphire crystal.' },
  { id: '7', name: 'Silk Pocket Square Set', category: 'Accessories', price: 149.0, rating: 4.6, description: 'Set of 5 hand-rolled silk pocket squares.' },
  { id: '8', name: 'Monogram Leather Wallet', category: 'Accessories', price: 299.0, rating: 4.5, description: 'Hand-embossed calfskin wallet with RFID protection.' },
  { id: '9', name: 'Merino Wool Turtleneck', category: 'Knitwear', price: 349.0, rating: 4.8, description: 'Ultra-fine merino wool turtleneck.' },
  { id: '10', name: 'Carbon Fiber Belt', category: 'Accessories', price: 179.0, rating: 4.4, description: 'Lightweight carbon fiber belt with titanium buckle.' },
];

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCartStore();

  useEffect(() => {
    async function performSearch() {
      if (!query) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch('/api/products?per_page=1000');
        if (res.ok) {
          const products = await res.json();
          const q = query.toLowerCase();
          const filtered = products.filter(
            (p) =>
              (p.name || p.title || '').toLowerCase().includes(q) ||
              (p.description || '').toLowerCase().includes(q) ||
              (p.category || '').toLowerCase().includes(q)
          );
          setResults(filtered);
        }
      } catch (error) {
        console.error('[Search performSearch]', error);
      } finally {
        setLoading(false);
      }
    }
    performSearch();
  }, [query]);

  const handleAddToCart = (product) => {
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
    <div className="container mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">
          Search results for: <span className="text-accent">"{query}"</span>
        </h1>
        {loading ? (
          <p className="text-textMuted mb-8">Searching products...</p>
        ) : (
          <p className="text-textMuted mb-8">{results.length} product{results.length !== 1 ? 's' : ''} found</p>
        )}
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="product-card animate-pulse">
              <div className="h-56 bg-surface rounded-xl skeleton" />
              <div className="space-y-2 mt-4">
                <div className="h-4 bg-surface rounded skeleton w-3/4" />
                <div className="h-3 bg-surface rounded skeleton w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <SearchX size={56} className="mx-auto text-textMuted mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No products found</h2>
          <p className="text-textMuted mb-6">Try a different search term or browse our collections.</p>
          <Link href="/products" className="btn-primary">Browse Products</Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -8 }}
              className="product-card group"
            >
              <div className="h-56 bg-surface rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary/20 to-accent/20 flex items-center justify-center">
                    <Star size={20} className="text-accent/60" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-white text-black py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={16} /> Quick Add
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs text-accent/80 font-medium uppercase tracking-wider mb-1">{product.category}</p>
                <h4 className="font-medium text-lg">{product.name}</h4>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                  <div className="flex items-center text-yellow-400 text-sm gap-1">
                    <Star size={14} fill="currentColor" />
                    <span className="text-textLight">{product.rating}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-white/10 border-t-accent rounded-full animate-spin" /></div>}>
      <SearchResults />
    </Suspense>
  );
}
