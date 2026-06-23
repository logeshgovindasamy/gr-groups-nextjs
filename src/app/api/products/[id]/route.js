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
  try {
    const { id } = await params;
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
    console.error(`[Product GET ${id}]`, error);
    return apiError('Failed to fetch product', 500);
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedProduct = await updateProduct(id, body);

    if (!updatedProduct) {
      return apiError('Product not found', 404);
    }

    return apiSuccess(updatedProduct);
  } catch (error) {
    console.error(`[Product PUT ${id}]`, error);
    return apiError('Failed to update product', 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const success = await deleteProduct(id);

    if (!success) {
      return apiError('Failed to delete product', 500);
    }

    return apiSuccess({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error(`[Product DELETE ${id}]`, error);
    return apiError('Failed to delete product', 500);
  }
}
