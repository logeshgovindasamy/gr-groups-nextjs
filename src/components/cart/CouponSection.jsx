'use client';

import { useState } from 'react';
import { applyCouponToCart, removeCouponFromCart } from '@/lib/cart';
import useCartStore from '@/store/useCartStore';

export default function CouponSection({ onCartUpdate, cartToken }) {
  const [couponInput, setCouponInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { appliedCoupons, removeDiscount, cartItems } = useCartStore();
  const hasAppliedCoupon = appliedCoupons && appliedCoupons.length > 0 && !!appliedCoupons[0];

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const updatedCart = await applyCouponToCart(couponInput.trim(), cartToken, cartItems);

      setCouponInput('');
      setSuccessMsg(`Coupon "${couponInput}" applied successfully!`);

      if (onCartUpdate) {
        onCartUpdate(updatedCart, couponInput.trim());
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to apply coupon. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    if (!hasAppliedCoupon) return;
    const couponCode = appliedCoupons[0];

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const updatedCart = await removeCouponFromCart(couponCode, cartToken);

      removeDiscount();
      setSuccessMsg('Coupon removed.');

      if (onCartUpdate) {
        onCartUpdate(updatedCart, '');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to remove coupon.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-black/10">
      <h3 className="text-sm font-bold mb-3 text-black uppercase tracking-wider">Promo Code</h3>

      {hasAppliedCoupon ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Active Coupon</p>
            <p className="text-sm font-extrabold text-slate-900 uppercase truncate">{appliedCoupons[0]}</p>
          </div>
          <button
            onClick={handleRemoveCoupon}
            disabled={loading}
            className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors uppercase disabled:opacity-50"
          >
            {loading ? 'Removing...' : 'Remove'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleApplyCoupon} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter promo code (e.g. SUMMER20)"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-3 py-2 border border-slate-200 bg-white text-slate-900 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/15 uppercase"
          />
          <button
            type="submit"
            disabled={loading || !couponInput.trim()}
            className="px-4 py-2 bg-accent hover:bg-[#006e52] text-white rounded-lg font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center min-w-[72px]"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Apply'
            )}
          </button>
        </form>
      )}

      {/* Error & Success Messages */}
      {errorMsg && (
        <p className="mt-2 text-xs font-semibold text-red-600">{errorMsg}</p>
      )}
      {successMsg && (
        <p className="mt-2 text-xs font-semibold text-emerald-600">{successMsg}</p>
      )}
    </div>
  );
}
