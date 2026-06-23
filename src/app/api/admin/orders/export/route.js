/**
 * Orders Export API Route (Service-Based)
 * GET /api/admin/orders/export
 */

import { getAllOrders } from '@/services/order.service';
import { apiError, apiSuccess } from '@/utils/helpers';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filterOrderId = searchParams.get('orderId')?.toLowerCase() || '';
  const filterProductName = searchParams.get('productName')?.toLowerCase() || '';
  const filterTotalPrice = searchParams.get('totalPrice') || '';

  const telemetry = {
    processedCount: 0,
    success: 0,
    skippedItems: 0,
    errors: 0,
  };

  try {
    let csvData = 'OrderID,ProductName,DateSold,Price,Quantity,TotalValue\n';

    // Fetch all orders using order service
    const orders = await getAllOrders();

    // Process row-by-row
    for (const order of orders) {
      telemetry.processedCount++;

      try {
        // Hydration & Validation
        if (!order.id || !order.createdAt) {
          telemetry.skippedItems++;
          continue;
        }

        if (!order.orderItems || order.orderItems.length === 0) {
          telemetry.skippedItems++;
          continue;
        }

        for (const item of order.orderItems) {
          const productName = item.name || item.title || '';
          const orderId = order.id || '';
          const dateSold = order.createdAt || order.date || '';
          const price = Number(item.price) || 0;
          const qty = Number(item.qty) || 1;
          const itemTotalValue = price * qty;

          // Apply Filters (match frontend logic)
          if (filterOrderId && !orderId.toLowerCase().includes(filterOrderId)) continue;
          if (filterProductName && !productName.toLowerCase().includes(filterProductName)) continue;
          if (filterTotalPrice && itemTotalValue !== Number(filterTotalPrice)) continue;

          const escapeCsv = (str) => `"${String(str).replace(/"/g, '""')}"`;
          const csvRow = [
            escapeCsv(orderId),
            escapeCsv(productName),
            escapeCsv(dateSold),
            escapeCsv(price.toFixed(2)),
            escapeCsv(qty),
            escapeCsv(itemTotalValue.toFixed(2))
          ].join(',') + '\n';

          csvData += csvRow;
          telemetry.success++;
        }

      } catch (rowError) {
        console.error(`[Export] Row error for order ${order.id}:`, rowError);
        telemetry.errors++;
      }
    }

    return apiSuccess({
      message: 'Export completed. Downloading CSV...',
      telemetry,
      csvData
    });

  } catch (error) {
    console.error('[Orders Export Error]', error);
    return apiError('Export failed: ' + error.message, 500);
  }
}
