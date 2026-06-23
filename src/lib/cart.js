/**
 * API Helper for WooCommerce shopping cart coupon operations.
 */

/**
 * Applies a coupon code to the WooCommerce cart via the local Next.js API proxy to avoid CORS.
 * 
 * @param {string} couponCode - The entered promo code (e.g., 'SUMMER20').
 * @param {string} cartToken - Session token/nonce for tracking the anonymous cart.
 * @returns {Promise<object>} The updated cart object from WooCommerce.
 */
export async function applyCouponToCart(couponCode, cartToken, cartItems) {
  try {
    const response = await fetch('/api/cart/coupon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'apply',
        code: couponCode,
        cartToken,
        cartItems
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to apply coupon.');
    }

    return data;
  } catch (error) {
    console.error('applyCouponToCart error:', error.message);
    throw error;
  }
}

/**
 * Removes an applied coupon code from the WooCommerce cart via the local Next.js API proxy to avoid CORS.
 * 
 * @param {string} couponCode - The applied coupon code to remove.
 * @param {string} cartToken - Session token/nonce for tracking the anonymous cart.
 * @returns {Promise<object>} The updated cart object from WooCommerce.
 */
export async function removeCouponFromCart(couponCode, cartToken) {
  try {
    const response = await fetch('/api/cart/coupon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'remove',
        code: couponCode,
        cartToken
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to remove coupon.');
    }

    return data;
  } catch (error) {
    console.error('removeCouponFromCart error:', error.message);
    throw error;
  }
}
