/**
 * User Orders API Route
 * Migrated from: Java OrderController.getOrdersByUser()
 * GET /api/orders/user/[userId] - Get all orders for a user
 */

import { getOrdersByUserId } from '@/services/order.service';
import { apiError, apiSuccess } from '@/utils/helpers';

export async function GET(request, { params }) {
  try {
    const { userId } = await params;
    const orders = await getOrdersByUserId(userId);
    return apiSuccess(orders);
  } catch (error) {
    console.error('[User Orders]', error);
    return apiError('Failed to fetch user orders', 500);
  }
}
