import { getProducts as getWooCommerceProducts, saveProduct } from '@/services/productService';
import { apiError, apiSuccess } from '@/utils/helpers';

export const dynamic = 'force-dynamic';

// GET - Retrieve filtered & paginated products
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      brand: searchParams.get('brand') || undefined,
      color: searchParams.get('color') || undefined,
      tag: searchParams.get('tag') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      rating: searchParams.get('rating') || undefined,
      availability: searchParams.get('availability') || undefined,
      sort: searchParams.get('sort') || undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      per_page: searchParams.get('per_page') ? Number(searchParams.get('per_page')) : 12,
      slug: searchParams.get('slug') || undefined
    };

    const locale = searchParams.get('lang') || 'en';
    const result = await getWooCommerceProducts(params, locale);
    return new Response(JSON.stringify(result.products), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Total-Count': String(result.totalProducts),
        'X-Total-Pages': String(result.totalPages),
        'X-Current-Page': String(result.page),
        'X-Per-Page': String(result.per_page)
      }
    });
  } catch (error) {
    console.error('[Products GET]', error);
    return apiError('Failed to fetch products', 500);
  }
}

// POST - Create a new product
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.title || !body.price) {
      return apiError('Title and price are required', 400);
    }

    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const origin = `${protocol}://${host}`;

    const product = await saveProduct(body, origin);
    return apiSuccess(product, 201);
  } catch (error) {
    console.error('[Products POST]', error);
    return apiError('Failed to create product', 500);
  }
}
