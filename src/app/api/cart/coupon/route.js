import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { action, code, cartToken, cartItems } = await request.json();

    if (action === 'remove') {
      return NextResponse.json({
        success: true,
        totals: {
          total_discount: "0",
          currency_minor_unit: 2
        },
        coupons: [],
        cartToken: null
      });
    }

    if (!code) {
      return NextResponse.json({ success: false, message: 'Coupon code is required.' }, { status: 400 });
    }

    const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || process.env.NEXT_PUBLIC_WP_URL || 'http://127.0.0.1/Testwp';

    // Step 1: Initialize/fetch a fresh WooCommerce cart session to obtain the security Nonce and Cart-Token
    // We intentionally start with a clean scratchpad to avoid duplicate items.
    const cartInitResponse = await fetch(`${wpUrl}/wp-json/wc/store/v1/cart`, {
      method: 'GET'
    });

    const nonce = cartInitResponse.headers.get('Nonce') || cartInitResponse.headers.get('nonce');
    const activeCartToken = cartInitResponse.headers.get('Cart-Token') || cartInitResponse.headers.get('cart-token');

    // Step 2: Add all items from the frontend cart to the WooCommerce session cart
    const postHeaders = {
      'Content-Type': 'application/json',
    };

    if (nonce) {
      postHeaders['Nonce'] = nonce;
    }
    if (activeCartToken) {
      postHeaders['Cart-Token'] = activeCartToken;
    }

    if (cartItems && cartItems.length > 0) {
      // Add items in parallel to speed up execution
      await Promise.all(cartItems.map(item => {
        const productId = item.variationId || item.id || item.productId;
        return fetch(`${wpUrl}/wp-json/wc/store/v1/cart/add-item`, {
          method: 'POST',
          headers: postHeaders,
          body: JSON.stringify({
            id: parseInt(productId),
            quantity: parseInt(item.qty || 1)
          })
        });
      }));
    }

    // Step 3: Apply the coupon code
    const response = await fetch(`${wpUrl}/wp-json/wc/store/v1/cart/apply-coupon`, {
      method: 'POST',
      headers: postHeaders,
      body: JSON.stringify({ code })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || `Failed to apply coupon.` },
        { status: response.status }
      );
    }

    // Append the active cartToken to the returned response so that client-side components can persist it
    return NextResponse.json({
      ...data,
      cartToken: activeCartToken
    });
  } catch (error) {
    console.error('[API Coupon Error]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error processing coupon.' },
      { status: 500 }
    );
  }
}
