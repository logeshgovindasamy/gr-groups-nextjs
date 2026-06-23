import { getOrdersByUserId } from '@/services/order.service';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const user = await authenticateRequest(request);
    if (!user || user.role !== 'admin') {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    if (!id) {
      return Response.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const orders = await getOrdersByUserId(id);
    
    // Process orders similar to how the Admin Sales page does
    let purchasedItems = [];
    orders.forEach(order => {
      if (order.orderItems) {
        order.orderItems.forEach(item => {
          purchasedItems.push({
            ...item,
            orderId: order.id,
            date: order.createdAt || order.date,
          });
        });
      }
    });

    // Sort descending by date
    purchasedItems.sort((a, b) => new Date(b.date) - new Date(a.date));

    return Response.json({ success: true, data: purchasedItems });
  } catch (error) {
    console.error(`[Admin User Orders GET ${params?.id}]`, error);
    return Response.json({ success: false, error: 'Failed to fetch user orders' }, { status: 500 });
  }
}
