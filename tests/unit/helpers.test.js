// ============================================================
// Unit Tests — src/utils/helpers.js
// ============================================================

import {
  generateOrderId,
  generateUserId,
  formatPrice,
  calculateCartTotals,
} from '@/utils/helpers';

describe('generateOrderId()', () => {
  it('returns a string starting with "ORD-"', () => {
    expect(generateOrderId()).toMatch(/^ORD-/);
  });

  it('generates unique IDs on repeated calls', () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateOrderId()));
    expect(ids.size).toBe(50);
  });
});

describe('generateUserId()', () => {
  it('returns a string starting with "USR-"', () => {
    expect(generateUserId()).toMatch(/^USR-/);
  });

  it('generates unique IDs on repeated calls', () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateUserId()));
    expect(ids.size).toBe(50);
  });
});

describe('formatPrice()', () => {
  it('formats a number to 2 decimal places', () => {
    expect(formatPrice(10)).toBe('10.00');
    expect(formatPrice(129.99)).toBe('129.99');
    expect(formatPrice(0)).toBe('0.00');
  });

  it('rounds correctly', () => {
    expect(formatPrice(9.999)).toBe('10.00');
    expect(formatPrice(9.994)).toBe('9.99');
  });
});

describe('calculateCartTotals()', () => {
  it('calculates totals with 15% tax', () => {
    const items = [{ price: 150, qty: 1 }];
    const { itemsPrice, taxPrice, shippingPrice, totalPrice } = calculateCartTotals(items);

    expect(itemsPrice).toBe(150);
    expect(taxPrice).toBe(22.5);      // 15% tax
    expect(shippingPrice).toBe(0);    // free over $100
    expect(totalPrice).toBe(172.5);
  });

  it('charges $10 shipping for orders under $100', () => {
    const { shippingPrice } = calculateCartTotals([{ price: 50, qty: 1 }]);
    expect(shippingPrice).toBe(10);
  });

  it('handles multiple items', () => {
    const items = [{ price: 30, qty: 2 }, { price: 20, qty: 1 }];
    expect(calculateCartTotals(items).itemsPrice).toBe(80);
  });

  it('handles empty cart', () => {
    const { itemsPrice, shippingPrice } = calculateCartTotals([]);
    expect(itemsPrice).toBe(0);
    expect(shippingPrice).toBe(10); // still charges shipping
  });
});
