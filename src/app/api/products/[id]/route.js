/**
 * Dynamic Product API Route
 * Migrated from: Java ProductController.java
 * GET /api/products/[id] - Get product by ID
 * PUT /api/products/[id] - Update product
 * DELETE /api/products/[id] - Delete product
 */

import { getProductById as getLegacyProductById } from '@/services/product.service';
import {
  getProductById as getWooCommerceProductById,
  updateProduct,
  deleteProduct
} from '@/services/productService';
import { apiError, apiSuccess } from '@/utils/helpers';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  let id;
  try {
    const resolvedParams = await params;
    id = resolvedParams.id;
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('lang') || 'en';
    // Fetch product detail from WooCommerce REST API
    const product = await getWooCommerceProductById(id, locale);
    // Legacy custom DB product fetch:
    // const product = await getLegacyProductById(id);

    if (!product) {
      return apiError('Product not found', 404);
    }

    return apiSuccess(product);
  } catch (error) {
    console.error(`[Product GET ${id || 'unknown'}]`, error);
    return apiError('Failed to fetch product', 500);
  }
}

export async function PUT(request, { params }) {
  let id;
  try {
    const resolvedParams = await params;
    id = resolvedParams.id;
    const body = await request.json();

    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const origin = `${protocol}://${host}`;

    const updatedProduct = await updateProduct(id, body, origin);

    if (!updatedProduct) {
      return apiError('Product not found', 404);
    }

    return apiSuccess(updatedProduct);
  } catch (error) {
    console.error(`[Product PUT ${id || 'unknown'}]`, error);
    return apiError('Failed to update product', 500);
  }
}

export async function POST(request, { params }) {
  return PUT(request, { params });
}

export async function DELETE(request, { params }) {
  let id;
  try {
    const resolvedParams = await params;
    id = resolvedParams.id;
    const success = await deleteProduct(id);

    if (!success) {
      return apiError('Failed to delete product', 500);
    }

    return apiSuccess({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error(`[Product DELETE ${id || 'unknown'}]`, error);
    return apiError('Failed to delete product', 500);
  }
}
