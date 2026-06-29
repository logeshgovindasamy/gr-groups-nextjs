/**
 * Search Results Page
 * Redesigned for Luxury Storefront Theme
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingBag, SearchX } from 'lucide-react';
import useCartStore from '@/store/useCartStore';
import toast from 'react-hot-toast';
import Link from 'next/link';

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
              (p.categories?.[0]?.name || p.category || '').toLowerCase().includes(q)
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
    const imageUrl = product.images && product.images.length > 0 ? (product.images[0].src || product.images[0]) : product.image || '';
    addToCart({
      id: product.id,
      name: product.name || product.title,
      price: parseFloat(product.price || 0),
      image: imageUrl,
      stock: product.stock_quantity ?? product.stock,
      qty: 1
    });
    toast.success(`${product.name || product.title} added to cart`);
  };

  return (
    <div className="bg-[#f5f3ef] min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold font-serif text-[#123026] mb-2">
            Search results for: <span className="text-[#b89d70]">"{query}"</span>
          </h1>
          {loading ? (
            <p className="text-[#6a7571] text-sm mb-8 font-semibold">Searching products...</p>
          ) : (
            <p className="text-[#6a7571] text-sm mb-8 font-semibold">{results.length} product{results.length !== 1 ? 's' : ''} found</p>
          )}
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-panel bg-white/70 border border-[#eae8e4]/60 p-4 rounded-2xl animate-pulse">
                <div className="aspect-square bg-[#eae8e4]/50 rounded-xl skeleton" />
                <div className="space-y-2 mt-4">
                  <div className="h-4 bg-[#eae8e4]/50 rounded skeleton w-3/4" />
                  <div className="h-3 bg-[#eae8e4]/50 rounded skeleton w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 glass-panel bg-white/70 border border-[#eae8e4]/60 rounded-2xl">
            <SearchX size={56} className="mx-auto text-[#6a7571]/40 mb-4" />
            <h2 className="text-2xl font-bold font-serif text-[#123026] mb-2">No products found</h2>
            <p className="text-[#6a7571] mb-6">Try a different search term or browse our collections.</p>
            <Link href="/products" className="btn-primary">Browse Products</Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((product, i) => {
              const imageUrl = product.images && product.images.length > 0 ? (product.images[0].src || product.images[0]) : product.image || '';
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-panel bg-white/70 border border-[#eae8e4]/60 p-4 rounded-2xl flex flex-col justify-between shadow-luxury transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-square bg-[#f4f2ee] rounded-xl overflow-hidden mb-4 border border-[#eae8e4]/50 p-2 flex items-center justify-center">
                    <div className="relative w-full h-full flex items-center justify-center">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name || product.title}
                          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl font-serif text-[#b89d70] bg-[#123026]/5 rounded-xl">
                          {(product.name || product.title || 'P').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {/* Hover Add to Cart overlay */}
                    <div className="absolute inset-0 bg-[#123026]/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-4 backdrop-blur-xs">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className="w-full bg-[#f5f3ef] text-[#123026] hover:bg-[#123026] hover:text-white py-2 rounded-lg font-semibold text-xs shadow-luxury transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <ShoppingBag size={14} /> Quick Add
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] text-[#b89d70] font-bold uppercase tracking-wider mb-1">{product.categories?.[0]?.name || product.category || 'Luxury'}</p>
                    <Link href={`/product/${product.slug || product.id}`}>
                      <h4 className="font-semibold font-serif text-[#123026] text-base group-hover:text-[#b89d70] transition-colors line-clamp-1">{product.name || product.title}</h4>
                    </Link>
                    <div className="flex justify-between items-center mt-2.5 pt-2.5 border-t border-[#eae8e4]">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-baseline gap-2">
                          {/* Discounted / member price */}
                          <span className={`font-bold ${product.isMemberPrice ? 'text-emerald-700' : 'text-[#123026]'}`}>
                            ${parseFloat(product.price || 0).toFixed(2)}
                          </span>
                          {/* Original price struck-through — only when a discount exists */}
                          {product.regularPrice && Number(product.regularPrice) > Number(product.price) && (
                            <span className="text-xs text-[#6a7571]/60 line-through">
                              ${Number(product.regularPrice).toFixed(2)}
                            </span>
                          )}
                        </div>
                        {/* {product.isMemberPrice && Number(product.regularPrice) > Number(product.price) && (
                          <span className="text-[10px] font-bold text-emerald-700 tracking-wide">
                            Member Price · {Math.round(((Number(product.regularPrice) - Number(product.price)) / Number(product.regularPrice)) * 100)}% off
                          </span>
                        )} */}
                      </div>
                      {product.average_rating ? (
                        <div className="flex items-center text-[#b89d70] text-xs gap-1 font-bold">
                          <Star size={12} fill="currentColor" />
                          <span>{parseFloat(product.average_rating).toFixed(1)}</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-[#b89d70] text-xs gap-1 font-bold">
                          <Star size={12} fill="currentColor" />
                          <span>5.0</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[60vh] bg-[#f5f3ef]">
        <div className="w-12 h-12 border-4 border-[#eae8e4] border-t-[#b89d70] rounded-full animate-spin" />
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
