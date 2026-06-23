/**
 * Order History Page
 * Migrated from: React OrderHistory.jsx
 * Features: Order list with status badges, receipt print, bill download
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
  Processing: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Processing' },
  Shipped: { icon: Truck, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Shipped' },
  Delivered: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Delivered' },
  Cancelled: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Cancelled' },
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
      // Format as YYYY-MM-DD
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
        body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; max-width: 600px; margin: auto; }
        h1 { font-size: 24px; margin-bottom: 8px; }
        .divider { border-top: 2px solid #eee; margin: 16px 0; }
        .item-row { display: flex; justify-content: space-between; padding: 6px 0; }
        .total { font-size: 20px; font-weight: bold; margin-top: 12px; }
        .logo { font-size: 28px; font-weight: 900; background: linear-gradient(to right, #3b82f6, #22d3ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      </style></head><body>
        <div class="logo">GR GROUPS</div>
        <h1>Order Receipt</h1>
        <p>Order ID: ${order.orderId || order.id}</p>
        <p>Date: ${new Date(order.createdAt || order.date).toLocaleDateString()}</p>
        <div class="divider"></div>
        ${(order.orderItems || order.items || []).map(item => `<div class="item-row"><span>${item.name} × ${item.qty}</span><span>$${(item.price * item.qty).toFixed(2)}</span></div>`).join('')}
        <div class="divider"></div>
        <div class="item-row"><span>Subtotal</span><span>$${formatPrice(order.itemsPrice || 0)}</span></div>
        <div class="item-row"><span>Tax</span><span>$${formatPrice(order.taxPrice || 0)}</span></div>
        <div class="item-row"><span>Shipping</span><span>$${formatPrice(order.shippingPrice || 0)}</span></div>
        <div class="total item-row"><span>Total</span><span>$${formatPrice(order.totalPrice || 0)}</span></div>
        <div class="divider"></div>
        <p style="text-align:center; color:#999; font-size:12px;">Thank you for shopping with GR Groups!</p>
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
    <div className="container mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Order <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">History</span>
          </h1>
          <p className="text-textMuted">Track your purchases and download invoices.</p>
        </div>

        {/* Date Filter UI */}
        {orders.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-sm text-textMuted font-medium">Filter by Date</label>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-surface border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  className="text-textMuted hover:text-white transition-colors"
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
            <div key={i} className="glass-panel rounded-2xl p-6 animate-pulse">
              <div className="flex justify-between"><div className="h-5 w-32 bg-surface rounded skeleton" /><div className="h-5 w-24 bg-surface rounded skeleton" /></div>
              <div className="h-4 w-48 bg-surface rounded skeleton mt-4" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <Package size={56} className="mx-auto text-textMuted mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
          <p className="text-textMuted mb-6">Start shopping to see your order history here.</p>
          <Link href="/products" className="btn-primary">Browse Products</Link>
        </motion.div>
      ) : filteredOrders.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 glass-panel rounded-2xl">
          <Clock size={48} className="mx-auto text-textMuted mb-4" />
          <h2 className="text-xl font-semibold mb-2">No orders on this date</h2>
          <p className="text-textMuted mb-6">You didn't make any purchases on {new Date(dateFilter).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.</p>
          <button onClick={() => setDateFilter('')} className="btn-outline">Clear Filter</button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, i) => {
            const status = statusConfig[order.status] || statusConfig.Processing;
            const StatusIcon = status.icon;
            const orderId = order.orderId || order.id;
            const isExpanded = expandedOrder === orderId;

            return (
              <motion.div
                key={orderId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-panel rounded-2xl overflow-hidden"
              >
                {/* Order header */}
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : orderId)}
                  className="w-full p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full ${status.bg} flex items-center justify-center`}>
                      <StatusIcon size={18} className={status.color} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{orderId}</h3>
                      <p className="text-textMuted text-sm">{new Date(order.createdAt || order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className={`${status.bg} ${status.color} px-3 py-1 rounded-full text-xs font-medium`}>
                      {status.label}
                    </span>
                    <span className="text-xl font-bold">${formatPrice(order.totalPrice || 0)}</span>
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="px-6 pb-6 border-t border-white/5"
                  >
                    <div className="pt-4 space-y-3">
                      {(order.orderItems || order.items || []).map((item, j) => (
                        <div key={j} className="flex justify-between items-center text-sm">
                          <div>
                            <span className="text-textLight">{item.name}</span>
                            <span className="text-textMuted ml-2">× {item.qty}</span>
                          </div>
                          <span className="font-medium">${(item.price * item.qty).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t border-white/10 pt-3 space-y-1 text-sm">
                        <div className="flex justify-between text-textMuted"><span>Subtotal</span><span>${formatPrice(order.itemsPrice || 0)}</span></div>
                        <div className="flex justify-between text-textMuted"><span>Tax</span><span>${formatPrice(order.taxPrice || 0)}</span></div>
                        <div className="flex justify-between text-textMuted"><span>Shipping</span><span>${formatPrice(order.shippingPrice || 0)}</span></div>
                        <div className="flex justify-between font-bold text-lg pt-2"><span>Total</span><span>${formatPrice(order.totalPrice || 0)}</span></div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                      <button onClick={() => handlePrintReceipt(order)} className="btn-outline py-2 px-4 text-sm flex items-center gap-2">
                        <FileText size={16} /> Print Receipt
                      </button>
                      <button onClick={() => handleDownloadBill(orderId)} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
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
  );
}
