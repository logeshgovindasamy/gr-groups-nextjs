/**
 * Shared utility helpers
 */

/**
 * Generate a unique order ID with prefix
 * @returns {string} Order ID like "ORD-a1b2c3d4"
 */
export function generateOrderId() {
  const uuid = crypto.randomUUID();
  return `ORD-${uuid.substring(0, 8)}`;
}

/**
 * Generate a unique user ID with prefix
 * @returns {string} User ID like "USR-a1b2c3d4"
 */
export function generateUserId() {
  const uuid = crypto.randomUUID();
  return `USR-${uuid.substring(0, 8)}`;
}

/**
 * Format a price to 2 decimal places
 * @param {number} price
 * @returns {string}
 */
export function formatPrice(price) {
  return Number(price).toFixed(2);
}

/**
 * Create a standard API error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @returns {Response}
 */
export function apiError(message, status = 400) {
  return Response.json({ error: message }, { status });
}

/**
 * Create a standard API success response
 * @param {*} data - Response data
 * @param {number} status - HTTP status code
 * @returns {Response}
 */
export function apiSuccess(data, status = 200) {
  return Response.json(data, { status });
}

/**
 * Calculate cart totals
 * @param {Array} items - Cart items
 * @returns {Object} Calculated totals
 */
export function calculateCartTotals(items) {
  const itemsPrice = items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const totalPrice = Number((itemsPrice + taxPrice + shippingPrice).toFixed(2));

  return { itemsPrice, taxPrice, shippingPrice, totalPrice };
}
