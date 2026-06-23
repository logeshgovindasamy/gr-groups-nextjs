/**
 * Cart Store - Zustand
 * Migrated from: Redux cartSlice.js
 * Manages shopping cart state with price calculations
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const calculatePrices = (cartItems) => {
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const totalPrice = Number((itemsPrice + taxPrice + shippingPrice).toFixed(2));
  return { itemsPrice, taxPrice, shippingPrice, totalPrice };
};

const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],
      shippingAddress: {},
      paymentMethod: 'Credit Card',
      itemsPrice: 0,
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice: 0,
      discountPrice: 0,
      appliedCoupons: [],
      cartToken: null,

      // Add item to cart
      addToCart: (item) => {
        const { cartItems, discountPrice } = get();
        const existItem = cartItems.find(
          (x) => x.id === item.id && x.variationId === item.variationId
        );

        let updatedItems;
        if (existItem) {
          updatedItems = cartItems.map((x) =>
            x.id === existItem.id && x.variationId === existItem.variationId
              ? { ...x, qty: x.qty + (item.qty || 1) }
              : x
          );
        } else {
          updatedItems = [...cartItems, { ...item, qty: item.qty || 1 }];
        }

        const prices = calculatePrices(updatedItems);
        const totalPrice = Number(Math.max(0, prices.totalPrice - discountPrice).toFixed(2));
        set({ cartItems: updatedItems, ...prices, totalPrice });
      },

      // Update item quantity
      updateQty: (id, variationId, qty) => {
        const { cartItems, discountPrice } = get();
        const updatedItems = cartItems.map((x) =>
          x.id === id && x.variationId === variationId
            ? { ...x, qty: Math.max(1, qty) }
            : x
        );
        const prices = calculatePrices(updatedItems);
        const totalPrice = Number(Math.max(0, prices.totalPrice - discountPrice).toFixed(2));
        set({ cartItems: updatedItems, ...prices, totalPrice });
      },

      // Remove item from cart
      removeFromCart: (id, variationId) => {
        const { cartItems, discountPrice } = get();
        const updatedItems = cartItems.filter(
          (x) => !(x.id === id && x.variationId === variationId)
        );
        const prices = calculatePrices(updatedItems);
        const totalPrice = Number(Math.max(0, prices.totalPrice - discountPrice).toFixed(2));
        set({ cartItems: updatedItems, ...prices, totalPrice });
      },

      // Apply Coupon discount (additive layer)
      applyDiscount: (amount, coupon, token) => {
        set((state) => {
          const discount = Number(amount.toFixed(2));
          const basePrices = calculatePrices(state.cartItems);
          const totalPrice = Number(Math.max(0, basePrices.totalPrice - discount).toFixed(2));
          return {
            discountPrice: discount,
            appliedCoupons: [coupon],
            totalPrice,
            cartToken: token || state.cartToken
          };
        });
      },

      // Remove Coupon discount
      removeDiscount: () => {
        set((state) => {
          const basePrices = calculatePrices(state.cartItems);
          return {
            discountPrice: 0,
            appliedCoupons: [],
            totalPrice: basePrices.totalPrice
          };
        });
      },

      // Set shipping address
      setShippingAddress: (address) => {
        set({ shippingAddress: address });
      },

      // Set payment method
      setPaymentMethod: (method) => {
        set({ paymentMethod: method });
      },

      // Clear entire cart
      clearCart: () => {
        set({
          cartItems: [],
          itemsPrice: 0,
          taxPrice: 0,
          shippingPrice: 0,
          totalPrice: 0,
          discountPrice: 0,
          appliedCoupons: [],
          cartToken: null,
        });
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

export default useCartStore;
