/**
 * Order Store - Zustand
 * Migrated from: Redux orderSlice.js
 * Manages order state and API calls
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useOrderStore = create(
  persist(
    (set, get) => ({
      orders: [],
      currentOrder: null,
      status: 'idle', // idle | loading | succeeded | failed
      error: null,

      // Create a new order
      createOrder: async (orderData) => {
        set({ status: 'loading', error: null });
        try {
          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
          });

          const data = await res.json();

          if (!res.ok) {
            set({ status: 'failed', error: data.error || 'Failed to create order' });
            return null;
          }

          set((state) => ({
            status: 'succeeded',
            currentOrder: data,
            orders: [...state.orders, data],
          }));

          return data;
        } catch (error) {
          set({ status: 'failed', error: 'Network error' });
          return null;
        }
      },

      // Fetch order history for a user
      fetchOrderHistory: async (userId) => {
        set({ status: 'loading', error: null });
        try {
          const res = await fetch(`/api/orders/user/${userId}`);
          const data = await res.json();

          if (!res.ok) {
            set({ status: 'failed', error: data.error || 'Failed to fetch orders' });
            return;
          }

          set({ orders: data, status: 'succeeded' });
        } catch (error) {
          set({ status: 'failed', error: 'Network error' });
        }
      },

      // Fetch all orders (admin)
      fetchAllOrders: async () => {
        set({ status: 'loading' });
        try {
          const res = await fetch('/api/orders');
          const data = await res.json();
          set({ orders: data, status: 'succeeded' });
        } catch (error) {
          set({ status: 'failed', error: 'Network error' });
        }
      },

      // Clear orders
      clearOrders: () => set({ orders: [], currentOrder: null, status: 'idle' }),
    }),
    {
      name: 'order-storage',
      partialize: (state) => ({
        orders: state.orders,
      }),
    }
  )
);

export default useOrderStore;
