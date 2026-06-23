/**
 * Orders API Route
 * Migrated from: Java OrderController.java
 * GET /api/orders - Get all orders
 * POST /api/orders - Create a new order
 */

import { getAllOrders, saveOrder } from '@/services/order.service';
import { getUserById } from '@/services/user.service';
import { apiError, apiSuccess } from '@/utils/helpers';

export const dynamic = 'force-dynamic';

// GET - Retrieve all orders
export async function GET() {
  try {
    const orders = await getAllOrders();
    return apiSuccess(orders);
  } catch (error) {
    console.error('[Orders GET]', error);
    return apiError('Failed to fetch orders', 500);
  }
}

// POST - Create a new order
export async function POST(request) {
  try {
    const body = await request.json();

    // Validation
    if (!body.orderItems || body.orderItems.length === 0) {
      return apiError('Order must have at least one item', 400);
    }

    // Check if customer is blocked
    if (body.userId) {
      const user = await getUserById(body.userId);
      if (user && user.blocked === true) {
        return apiError('Your account is blocked. Purchases are not allowed.', 403);
      }
    }

    const order = await saveOrder(body);

    return apiSuccess(order, 201);
  } catch (error) {
    console.error('[Orders POST]', error);
    return apiError('Failed to create order', 500);
  }
}
