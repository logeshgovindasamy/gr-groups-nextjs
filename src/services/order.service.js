/**
 * Order Service - WooCommerce REST API with Local Fallback
 * Manages orders on WooCommerce while preserving legacy orders and transaction logs.
 */

import fs from 'fs';
import path from 'path';
import { woocommerce } from '@/lib/woocommerce';
import { getUserById } from './user.service';
import { getProductById as getWooProductById } from './productService';
import { getProductById as getLegacyProductById, updateProduct as updateLegacyProduct } from './product.service';

const FALLBACK_FILE = path.join(process.cwd(), '.orders-fallback.json');

function getFallbackOrders() {
  try {
    if (fs.existsSync(FALLBACK_FILE)) {
      const data = fs.readFileSync(FALLBACK_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('[OrderService] Failed to read fallback file:', error.message);
  }
  return [];
}

function saveFallbackOrders(orders) {
  try {
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(orders, null, 2));
  } catch (error) {
    console.error('[OrderService] Failed to write fallback file:', error.message);
  }
}

/**
 * Maps a WooCommerce order to the local storefront schema
 */
export function mapWooCommerceOrderToLocal(wooOrder) {
  if (!wooOrder) return null;

  const orderItems = (wooOrder.line_items || []).map(item => ({
    id: String(item.product_id),
    productId: String(item.product_id),
    name: item.name,
    qty: item.quantity,
    price: Number(item.price),
    image: '' // WooCommerce line items do not provide image URLs, will display fallback or empty
  }));

  return {
    id: String(wooOrder.id),
    userId: wooOrder.customer_id ? String(wooOrder.customer_id) : (wooOrder.billing?.email || ''),
    user: wooOrder.customer_id ? String(wooOrder.customer_id) : (wooOrder.billing?.email || ''),
    orderItems: orderItems,
    shippingAddress: {
      address: wooOrder.shipping?.address_1 || wooOrder.billing?.address_1 || '',
      city: wooOrder.shipping?.city || wooOrder.billing?.city || '',
      postalCode: wooOrder.shipping?.postcode || wooOrder.billing?.postcode || '',
      country: wooOrder.shipping?.country || wooOrder.billing?.country || ''
    },
    paymentMethod: wooOrder.payment_method_title || 'Direct Bank Transfer',
    paymentResult: wooOrder.date_paid ? 'success' : '',
    taxPrice: Number(wooOrder.total_tax || 0),
    shippingPrice: Number(wooOrder.shipping_total || 0),
    totalPrice: Number(wooOrder.total || 0),
    discountPrice: Number(wooOrder.discount_total || 0),
    appliedCoupons: (wooOrder.coupon_lines || []).map(c => c.code),
    isPaid: !!wooOrder.date_paid,
    paidAt: wooOrder.date_paid || null,
    isDelivered: wooOrder.status === 'completed',
    deliveredAt: wooOrder.date_completed || null,
    createdAt: wooOrder.date_created || new Date().toISOString(),
    status: wooOrder.status || 'processing'
  };
}

/**
 * Save a new order (Create on WooCommerce, log in local backup, and update stock)
 */
export async function saveOrder(orderData) {
  try {
    console.log('[OrderService.saveOrder] Creating order...');
    
    // Get customer profile details if available
    let email = 'guest@example.com';
    let firstName = 'Guest';
    let lastName = 'User';
    
    if (orderData.userId) {
      try {
        const userProfile = await getUserById(orderData.userId);
        if (userProfile) {
          email = userProfile.email || email;
          const nameParts = (userProfile.name || '').split(' ');
          firstName = nameParts[0] || firstName;
          lastName = nameParts[1] || 'User';
        }
      } catch (userErr) {
        console.warn('[OrderService.saveOrder] Failed to load user profile details:', userErr.message);
      }
    }

    // Prepare WooCommerce line items
    const lineItems = (orderData.orderItems || []).map(item => ({
      product_id: parseInt(item.productId || item.id),
      quantity: parseInt(item.qty || 1)
    }));

    const wooOrderPayload = {
      payment_method: 'bacs',
      payment_method_title: orderData.paymentMethod || 'Direct Bank Transfer',
      set_paid: orderData.isPaid || false,
      billing: {
        first_name: firstName,
        last_name: lastName,
        address_1: orderData.shippingAddress?.address || '123 Luxury Lane',
        city: orderData.shippingAddress?.city || 'Metropolis',
        postcode: orderData.shippingAddress?.postalCode || '10001',
        country: orderData.shippingAddress?.country || 'USA',
        email: email
      },
      shipping: {
        first_name: firstName,
        last_name: lastName,
        address_1: orderData.shippingAddress?.address || '123 Luxury Lane',
        city: orderData.shippingAddress?.city || 'Metropolis',
        postcode: orderData.shippingAddress?.postalCode || '10001',
        country: orderData.shippingAddress?.country || 'USA'
      },
      line_items: lineItems,
      coupon_lines: (orderData.appliedCoupons || []).map(code => ({ code: String(code) }))
    };

    // Try posting the order to WooCommerce REST API
    try {
      const wooRes = await woocommerce.post('orders', wooOrderPayload);
      if (wooRes && wooRes.id) {
        console.log(`[OrderService.saveOrder] Successfully created WooCommerce Order ID: ${wooRes.id}`);
        const mappedOrder = mapWooCommerceOrderToLocal(wooRes);
        
        // Ensure the legacy userId is linked to the log
        mappedOrder.userId = orderData.userId || '';
        mappedOrder.user = orderData.userId || '';

        // Save order to the local JSON file log
        const fallbackOrders = getFallbackOrders();
        fallbackOrders.push(mappedOrder);
        saveFallbackOrders(fallbackOrders);

        return mappedOrder;
      }
    } catch (wooError) {
      console.error('[OrderService.saveOrder] WooCommerce API failed, triggering local fallback:', wooError.message);
    }

    // Fallback: Create and save locally in case WooCommerce is unreachable or holds custom legacy items
    const id = crypto.randomUUID();
    const fallbackOrder = {
      id,
      userId: orderData.userId || '',
      user: orderData.userId || '',
      orderItems: orderData.orderItems || [],
      shippingAddress: orderData.shippingAddress || {},
      paymentMethod: orderData.paymentMethod || 'Direct Bank Transfer',
      paymentResult: orderData.paymentResult || '',
      taxPrice: parseFloat(orderData.taxPrice || 0),
      shippingPrice: parseFloat(orderData.shippingPrice || 0),
      totalPrice: parseFloat(orderData.totalPrice || 0),
      discountPrice: parseFloat(orderData.discountPrice || 0),
      appliedCoupons: orderData.appliedCoupons || [],
      isPaid: orderData.isPaid || false,
      paidAt: orderData.paidAt || null,
      isDelivered: orderData.isDelivered || false,
      deliveredAt: orderData.deliveredAt || null,
      createdAt: new Date().toISOString(),
      status: orderData.status || 'processing'
    };

    // Deplete stock counts for fallback legacy items
    for (const item of (fallbackOrder.orderItems || [])) {
      try {
        const prodId = item.productId || item.id;
        if (prodId) {
          const product = await getLegacyProductById(prodId);
          if (product) {
            const currentStock = parseInt(product.stock || 0);
            const qtyPurchased = parseInt(item.qty || 1);
            const newStock = Math.max(0, currentStock - qtyPurchased);
            await updateLegacyProduct(prodId, { stock: newStock });
          }
        }
      } catch (stockError) {
        console.error('[OrderService.saveOrder] Stock update failed for legacy item:', stockError.message);
      }
    }

    const fallbackOrders = getFallbackOrders();
    fallbackOrders.push(fallbackOrder);
    saveFallbackOrders(fallbackOrders);
    return fallbackOrder;

  } catch (error) {
    console.error('[OrderService.saveOrder] Critical error saving order:', error);
    throw error;
  }
}

/**
 * Get all orders (WooCommerce + local logs merged)
 */
export async function getAllOrders() {
  try {
    const localOrders = getFallbackOrders();
    let wooOrders = [];
    
    try {
      const data = await woocommerce.get('orders', { per_page: 50 });
      wooOrders = (data || []).map(mapWooCommerceOrderToLocal);
    } catch (wooError) {
      console.warn('[OrderService.getAllOrders] Could not retrieve WooCommerce orders:', wooError.message);
    }

    // Merge WooCommerce and local orders, preventing duplicates
    const merged = [...localOrders];
    wooOrders.forEach(woo => {
      if (!merged.some(m => String(m.id) === String(woo.id))) {
        merged.push(woo);
      }
    });

    return merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('[OrderService.getAllOrders] Error fetching all orders:', error);
    return [];
  }
}

/**
 * Get single order by ID
 */
export async function getOrderById(orderId) {
  try {
    // If it looks like a WooCommerce order ID, fetch from WooCommerce
    if (/^\d+$/.test(String(orderId))) {
      try {
        const data = await woocommerce.get(`orders/${orderId}`);
        if (data) return mapWooCommerceOrderToLocal(data);
      } catch (wooError) {
        console.warn(`[OrderService.getOrderById] WooCommerce fetch failed for ID ${orderId}:`, wooError.message);
      }
    }

    // Search local database fallback
    const localOrders = getFallbackOrders();
    return localOrders.find(o => String(o.id) === String(orderId)) || null;
  } catch (error) {
    console.error(`[OrderService.getOrderById] Error fetching order ${orderId}:`, error);
    return null;
  }
}

/**
 * Get orders by user ID
 */
export async function getOrdersByUserId(userId) {
  try {
    const localOrders = getFallbackOrders().filter(
      o => String(o.userId) === String(userId) || String(o.user) === String(userId)
    );

    let wooOrders = [];
    try {
      const userProfile = await getUserById(userId);
      if (userProfile && userProfile.email) {
        const data = await woocommerce.get('orders', { email: userProfile.email, per_page: 50 });
        wooOrders = (data || []).map(mapWooCommerceOrderToLocal).map(o => ({
          ...o,
          userId: userId,
          user: userId
        }));
      }
    } catch (wooError) {
      console.warn(`[OrderService.getOrdersByUserId] WooCommerce fetch failed for user ${userId}:`, wooError.message);
    }

    // Merge logs
    const merged = [...localOrders];
    wooOrders.forEach(woo => {
      if (!merged.some(m => String(m.id) === String(woo.id))) {
        merged.push(woo);
      }
    });

    return merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error(`[OrderService.getOrdersByUserId] Error fetching user ${userId} orders:`, error);
    return [];
  }
}

/**
 * Update order
 */
export async function updateOrder(orderId, updatedData) {
  try {
    let updatedWoo = null;

    if (/^\d+$/.test(String(orderId))) {
      try {
        const data = await woocommerce.put(`orders/${orderId}`, updatedData);
        if (data) updatedWoo = mapWooCommerceOrderToLocal(data);
      } catch (wooError) {
        console.warn(`[OrderService.updateOrder] WooCommerce update failed for ID ${orderId}:`, wooError.message);
      }
    }

    const localOrders = getFallbackOrders();
    const index = localOrders.findIndex(o => String(o.id) === String(orderId));
    
    if (index !== -1) {
      const mergedUpdate = { ...localOrders[index], ...updatedData, ...(updatedWoo || {}) };
      localOrders[index] = mergedUpdate;
      saveFallbackOrders(localOrders);
      return mergedUpdate;
    }

    return updatedWoo;
  } catch (error) {
    console.error(`[OrderService.updateOrder] Error updating order ${orderId}:`, error);
    return null;
  }
}

/**
 * Delete order
 */
export async function deleteOrder(orderId) {
  try {
    let deletedWoo = false;

    if (/^\d+$/.test(String(orderId))) {
      try {
        await woocommerce.delete(`orders/${orderId}`, { force: true });
        deletedWoo = true;
      } catch (wooError) {
        console.warn(`[OrderService.deleteOrder] WooCommerce delete failed for ID ${orderId}:`, wooError.message);
      }
    }

    const localOrders = getFallbackOrders();
    const filtered = localOrders.filter(o => String(o.id) !== String(orderId));
    const deletedLocal = localOrders.length !== filtered.length;
    
    if (deletedLocal) {
      saveFallbackOrders(filtered);
    }

    return deletedWoo || deletedLocal;
  } catch (error) {
    console.error(`[OrderService.deleteOrder] Error deleting order ${orderId}:`, error);
    return false;
  }
}
