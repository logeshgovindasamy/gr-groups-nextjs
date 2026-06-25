import { woocommerce } from "@/lib/woocommerce";
import { 
  getAllProducts as getLegacyProducts, 
  getProductById as getLegacyProductById,
  updateProduct as updateLegacyProduct,
  deleteProduct as deleteLegacyProduct,
  saveProduct as saveLegacyProduct
} from "./product.service";

// Helper to map local product images to beautiful Unsplash fallbacks or proxy WordPress URLs
function resolveImage(img) {
  if (!img) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop';
  if (typeof img === 'string') {
    if (img.startsWith('/products/')) {
      const filename = img.split('/').pop();
      const fallbacks = {
        'hoodie-neon.jpg': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop',
        'hoodie-neon-v2.jpg': 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop',
        'jacket-obsidian.jpg': 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=600&auto=format&fit=crop',
        'shoes-phantom.jpg': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
        'blazer-velvet.jpg': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop',
        'watch-titanium.jpg': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop',
        'silk-squares.jpg': 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=600&auto=format&fit=crop',
        'wallet-leather.jpg': 'https://images.unsplash.com/photo-1508962914676-134849a727f0?q=80&w=600&auto=format&fit=crop',
        'turtleneck-merino.jpg': 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=600&auto=format&fit=crop',
        'sunglasses-artisan.jpg': 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop',
        'belt-carbon.jpg': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop',
        'pants-cargo.jpg': 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?q=80&w=600&auto=format&fit=crop'
      };
      return fallbacks[filename] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop';
    }

    // Rewrite absolute WordPress URLs to relative paths to utilize Next.js rewrites proxy
    const wpUrl = process.env.NEXT_PUBLIC_WP_URL || 'http://localhost/Testwp';
    const wpUrlAlt = 'http://127.0.0.1/Testwp';

    if (img.startsWith(wpUrl)) {
      return img.substring(wpUrl.length);
    } else if (img.startsWith(wpUrlAlt)) {
      return img.substring(wpUrlAlt.length);
    } else if (img.includes('/wp-content/uploads/')) {
      const idx = img.indexOf('/wp-content/uploads/');
      if (idx !== -1) {
        return img.substring(idx);
      }
    }
  }
  return img;
}

// Helper to convert relative URLs to absolute URLs using request origin before sending to WooCommerce
function resolveRelativeImages(images, origin) {
  if (!images || !Array.isArray(images)) return [];
  return images.map(img => {
    if (typeof img === 'string') {
      if (img.startsWith('/')) {
        const base = origin || 'http://127.0.0.1:3000';
        return `${base.replace(/\/$/, '')}${img}`;
      }
      return img;
    }
    if (img && typeof img === 'object' && img.src) {
      if (img.src.startsWith('/')) {
        const base = origin || 'http://127.0.0.1:3000';
        return { ...img, src: `${base.replace(/\/$/, '')}${img.src}` };
      }
      return img;
    }
    return img;
  });
}

/**
 * Maps WooCommerce REST API Product object to the Next.js frontend schema
 */
export function mapWooCommerceProduct(p, locale) {
  if (!p) return null;
  
  const price = Number(p.price || p.regular_price || 0);
  const rawImages = (p.images || []).map(img => img.src);
  const resolvedImages = rawImages.map(resolveImage);
  const resolvedImage = resolvedImages.length > 0 ? resolvedImages[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop';
  const categoryName = p.categories && p.categories.length > 0 ? p.categories[0].name : "General";
  
  // Clean HTML from description for UI compatibility
  let plainDescription = p.description 
    ? p.description.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim() 
    : "";

  let name = p.name || "Unnamed Product";

  // Handle dynamic translations from backend
  if (p.translations && locale) {
    const cleanedLocale = String(locale).toLowerCase().trim();
    // Map sv -> sw and no -> nw
    const targetLocale = cleanedLocale === 'sv' ? 'sw' : cleanedLocale === 'no' ? 'nw' : cleanedLocale;
    
    if (p.translations[targetLocale]) {
      const translation = p.translations[targetLocale];
      if (translation.name) {
        name = translation.name;
      }
      if (translation.description) {
        plainDescription = translation.description.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
      }
    }
  }

  const brandAttr = p.attributes?.find(attr => attr.name?.toLowerCase() === 'brand' || attr.slug?.toLowerCase() === 'pa_brand');
  const brand = brandAttr ? (brandAttr.options?.[0] || '') : '';

  const colorAttr = p.attributes?.find(attr => attr.name?.toLowerCase() === 'color' || attr.slug?.toLowerCase() === 'pa_color');
  const colors = colorAttr ? colorAttr.options || [] : [];

  const regPrice = Number(p.regular_price || price);
  const discount = (regPrice > price) ? Math.round(((regPrice - price) / regPrice) * 100) : 0;

  return {
    id: String(p.id),
    slug: p.slug || "",
    name: name,
    title: name,
    description: plainDescription,
    price: price,
    regularPrice: regPrice,
    discount: discount,
    brand: brand,
    colors: colors,
    category: categoryName,
    stock: p.stock_quantity !== null && p.stock_quantity !== undefined ? Number(p.stock_quantity) : 0,
    stockStatus: p.stock_status || "instock",
    images: resolvedImages,
    image: resolvedImage,
    isNewArrival: p.featured || false,
    ratings: Number(p.average_rating || 0),
    rating: Number(p.average_rating || 0),
    numReviews: Number(p.rating_count || 0),
    createdAt: p.date_created || new Date().toISOString(),
    sku: p.sku || "",
    type: p.type || "simple",
    variations: p.variations || [],
    relatedIds: p.related_ids || [],
    attributes: p.attributes || [],
    rawDescription: p.description || "", // Keep HTML description as a fallback
    translations: p.translations || null,
    tags: (p.tags || []).map(t => t.name)
  };
}

/**
 * Fetch products from WooCommerce with server-side filtering, sorting, and pagination
 */
export async function getProducts(params = {}, locale = 'en') {
  const activeLocale = locale || params.lang || params.locale || 'en';
  const {
    category,
    search,
    brand,
    color,
    tag,
    minPrice,
    maxPrice,
    rating,
    availability,
    sort,
    page = 1,
    per_page = 12,
    slug
  } = params;

  let wooProducts = [];
  try {
    const wcParams = { per_page: 100 };
    if (search) wcParams.search = search;
    if (slug) wcParams.slug = slug;
    
    // WooCommerce REST API accepts category ID directly
    if (category && /^\d+$/.test(category)) {
      wcParams.category = category;
    }

    const data = await woocommerce.get("products", wcParams);
    wooProducts = (data || []).map(p => mapWooCommerceProduct(p, activeLocale));
  } catch (error) {
    console.error("[productService.getProducts] WooCommerce fetch failed:", error.message);
  }

  let products = [...wooProducts];

  // Fallback to legacy/GraphQL products if WooCommerce returned nothing
  if (products.length === 0) {
    try {
      console.log("[productService.getProducts] No WooCommerce products found, falling back to legacy products...");
      const legacy = await getLegacyProducts();
      products = legacy.map(p => ({
        ...p,
        id: String(p.id).startsWith("legacy-") ? p.id : `legacy-${p.id}`,
        slug: p.slug || (p.title || p.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      }));
    } catch (err) {
      console.error("[productService.getProducts] Legacy fallback failed:", err);
    }
  }

  // 1. Filter by category slug or name (case-insensitive) if category is name instead of ID
  if (category && !/^\d+$/.test(category) && category.toLowerCase() !== "all") {
    products = products.filter(p => 
      p.category && p.category.toLowerCase() === category.toLowerCase()
    );
  }

  // 2. Filter by search query (double-check matching)
  if (search && search.trim()) {
    const q = search.toLowerCase();
    products = products.filter(p => 
      (p.name || "").toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q) ||
      (p.brand || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q)
    );
  }

  // 3. Filter by Brand (dynamic)
  if (brand) {
    const selectedBrands = brand.split(",").map(b => b.trim().toLowerCase());
    products = products.filter(p => 
      p.brand && selectedBrands.includes(p.brand.toLowerCase())
    );
  }

  // 4. Filter by Color (dynamic)
  if (color) {
    const selectedColors = color.split(",").map(c => c.trim().toLowerCase());
    products = products.filter(p => 
      p.colors && p.colors.some(col => selectedColors.includes(col.toLowerCase()))
    );
  }

  // 4b. Filter by Tag (dynamic)
  if (tag) {
    const selectedTags = tag.split(",").map(t => t.trim().toLowerCase());
    products = products.filter(p => 
      p.tags && p.tags.some(t => selectedTags.includes(t.toLowerCase()))
    );
  }

  // 5. Filter by Price Range
  if (minPrice !== undefined && minPrice !== "") {
    products = products.filter(p => p.price >= Number(minPrice));
  }
  if (maxPrice !== undefined && maxPrice !== "") {
    products = products.filter(p => p.price <= Number(maxPrice));
  }

  // 6. Filter by Rating
  if (rating !== undefined && rating !== "") {
    products = products.filter(p => p.rating >= Number(rating));
  }

  // 7. Filter by Availability
  if (availability === "instock") {
    products = products.filter(p => p.stockStatus === "instock" || p.stock > 0);
  }

  // 8. Sorting
  switch (sort) {
    case "popularity":
      products.sort((a, b) => (b.numReviews || 0) - (a.numReviews || 0));
      break;
    case "rating":
      products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case "price-asc":
      products.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      products.sort((a, b) => b.price - a.price);
      break;
    case "newest":
    default:
      products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
  }

  // 9. Pagination
  const totalProducts = products.length;
  const totalPages = Math.ceil(totalProducts / Number(per_page));
  const currentPage = Math.max(1, Number(page));
  const startIndex = (currentPage - 1) * Number(per_page);
  const paginatedProducts = products.slice(startIndex, startIndex + Number(per_page));

  return {
    products: paginatedProducts,
    totalProducts,
    totalPages,
    page: currentPage,
    per_page: Number(per_page)
  };
}

/**
 * Fetch a single product by ID (checks WooCommerce, falls back to legacy)
 */
export async function getProductById(id, locale = 'en') {
  try {
    if (!id) throw new Error("Product ID is required");

    let product = null;

    // Check if it's explicitly a legacy product ID
    if (String(id).startsWith("legacy-")) {
      const legacyId = String(id).replace("legacy-", "");
      const legacy = await getLegacyProductById(legacyId);
      if (legacy) product = legacy;
    }

    if (!product) {
      // Try fetching from WooCommerce
      try {
        const data = await woocommerce.get(`products/${id}`);
        product = mapWooCommerceProduct(data, locale);
      } catch (wooError) {
        console.warn(`[productService.getProductById] WooCommerce ID ${id} failed, checking legacy:`, wooError.message);
        
        // Fallback: Check if it exists in legacy by the raw ID
        const legacy = await getLegacyProductById(id);
        if (legacy) product = legacy;
        else throw wooError;
      }
    }

    return product;
  } catch (error) {
    console.error(`[productService.getProductById] Failed to fetch product ${id}:`, error);
    throw error;
  }
}

/**
 * Fetch products by category name
 */
export async function getProductsByCategory(categoryName, params = {}, locale = 'en') {
  try {
    if (!categoryName || categoryName.toLowerCase() === "all") {
      return getProducts(params, locale);
    }
    
    // Fetch categories to find the ID corresponding to categoryName
    const categories = await getCategories();
    const matchedCategory = categories.find(
      c => c.name.toLowerCase() === categoryName.toLowerCase()
    );
    
    if (!matchedCategory) {
      console.warn(`[productService.getProductsByCategory] Category "${categoryName}" not found. Returning empty array.`);
      return [];
    }

    const defaultParams = { per_page: 20, category: matchedCategory.id, ...params };
    const data = await woocommerce.get("products", defaultParams);
    const wooProducts = (data || []).map(p => mapWooCommerceProduct(p, locale));
    return wooProducts;
  } catch (error) {
    console.error(`[productService.getProductsByCategory] Failed for category ${categoryName}:`, error);
    throw error;
  }
}

/**
 * Search WooCommerce products by keyword
 */
export async function searchProducts(query, params = {}, locale = 'en') {
  try {
    if (!query) return getProducts(params, locale);
    const defaultParams = { search: query, per_page: 20, ...params };
    const data = await woocommerce.get("products", defaultParams);
    const wooProducts = (data || []).map(p => mapWooCommerceProduct(p, locale));
    return wooProducts;
  } catch (error) {
    console.error(`[productService.searchProducts] Failed for query "${query}":`, error);
    throw error;
  }
}

/**
 * Fetch all categories from WooCommerce
 */
export async function getCategories() {
  let categories = [];
  try {
    const data = await woocommerce.get("products/categories", { per_page: 100 });
    const uniqueMap = new Map();
    (data || []).forEach(cat => {
      const name = cat.name;
      const normalized = name.trim().toLowerCase().replace(/\s+/g, "");
      if (!uniqueMap.has(normalized)) {
        uniqueMap.set(normalized, {
          id: cat.id,
          name: name,
          slug: cat.slug,
          count: cat.count,
          description: cat.description || "",
          image: resolveImage(cat.image?.src || "")
        });
      } else {
        const existing = uniqueMap.get(normalized);
        existing.count += cat.count;
        if (name.includes(" ") && !existing.name.includes(" ")) {
          existing.name = name;
        }
      }
    });
    categories = Array.from(uniqueMap.values());
  } catch (error) {
    console.error("[productService.getCategories] Failed to fetch categories:", error);
  }

  // Fallback to legacy categories if WooCommerce returns nothing
  if (categories.length === 0) {
    try {
      console.log("[productService.getCategories] Falling back to legacy categories...");
      const legacy = await getLegacyProducts();
      const uniqueCats = Array.from(new Set(legacy.map(p => p.category).filter(Boolean)));
      categories = uniqueCats.map((cat, idx) => ({
        id: `legacy-cat-${idx}`,
        name: cat,
        slug: cat.toLowerCase().replace(/\s+/g, '-'),
        count: legacy.filter(p => p.category === cat).length,
        description: `Legacy category ${cat}`,
        image: ""
      }));
    } catch (err) {
      console.error("[productService.getCategories] Legacy fallback failed:", err);
    }
  }

  return categories;
}

/**
 * Fetch all tags from WooCommerce
 */
export async function getTags() {
  let tags = [];
  try {
    const data = await woocommerce.get("products/tags", { per_page: 100 });
    const uniqueMap = new Map();
    (data || []).forEach(tag => {
      const name = tag.name;
      const normalized = name.trim().toLowerCase().replace(/\s+/g, "");
      if (!uniqueMap.has(normalized)) {
        uniqueMap.set(normalized, {
          id: tag.id,
          name: name,
          slug: tag.slug,
          count: tag.count,
          description: tag.description || ""
        });
      } else {
        const existing = uniqueMap.get(normalized);
        existing.count += tag.count;
        if (name.includes(" ") && !existing.name.includes(" ")) {
          existing.name = name;
        }
      }
    });
    tags = Array.from(uniqueMap.values());
  } catch (error) {
    console.error("[productService.getTags] Failed to fetch tags:", error);
  }
  return tags;
}

/**
 * Update product in WooCommerce (with legacy DB fallback)
 */
export async function updateProduct(id, updatedData, origin = '') {
  try {
    if (String(id).startsWith("legacy-")) {
      const legacyId = String(id).replace("legacy-", "");
      return await updateLegacyProduct(legacyId, updatedData);
    }

    const wooPayload = {};
    if (updatedData.name !== undefined) wooPayload.name = updatedData.name;
    if (updatedData.title !== undefined) wooPayload.name = updatedData.title;
    if (updatedData.price !== undefined) wooPayload.regular_price = String(updatedData.price);
    if (updatedData.description !== undefined) wooPayload.description = updatedData.description;
    if (updatedData.stock !== undefined) {
      wooPayload.manage_stock = true;
      wooPayload.stock_quantity = parseInt(updatedData.stock);
    }
    if (updatedData.images !== undefined) {
      const resolvedImages = resolveRelativeImages(updatedData.images || [], origin);
      wooPayload.images = resolvedImages.map(img => typeof img === "string" ? { src: img } : img);
    } else if (updatedData.image !== undefined) {
      const resolved = resolveRelativeImages([updatedData.image], origin);
      wooPayload.images = [{ src: resolved[0] }];
    }

    try {
      const data = await woocommerce.put(`products/${id}`, wooPayload);
      return mapWooCommerceProduct(data);
    } catch (wooError) {
      console.warn(`[productService.updateProduct] WooCommerce update failed for ID ${id}, checking legacy:`, wooError.message);
      
      const legacy = await updateLegacyProduct(id, updatedData);
      if (legacy) return legacy;

      throw wooError;
    }
  } catch (error) {
    console.error(`[productService.updateProduct] Failed to update product ${id}:`, error);
    throw error;
  }
}

/**
 * Delete product from WooCommerce (with legacy DB fallback)
 */
export async function deleteProduct(id) {
  try {
    if (String(id).startsWith("legacy-")) {
      const legacyId = String(id).replace("legacy-", "");
      return await deleteLegacyProduct(legacyId);
    }

    try {
      await woocommerce.delete(`products/${id}`, { force: true });
      return true;
    } catch (wooError) {
      console.warn(`[productService.deleteProduct] WooCommerce delete failed for ID ${id}, checking legacy:`, wooError.message);
      
      const legacySuccess = await deleteLegacyProduct(id);
      if (legacySuccess) return true;

      throw wooError;
    }
  } catch (error) {
    console.error(`[productService.deleteProduct] Failed to delete product ${id}:`, error);
    throw error;
  }
}

/**
 * Fetch Brand attribute terms dynamically from WooCommerce
 */
export async function getBrandAttributes() {
  try {
    const data = await woocommerce.get("products/attributes");
    const brandAttr = (data || []).find(
      attr => attr.name?.toLowerCase() === "brand" || attr.slug === "pa_brand"
    );
    if (brandAttr) {
      const terms = await woocommerce.get(`products/attributes/${brandAttr.id}/terms`, { per_page: 100 });
      if (terms && terms.length > 0) {
        return terms.map(t => t.name);
      }
    }
  } catch (error) {
    console.error("[productService.getBrandAttributes] Failed:", error.message);
  }
  return [];
}

/**
 * Fetch Color attribute terms dynamically from WooCommerce
 */
export async function getColorAttributes() {
  try {
    const data = await woocommerce.get("products/attributes");
    const colorAttr = (data || []).find(
      attr => attr.name?.toLowerCase() === "color" || attr.slug === "pa_color"
    );
    if (colorAttr) {
      const terms = await woocommerce.get(`products/attributes/${colorAttr.id}/terms`, { per_page: 100 });
      if (terms && terms.length > 0) {
        return terms.map(t => t.name);
      }
    }
  } catch (error) {
    console.error("[productService.getColorAttributes] Failed:", error.message);
  }
  return [];
}

/**
 * Fetch a single product by slug (resolves directly from WooCommerce)
 */
export async function getProductBySlug(slug, locale = 'en') {
  let product = null;
  try {
    if (!slug) throw new Error("Product slug is required");
    console.log(`[productService.getProductBySlug] Querying WooCommerce for slug: ${slug}`);
    
    const data = await woocommerce.get("products", { slug });
    if (data && data.length > 0) {
      product = mapWooCommerceProduct(data[0], locale);
    }
  } catch (error) {
    console.warn(`[productService.getProductBySlug] WooCommerce failed for slug ${slug}:`, error.message);
  }

  // Fallback to legacy/GraphQL products if WooCommerce returned nothing
  if (!product) {
    try {
      console.log(`[productService.getProductBySlug] Falling back to legacy products for slug: ${slug}`);
      const legacyProducts = await getLegacyProducts();
      const matched = legacyProducts.find(p => {
        const pSlug = (p.title || p.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        return pSlug === slug || String(p.id) === slug || `legacy-${p.id}` === slug;
      });

      if (matched) {
        product = {
          ...matched,
          slug: slug,
          id: String(matched.id).startsWith("legacy-") ? matched.id : `legacy-${matched.id}`
        };
      }
    } catch (err) {
      console.error("[productService.getProductBySlug] Legacy fallback failed:", err);
    }
  }

  return product;
}

/**
 * Fetch variations for a variable product
 */
export async function getProductVariations(productId) {
  try {
    if (!productId) throw new Error("Product ID is required to fetch variations");
    console.log(`[productService.getProductVariations] Querying variations for ID: ${productId}`);
    
    const data = await woocommerce.get(`products/${productId}/variations`, { per_page: 100 });
    return (data || []).map(v => ({
      id: String(v.id),
      price: Number(v.price || v.regular_price || 0),
      regularPrice: Number(v.regular_price || 0),
      salePrice: Number(v.sale_price || 0),
      stock: v.stock_quantity !== null && v.stock_quantity !== undefined ? Number(v.stock_quantity) : null,
      stockStatus: v.stock_status || "instock",
      attributes: v.attributes || [], // e.g. [{ id: 1, name: "Color", option: "Black" }]
      image: resolveImage(v.image?.src || null)
    }));
  } catch (error) {
    console.error(`[productService.getProductVariations] Failed for product ${productId}:`, error.message);
    return [];
  }
}

/**
 * Fetch authentic reviews for a product from WooCommerce
 */
export async function getProductReviews(productId) {
  try {
    if (!productId) throw new Error("Product ID is required to fetch reviews");
    console.log(`[productService.getProductReviews] Querying reviews for ID: ${productId}`);
    
    const data = await woocommerce.get("products/reviews", { product: productId, per_page: 100 });
    return (data || []).map(r => ({
      id: r.id,
      reviewer: r.reviewer || "Anonymous",
      email: r.reviewer_email || "",
      review: r.review ? r.review.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim() : "",
      rating: Number(r.rating || 0),
      date: r.date_created || new Date().toISOString()
    }));
  } catch (error) {
    console.error(`[productService.getProductReviews] Failed for product ${productId}:`, error.message);
    return [];
  }
}

/**
 * Save / Create a new product in WooCommerce (with legacy DB fallback)
 */
export async function saveProduct(productData, origin = '') {
  try {
    const wooPayload = {
      name: productData.name || productData.title || '',
      type: productData.type || 'simple',
      regular_price: String(productData.price || 0),
      description: productData.description || '',
      manage_stock: true,
      stock_quantity: parseInt(productData.stock || 0),
      featured: !!productData.isNewArrival
    };

    if (productData.category) {
      try {
        const categories = await getCategories();
        const matched = categories.find(c => c.name.toLowerCase() === productData.category.toLowerCase());
        if (matched) {
          wooPayload.categories = [{ id: matched.id }];
        }
      } catch (err) {
        console.warn("Failed to match category for saveProduct:", err);
      }
    }

    if (productData.images && productData.images.length > 0) {
      const resolvedImages = resolveRelativeImages(productData.images || [], origin);
      wooPayload.images = resolvedImages.map(img => typeof img === "string" ? { src: img } : img);
    } else if (productData.image) {
      const resolved = resolveRelativeImages([productData.image], origin);
      wooPayload.images = [{ src: resolved[0] }];
    }

    try {
      const data = await woocommerce.post("products", wooPayload);
      return mapWooCommerceProduct(data);
    } catch (wooError) {
      console.warn(`[productService.saveProduct] WooCommerce product creation failed, falling back to legacy:`, wooError.message);
      const legacy = await saveLegacyProduct(productData);
      if (legacy) return legacy;
      throw wooError;
    }
  } catch (error) {
    console.error(`[productService.saveProduct] Failed to save/create product:`, error);
    throw error;
  }
}
