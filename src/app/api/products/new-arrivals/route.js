/**
 * New Arrivals API Route
 * Migrated from: Java ProductController.getNewArrivals()
 * GET /api/products/new-arrivals
 */

import { getNewArrivals } from '@/services/product.service';
import { apiError, apiSuccess } from '@/utils/helpers';

export async function GET() {
  try {
    const products = await getNewArrivals();
    return apiSuccess(products);
  } catch (error) {
    console.error('[New Arrivals]', error);
    return apiError('Failed to fetch new arrivals', 500);
  }
}
