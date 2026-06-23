/**
 * Single Order API Route
 * Migrated from: Java OrderController.java
 * GET /api/orders/[id] - Get order by ID
 * PUT /api/orders/[id] - Update order
 * DELETE /api/orders/[id] - Delete order
 */

import { getOrderById, updateOrder, deleteOrder } from '@/services/order.service';
import { apiError, apiSuccess } from '@/utils/helpers';

// GET - Get a single order by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
      return apiError('Order not found', 404);
    }

    return apiSuccess(order);
  } catch (error) {
    console.error('[Order GET]', error);
    return apiError('Failed to fetch order', 500);
  }
}

// PUT - Update an order
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const order = await updateOrder(id, body);

    if (!order) {
      return apiError('Order not found', 404);
    }

    return apiSuccess(order);
  } catch (error) {
    console.error('[Order PUT]', error);
    return apiError('Failed to update order', 500);
  }
}

// DELETE - Delete an order
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const deleted = await deleteOrder(id);

    if (!deleted) {
      return apiError('Order not found', 404);
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('[Order DELETE]', error);
    return apiError('Failed to delete order', 500);
  }
}
