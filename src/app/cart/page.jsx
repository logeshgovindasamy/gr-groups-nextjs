'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ArrowRight, Plus, Minus, ShoppingBag } from 'lucide-react';
import useCartStore from '@/store/useCartStore';
import toast from 'react-hot-toast';
import CouponSection from '@/components/cart/CouponSection';

export default function CartPage() {
  const { cartItems, itemsPrice, shippingPrice, taxPrice, totalPrice, discountPrice, appliedCoupons, cartToken, removeFromCart, updateQty, clearCart, applyDiscount } =
    useCartStore();
  const router = useRouter();

  const handleCartUpdate = (updatedCart, couponCode) => {
    // WooCommerce Store API returns totals in minor units (e.g. cents).
    const discountCents = updatedCart.totals?.total_discount || 0;
    const discountAmount = Number(discountCents) / Math.pow(10, updatedCart.totals?.currency_minor_unit || 2);
    const couponApplied = couponCode || updatedCart.coupons?.[0]?.code || '';
    applyDiscount(discountAmount, couponApplied, updatedCart.cartToken);
  };

  const checkoutHandler = () => {
    const outOfStockItems = cartItems.filter(item => item.stock !== undefined && (item.stock <= 0 || item.qty > item.stock));

    if (outOfStockItems.length > 0) {
      toast.error("Please remove out of stock items to proceed: {items}".replace('{items}', outOfStockItems.map(i => i.title || i.name).join(', ')));
      return;
    }

    router.push('/checkout');
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-24 glass-panel rounded-2xl">
            <ShoppingBag size={56} className="mx-auto mb-4 text-textMuted/40" />
            <p className="text-textMuted text-lg mb-6">Your cart is currently empty.</p>
            <Link href="/" className="btn-primary">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="md:col-span-2 space-y-4">
              <AnimatePresence mode="popLayout">
                {cartItems.map((item) => (
                  <motion.div
                    layout
                    key={`${item.id}-${item.variationId || ""}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    className="glass-panel p-4 md:p-5 rounded-xl flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-16 h-16 bg-surface rounded-lg flex items-center justify-center font-bold text-accent text-xl flex-shrink-0 overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.title || item.name} className="w-full h-full object-cover" />
                        ) : (
                          (item.title || item.name || 'P').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-lg truncate">{item.title || item.name}</h3>
                        
                        {/* Display Selected Attributes */}
                        {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {Object.entries(item.selectedAttributes).map(([name, opt]) => (
                              <span key={name} className="inline-block bg-white/10 px-1.5 py-0.5 rounded text-[10px] text-slate-300 font-bold uppercase">
                                {name}: <span className="text-white font-extrabold">{opt}</span>
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-accent font-semibold mt-1">${(item.price || 0).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-surface/50 rounded-lg px-2 py-1">
                        <button
                          onClick={() => updateQty(item.id, item.variationId, item.qty - 1)}
                          className="text-textMuted hover:text-white transition-colors p-0.5"
                          disabled={item.qty <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-medium text-sm">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, item.variationId, item.qty + 1)}
                          className="text-textMuted hover:text-white transition-colors p-0.5"
                          disabled={item.stock !== undefined && item.qty >= item.stock}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Total for item & Stock Warning */}
                      <div className="flex flex-col items-end gap-1 w-20">
                        <span className="font-bold text-right w-full">${(item.price * item.qty).toFixed(2)}</span>
                        {item.stock !== undefined && (item.stock <= 0 || item.qty > item.stock) && (
                          <span className="text-red-400 text-[10px] font-bold uppercase tracking-wider text-right w-full">Out of Stock</span>
                        )}
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => {
                          removeFromCart(item.id, item.variationId);
                          toast.success('Item removed from cart');
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <button
                onClick={() => {
                  clearCart();
                  toast.success('Cart cleared');
                }}
                className="text-sm text-textMuted hover:text-red-400 mt-4 transition-colors"
              >
                Clear Entire Cart
              </button>
            </div>

            {/* Order Summary */}
            <div className="glass-panel p-6 rounded-2xl h-fit sticky top-24">
              <h2 className="text-xl font-bold mb-5">Order Summary</h2>
              <div className="space-y-3 text-sm text-textMuted mb-6">
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.length} items):</span>
                  <span className="text-slate-900 font-medium">${itemsPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="text-slate-900 font-medium">{shippingPrice === 0 ? <span className="text-emerald-600 font-semibold">Free</span> : `$${shippingPrice.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (15%):</span>
                  <span className="text-slate-900 font-medium">${taxPrice.toFixed(2)}</span>
                </div>
                {discountPrice > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({appliedCoupons?.[0]?.toUpperCase()}):</span>
                    <span>-${discountPrice.toFixed(2)}</span>
                  </div>
                )}
                <hr className="border-black/10 my-2" />
                <div className="flex justify-between text-lg font-bold text-slate-900">
                  <span>Total:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {shippingPrice === 0 && (
                <p className="text-emerald-600 text-xs mb-4 flex items-center gap-1">
                  ✓ Free shipping on orders over $100
                </p>
              )}

              <CouponSection onCartUpdate={handleCartUpdate} cartToken={cartToken} />

              <button
                onClick={checkoutHandler}
                className="btn-primary w-full flex justify-center items-center gap-2 mt-4"
                id="cart-checkout-btn"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
