/**
 * WordPress REST API Helper
 * Fetches dynamic page/site content from WordPress with WPML locale support.
 * All text content for the storefront should be managed in WordPress and
 * fetched here so WPML can translate it automatically.
 *
 * Endpoint reference:
 *  /wp-json/wp/v2/pages?slug=home&lang=ta   → Page content (hero, CTA, etc.)
 *  /wp-json/wp/v2/posts?lang=ta             → Blog/news posts
 *  /wp-json/wp/v2/categories?lang=ta        → WP categories (not WC)
 *  /wp-json/acf/v3/options/options          → ACF site-wide options (if plugin installed)
 */

const WP_URL =
  process.env.NEXT_PUBLIC_WP_URL ||
  process.env.NEXT_PUBLIC_WORDPRESS_URL ||
  'http://127.0.0.1/Testwp';

const SUPPORTED_LOCALES = ['en', 'ta', 'hi', 'sv', 'no'];

/**
 * Returns the lang query string for WPML.
 * English is WPML's default so we skip it to keep URLs canonical.
 */
function langParam(locale) {
  const lang = SUPPORTED_LOCALES.includes(locale) ? locale : 'en';
  return lang !== 'en' ? `&lang=${lang}` : '';
}

/**
 * Generic WordPress REST API GET — returns parsed JSON or null on error.
 */
async function wpFetch(path, locale) {
  try {
    const url = `${WP_URL}/wp-json${path}${langParam(locale)}`;
    console.log(`[WordPress REST API] GET ${url}`);
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
    });
    if (!res.ok) {
      console.error(`[WordPress REST API] ${res.status} for ${url}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`[WordPress REST API] Fetch failed:`, err.message);
    return null;
  }
}

// ─────────────────────────────────────────────
// Page Content
// ─────────────────────────────────────────────

/**
 * Fetch a WordPress page by slug.
 * In WordPress admin, create a page (e.g. slug "home") and WPML will
 * automatically serve the translated version when lang=ta is passed.
 *
 * @param {string} slug   - WordPress page slug, e.g. 'home', 'about'
 * @param {string} locale - Active WPML locale
 * @returns {object|null} WordPress page object with .title.rendered and .content.rendered
 */
export async function getWPPage(slug, locale) {
  const data = await wpFetch(`/wp/v2/pages?slug=${slug}`, locale);
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

/**
 * Fetch multiple WordPress pages at once.
 * Returns a map of { slug: pageObject }.
 */
export async function getWPPages(slugs = [], locale) {
  const results = {};
  await Promise.all(
    slugs.map(async (slug) => {
      results[slug] = await getWPPage(slug, locale);
    })
  );
  return results;
}

// ─────────────────────────────────────────────
// Site Options / Global Strings (requires ACF Options Page plugin)
// ─────────────────────────────────────────────

/**
 * Fetch ACF site-wide options translated by WPML.
 * Requires: Advanced Custom Fields PRO + ACF to REST API plugin.
 * Returns null if ACF REST API is not installed.
 */
export async function getWPSiteOptions(locale) {
  const data = await wpFetch(`/acf/v3/options/options`, locale);
  return data?.acf || null;
}

// ─────────────────────────────────────────────
// Posts
// ─────────────────────────────────────────────

/**
 * Fetch latest WordPress posts with WPML locale.
 * @param {number} perPage
 * @param {string} locale
 */
export async function getWPPosts(perPage = 10, locale) {
  const data = await wpFetch(`/wp/v2/posts?per_page=${perPage}&_embed`, locale);
  return Array.isArray(data) ? data : [];
}

// ─────────────────────────────────────────────
// Utility: Strip HTML tags from WordPress content
// ─────────────────────────────────────────────

/**
 * Strips HTML from a WordPress rendered content string.
 * @param {string} html
 */
export function stripHTML(html = '') {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}
