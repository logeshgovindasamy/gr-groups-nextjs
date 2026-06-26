/**
 * Checkout Page
 * Redesigned for Luxury Storefront Theme
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
      <div className="bg-[#f5f3ef] min-h-screen pt-28 pb-16">
        <div className="container mx-auto px-6 py-12 max-w-3xl">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel p-8 md:p-12 rounded-2xl relative bg-white/80 border border-[#eae8e4]/60 text-[#123026] print-receipt shadow-luxury"
          >
            <div className="text-center mb-8">
              <CheckCircle size={56} className="text-[#123026] mx-auto mb-4" />
              <h2 className="text-3xl font-bold font-serif text-[#123026]">Payment Successful!</h2>
              <p className="text-[#6a7571] mt-2">Thank you for your purchase.</p>
            </div>

            <div className="border-t border-b border-[#eae8e4] py-6 mb-6">
              <div className="flex justify-between mb-4">
                <div>
                  <p className="text-sm text-[#6a7571]">Order Number</p>
                  <p className="font-bold text-[#123026]">{orderDetails.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#6a7571]">Date</p>
                  <p className="font-bold text-[#123026]">{orderDetails.date}</p>
                </div>
              </div>

              <h3 className="font-bold font-serif text-lg mb-4 text-[#123026]">Order Details</h3>
              <div className="space-y-4">
                {orderDetails.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[#123026]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white border border-[#eae8e4]/60 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                        ) : (
                          (item.name || 'P').charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="font-medium">
                        {item.qty}x {item.name}
                      </span>
                    </div>
                    <span className="font-semibold">${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-[#eae8e4] space-y-2 text-sm text-[#6a7571]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="text-[#123026] font-semibold">${orderDetails.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="text-[#123026] font-semibold">${orderDetails.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span className="text-[#123026] font-semibold">${orderDetails.tax.toFixed(2)}</span>
                </div>
                {orderDetails.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount ({orderDetails.couponCode?.toUpperCase()}):</span>
                    <span>-${orderDetails.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-[#123026] pt-2">
                  <span>Total:</span>
                  <span>${orderDetails.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 no-print">
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 bg-[#123026] hover:bg-[#1b4335] text-white px-6 py-3 rounded-full shadow-luxury transition-all"
              >
                <Printer size={18} /> Print Receipt
              </button>
              <button
                onClick={() => {
                  const url = `/api/orders/${orderDetails.id}/bill`;
                  window.open(url, '_blank');
                }}
                className="flex items-center justify-center gap-2 bg-[#b89d70] hover:bg-[#c9b083] text-white px-6 py-3 rounded-full shadow-luxury transition-all font-semibold"
              >
                Download PDF Invoice
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex items-center justify-center gap-2 border border-[#123026]/20 text-[#123026] hover:bg-[#123026]/5 px-6 py-3 rounded-full transition-all font-semibold"
              >
                Continue Shopping <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Checkout Form View
  return (
    <div className="bg-[#f5f3ef] min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-8 font-serif text-[#123026]">Secure Checkout</h1>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Forms */}
            <div className="space-y-6">
              {/* Shipping */}
              <div className="glass-panel bg-white/70 border border-[#eae8e4]/60 p-6 rounded-2xl shadow-luxury">
                <h2 className="text-xl font-bold font-serif text-[#123026] mb-4 flex items-center gap-2">
                  <Truck size={20} className="text-[#b89d70]" /> Shipping Address
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
              <div className="glass-panel bg-white/70 border border-[#eae8e4]/60 p-6 rounded-2xl shadow-luxury">
                <h2 className="text-xl font-bold font-serif text-[#123026] mb-4 flex items-center gap-2">
                  <CreditCard size={20} className="text-[#b89d70]" /> Payment Method
                </h2>
                <div className="p-4 border border-[#123026] bg-[#123026]/10 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard size={20} className="text-[#123026]" />
                    <span className="text-sm font-semibold text-[#123026]">Credit Card (Simulated Payment)</span>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-[#123026]" />
                </div>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="glass-panel bg-white/70 border border-[#eae8e4]/60 p-6 rounded-2xl h-fit sticky top-24 shadow-luxury">
              <h2 className="text-xl font-bold font-serif text-[#123026] mb-5">Final Summary</h2>

              {/* Items preview */}
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-1">
                {cart.cartItems.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm text-[#6a7571]">
                    <div className="flex items-center gap-3 truncate mr-2">
                      <div className="w-10 h-10 bg-white border border-[#eae8e4]/50 rounded-md flex-shrink-0 overflow-hidden flex items-center justify-center p-1">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                        ) : (
                          (item.name || 'P').charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="truncate text-xs font-semibold text-[#123026]">
                        {item.qty}x {item.name}
                      </span>
                    </div>
                    <span className="flex-shrink-0 font-bold text-[#123026]">${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <hr className="border-[#eae8e4] my-4" />

              <div className="space-y-3 text-sm text-[#6a7571] mb-6">
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span className="text-[#123026] font-semibold">${cart.itemsPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="text-[#123026] font-semibold">${cart.shippingPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span className="text-[#123026] font-semibold">${cart.taxPrice.toFixed(2)}</span>
                </div>
                {cart.discountPrice > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount ({cart.appliedCoupons?.[0]?.toUpperCase()}):</span>
                    <span>-${cart.discountPrice.toFixed(2)}</span>
                  </div>
                )}
                <hr className="border-[#eae8e4] my-2" />
                <div className="flex justify-between text-xl font-bold text-[#123026]">
                  <span>Total:</span>
                  <span>${cart.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={placeOrderHandler}
                disabled={cart.cartItems.length === 0 || isProcessing}
                className="btn-primary w-full py-2.5"
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
    </div>
  );
}
