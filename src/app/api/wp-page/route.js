/**
 * API Route: /api/wp-page
 * Proxies WordPress page content requests to the WordPress REST API,
 * forwarding the lang param so WPML returns the correct translation.
 *
 * Query params:
 *   slug  - WordPress page slug (required)
 *   lang  - WPML locale code, e.g. ta, hi, sv, no (optional, defaults to en)
 */

import { NextResponse } from 'next/server';
import { getWPPage } from '@/lib/wordpress';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug') || 'home';
    const locale = searchParams.get('lang') || 'en';

    const page = await getWPPage(slug, locale);

    if (!page) {
      // Return empty — caller will use its English fallback defaults
      return NextResponse.json(null, { status: 200 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error('[API /wp-page] Error:', error);
    return NextResponse.json(null, { status: 200 }); // Soft failure — UI uses defaults
  }
}
