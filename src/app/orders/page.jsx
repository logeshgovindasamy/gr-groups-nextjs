/**
 * Order History Page
 * Redesigned for Luxury Storefront Theme
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';
import useOrderStore from '@/store/useOrderStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/utils/helpers';

const statusConfig = {
  Processing: { icon: Clock, color: 'text-[#b89d70]', bg: 'bg-[#b89d70]/10 border border-[#b89d70]/25', label: 'Processing' },
  Shipped: { icon: Truck, color: 'text-[#123026]', bg: 'bg-[#123026]/10 border border-[#123026]/20', label: 'Shipped' },
  Delivered: { icon: CheckCircle, color: 'text-emerald-700', bg: 'bg-emerald-500/10 border border-emerald-500/20', label: 'Delivered' },
  Cancelled: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10 border border-red-500/20', label: 'Cancelled' },
};

export default function OrdersPage() {
  const { userInfo, token } = useAuthStore();
  const { orders, fetchOrderHistory, status } = useOrderStore();
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [dateFilter, setDateFilter] = useState('');
  const router = useRouter();

  const filteredOrders = useMemo(() => {
    if (!dateFilter) return orders;
    return orders.filter((order) => {
      const dateObj = new Date(order.createdAt || order.date);
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dd = String(dateObj.getDate()).padStart(2, '0');
      const formatted = `${yyyy}-${mm}-${dd}`;
      return formatted === dateFilter;
    });
  }, [orders, dateFilter]);

  useEffect(() => {
    if (!userInfo) {
      router.push('/login');
      return;
    }
    if (userInfo?.id) {
      fetchOrderHistory(userInfo.id);
    }
  }, [userInfo, fetchOrderHistory, router]);

  const handlePrintReceipt = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html><head><title>Receipt - ${order.orderId || order.id}</title>
      <style>
        body { font-family: 'Inter', sans-serif; padding: 40px; color: #123026; max-width: 600px; margin: auto; background-color: #f5f3ef; }
        h1 { font-family: 'Cormorant Garamond', serif; font-size: 28px; margin-bottom: 8px; color: #123026; }
        .divider { border-top: 1px solid #eae8e4; margin: 16px 0; }
        .item-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
        .total { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: bold; margin-top: 12px; color: #123026; }
        .logo { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: bold; color: #123026; letter-spacing: 0.05em; }
      </style></head><body>
        <div class="logo">GR GROUPS</div>
        <h1>Order Receipt</h1>
        <p style="font-size: 13px; color: #6a7571;">Order ID: ${order.orderId || order.id}</p>
        <p style="font-size: 13px; color: #6a7571;">Date: ${new Date(order.createdAt || order.date).toLocaleDateString()}</p>
        <div class="divider"></div>
        ${(order.orderItems || order.items || []).map(item => `<div class="item-row"><span>${item.name} × ${item.qty}</span><span>$${(item.price * item.qty).toFixed(2)}</span></div>`).join('')}
        <div class="divider"></div>
        <div class="item-row" style="color: #6a7571;"><span>Subtotal</span><span>$${formatPrice(order.itemsPrice || 0)}</span></div>
        <div class="item-row" style="color: #6a7571;"><span>Tax</span><span>$${formatPrice(order.taxPrice || 0)}</span></div>
        <div class="item-row" style="color: #6a7571;"><span>Shipping</span><span>$${formatPrice(order.shippingPrice || 0)}</span></div>
        <div class="total item-row"><span>Total</span><span>$${formatPrice(order.totalPrice || 0)}</span></div>
        <div class="divider"></div>
        <p style="text-align:center; color:#6a7571; font-size:12px;">Thank you for shopping with GR Groups!</p>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownloadBill = async (orderId) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/bill`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GR-Groups-Invoice-${orderId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  if (!userInfo) return null;

  return (
    <div className="bg-[#f5f3ef] min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-[#123026] mb-2">
              Order History
            </h1>
            <p className="text-[#6a7571] text-sm">Track your purchases and download invoices.</p>
          </div>

          {/* Date Filter UI */}
          {orders.length > 0 && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#6a7571] font-bold uppercase tracking-wider">Filter by Date</label>
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-white/50 border border-[#eae8e4] rounded-xl py-2 px-4 text-sm text-[#123026] outline-none focus:border-[#b89d70] focus:ring-1 focus:ring-[#b89d70]/25 transition-all"
                />
                {dateFilter && (
                  <button
                    onClick={() => setDateFilter('')}
                    className="text-[#6a7571] hover:text-[#123026] transition-colors"
                    title="Clear Filter"
                  >
                    <XCircle size={24} />
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {status === 'loading' ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-panel bg-white/70 border border-[#eae8e4]/60 rounded-2xl p-6 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-5 w-32 bg-[#eae8e4]/50 rounded skeleton" />
                  <div className="h-5 w-24 bg-[#eae8e4]/50 rounded skeleton" />
                </div>
                <div className="h-4 w-48 bg-[#eae8e4]/50 rounded skeleton mt-4" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 glass-panel bg-white/70 border border-[#eae8e4]/60 rounded-2xl">
            <Package size={56} className="mx-auto text-[#6a7571]/40 mb-4" />
            <h2 className="text-2xl font-bold font-serif text-[#123026] mb-2">No orders yet</h2>
            <p className="text-[#6a7571] mb-6">Start shopping to see your order history here.</p>
            <Link href="/products" className="btn-primary">Browse Products</Link>
          </motion.div>
        ) : filteredOrders.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 glass-panel bg-white/70 border border-[#eae8e4]/60 rounded-2xl">
            <Clock size={48} className="mx-auto text-[#6a7571]/40 mb-4" />
            <h2 className="text-xl font-bold font-serif text-[#123026] mb-2">No orders on this date</h2>
            <p className="text-[#6a7571] mb-6">You didn't make any purchases on {new Date(dateFilter).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.</p>
            <button onClick={() => setDateFilter('')} className="btn-outline px-5 py-2 font-semibold">Clear Filter</button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, i) => {
              const statusDetails = statusConfig[order.status] || statusConfig.Processing;
              const StatusIcon = statusDetails.icon;
              const orderId = order.orderId || order.id;
              const isExpanded = expandedOrder === orderId;

              return (
                <motion.div
                  key={orderId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-panel bg-white/70 border border-[#eae8e4]/60 rounded-2xl overflow-hidden shadow-luxury"
                >
                  {/* Order header */}
                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : orderId)}
                    className="w-full p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left hover:bg-[#123026]/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full ${statusDetails.bg} flex items-center justify-center`}>
                        <StatusIcon size={18} className={statusDetails.color} />
                      </div>
                      <div>
                        <h3 className="font-bold font-serif text-lg text-[#123026]">{orderId}</h3>
                        <p className="text-[#6a7571] text-xs font-semibold">{new Date(order.createdAt || order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <span className={`${statusDetails.bg} ${statusDetails.color} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider`}>
                        {statusDetails.label}
                      </span>
                      <span className="text-xl font-bold font-serif text-[#123026]">${formatPrice(order.totalPrice || 0)}</span>
                    </div>
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="px-6 pb-6 border-t border-[#eae8e4]"
                    >
                      <div className="pt-4 space-y-3">
                        {(order.orderItems || order.items || []).map((item, j) => (
                          <div key={j} className="flex justify-between items-center text-sm">
                            <div>
                              <span className="text-[#123026] font-semibold">{item.name}</span>
                              <span className="text-[#6a7571] ml-2 font-bold">× {item.qty}</span>
                            </div>
                            <span className="font-semibold text-[#123026]">${(item.price * item.qty).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="border-t border-[#eae8e4] pt-3 space-y-1 text-sm text-[#6a7571]">
                          <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold text-[#123026]">${formatPrice(order.itemsPrice || 0)}</span></div>
                          <div className="flex justify-between"><span>Tax</span><span className="font-semibold text-[#123026]">${formatPrice(order.taxPrice || 0)}</span></div>
                          <div className="flex justify-between"><span>Shipping</span><span className="font-semibold text-[#123026]">${formatPrice(order.shippingPrice || 0)}</span></div>
                          <div className="flex justify-between font-bold text-lg text-[#123026] font-serif pt-2"><span>Total</span><span>${formatPrice(order.totalPrice || 0)}</span></div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => handlePrintReceipt(order)}
                          className="btn-outline py-2 px-4 text-xs font-semibold flex items-center gap-2"
                        >
                          <FileText size={16} /> Print Receipt
                        </button>
                        <button
                          onClick={() => handleDownloadBill(orderId)}
                          className="btn-primary py-2 px-4 text-xs font-semibold flex items-center gap-2"
                        >
                          <Download size={16} /> Download Bill
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
