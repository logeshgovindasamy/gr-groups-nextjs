/**
 * Checkout Page
 * Migrated from: React Checkout.jsx
 * Features: Shipping form, payment, order creation, printable receipt
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Printer, ArrowRight, CreditCard, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import useCartStore from '@/store/useCartStore';
import useOrderStore from '@/store/useOrderStore';
import useAuthStore from '@/store/useAuthStore';

export default function CheckoutPage() {
  const cart = useCartStore();
  const { createOrder } = useOrderStore();
  const { userInfo } = useAuthStore();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  // Shipping form state
  const [fullName, setFullName] = useState(userInfo?.name || 'John Doe');
  const [address, setAddress] = useState('123 Luxury Lane');
  const [city, setCity] = useState('Metropolis');
  const [postalCode, setPostalCode] = useState('10001');
  const [country, setCountry] = useState('USA');

  const placeOrderHandler = async () => {
    if (!fullName || !address || !city || !postalCode) {
      toast.error('Please fill in all shipping fields');
      return;
    }

    setIsProcessing(true);

    const orderData = {
      userId: userInfo?.id,
      orderItems: cart.cartItems.map((item) => ({
        name: item.name,
        qty: item.qty,
        image: item.image || '',
        price: item.price,
        productId: item.productId || item.id,
      })),
      shippingAddress: { address, city, postalCode, country },
      paymentMethod: 'Credit Card',
      paymentResult: 'success',
      taxPrice: cart.taxPrice,
      shippingPrice: cart.shippingPrice,
      totalPrice: cart.totalPrice,
      discountPrice: cart.discountPrice,
      appliedCoupons: cart.appliedCoupons || [],
      isPaid: true,
    };

    try {
      const data = await createOrder(orderData);

      setIsProcessing(false);
      setOrderPlaced(true);

      setOrderDetails({
        id: data?.id || 'ORD-' + Math.floor(Math.random() * 1000000),
        date: new Date().toLocaleString(),
        items: [...cart.cartItems],
        total: data?.totalPrice || cart.totalPrice,
        tax: data?.taxPrice || cart.taxPrice,
        shipping: data?.shippingPrice || cart.shippingPrice,
        subtotal: cart.itemsPrice,
        discount: data?.discountPrice || cart.discountPrice,
        couponCode: data?.appliedCoupons?.[0] || cart.appliedCoupons?.[0] || '',
      });

      cart.clearCart();
      toast.success('Order placed successfully!');
    } catch (err) {
      setIsProcessing(false);
      toast.error('Order failed. Please try again.');
      console.error('Order failed', err);
    }
  };

  // Order Success / Receipt View
  if (orderPlaced && orderDetails) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-3xl">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-panel p-8 md:p-12 rounded-2xl relative bg-white text-black print-receipt"
        >
          <div className="text-center mb-8">
            <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800">Payment Successful!</h2>
            <p className="text-gray-500 mt-2">Thank you for your purchase.</p>
          </div>

          <div className="border-t border-b border-gray-200 py-6 mb-6">
            <div className="flex justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="font-bold text-gray-800">{orderDetails.id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-bold text-gray-800">{orderDetails.date}</p>
              </div>
            </div>

            <h3 className="font-bold text-lg mb-4 text-gray-800">Order Details</h3>
            <div className="space-y-4">
              {orderDetails.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center text-gray-400 font-bold">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        (item.name || 'P').charAt(0).toUpperCase()
                      )}
                    </div>
                    <span>
                      {item.qty}x {item.name}
                    </span>
                  </div>
                  <span className="font-medium">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${orderDetails.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>${orderDetails.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${orderDetails.tax.toFixed(2)}</span>
              </div>
              {orderDetails.discount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount ({orderDetails.couponCode?.toUpperCase()}):</span>
                  <span>-${orderDetails.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2">
                <span>Total:</span>
                <span>${orderDetails.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 no-print">
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-full hover:bg-gray-900 transition-colors"
            >
              <Printer size={18} /> Print Receipt
            </button>
            <button
              onClick={() => {
                const url = `/api/orders/${orderDetails.id}/bill`;
                window.open(url, '_blank');
              }}
              className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-full hover:bg-primary/80 transition-colors"
            >
              Download PDF Invoice
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-100 transition-colors"
            >
              Continue Shopping <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Checkout Form View
  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-8">Secure Checkout</h1>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            {/* Shipping */}
            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Truck size={20} className="text-accent" /> Shipping Address
              </h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="input-field"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  id="checkout-name"
                />
                <input
                  type="text"
                  placeholder="Address"
                  className="input-field"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  id="checkout-address"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    className="input-field"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    id="checkout-city"
                  />
                  <input
                    type="text"
                    placeholder="Postal Code"
                    className="input-field"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    id="checkout-postal"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Country"
                  className="input-field"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  id="checkout-country"
                />
              </div>
            </div>

            {/* Payment */}
            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-accent" /> Payment Method
              </h2>
              <div className="p-4 border border-primary bg-primary/10 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard size={20} className="text-primary" />
                  <span>Credit Card (Simulated Payment)</span>
                </div>
                <div className="w-4 h-4 rounded-full bg-primary" />
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="glass-panel p-6 rounded-2xl h-fit sticky top-24">
            <h2 className="text-xl font-bold mb-5">Final Summary</h2>

            {/* Items preview */}
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {cart.cartItems.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm text-textMuted">
                  <div className="flex items-center gap-3 truncate mr-2">
                    <div className="w-10 h-10 bg-surface rounded-md flex-shrink-0 overflow-hidden flex items-center justify-center font-bold text-accent">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        (item.name || 'P').charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="truncate">
                      {item.qty}x {item.name}
                    </span>
                  </div>
                  <span className="flex-shrink-0 font-medium text-slate-900">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <hr className="border-black/10 my-4" />

            <div className="space-y-3 text-sm text-textMuted mb-6">
              <div className="flex justify-between">
                <span>Items:</span>
                <span className="text-slate-900 font-medium">${cart.itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span className="text-slate-900 font-medium">${cart.shippingPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span className="text-slate-900 font-medium">${cart.taxPrice.toFixed(2)}</span>
              </div>
              {cart.discountPrice > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount ({cart.appliedCoupons?.[0]?.toUpperCase()}):</span>
                  <span>-${cart.discountPrice.toFixed(2)}</span>
                </div>
              )}
              <hr className="border-black/10 my-2" />
              <div className="flex justify-between text-xl font-bold text-slate-900">
                <span>Total:</span>
                <span>${cart.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={placeOrderHandler}
              disabled={cart.cartItems.length === 0 || isProcessing}
              className="btn-primary w-full"
              id="checkout-pay-btn"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing Payment...
                </span>
              ) : (
                'Pay Now'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
