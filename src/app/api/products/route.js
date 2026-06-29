import { getProducts as getWooCommerceProducts, saveProduct } from '@/services/productService';
import { apiError, apiSuccess } from '@/utils/helpers';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Extracts the JWT from the Authorization header ("Bearer <token>")
 * or from the "auth-token" cookie set by useAuthStore on login.
 */
function extractToken(request) {
  // 1. Authorization: Bearer <token>
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // 2. auth-token cookie (fallback for browser-originated requests)
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/(?:^|;\s*)auth-token=([^;]+)/);
  if (match) {
    return decodeURIComponent(match[1]);
  }

  return null;
}

// GET - Retrieve filtered & paginated products
export async function GET(request) {
  try {
    // Resolve member pricing status from the JWT token.
    // Admin / undefined roles always receive original prices.
    let isMember = false;
    const token = extractToken(request);
    if (token) {
      const payload = await verifyToken(token);
      if (payload && payload.role && payload.role.toLowerCase() !== 'admin') {
        isMember = true;
      }
    }

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
    const result = await getWooCommerceProducts(params, locale, isMember);
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

