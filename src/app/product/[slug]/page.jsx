import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlug, getProductVariations, getProducts } from "@/services/productService";
import ProductDetailsClient from "./ProductDetailsClient";

export const revalidate = 60; // Cache page for 60 seconds

// Dynamic SEO metadata generation
export async function generateMetadata({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams.slug;
  const locale = resolvedSearchParams?.lang || 'en';
  try {
    const product = await getProductBySlug(slug, locale);
    if (!product) {
      return {
        title: "Product Not Found | GR Groups",
        description: "The requested product does not exist in our catalog."
      };
    }
    
    const pageTitle = product.brand ? `${product.name} - ${product.brand} | GR Groups` : `${product.name} | GR Groups`;
    const seoDescription = product.description 
      ? `${product.description.substring(0, 150)}... Buy online with fast delivery.` 
      : `Buy ${product.name} online at the best price with fast delivery and secure checkout.`;

    return {
      title: pageTitle,
      description: seoDescription,
      openGraph: {
        title: pageTitle,
        description: seoDescription,
        images: product.images && product.images.length > 0 ? [{ url: product.images[0] }] : [],
        type: "music.song" // using default type or website
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description: seoDescription,
        images: product.images && product.images.length > 0 ? [product.images[0]] : []
      }
    };
  } catch (error) {
    return {
      title: "Product Details | GR Groups",
      description: "Explore our premium product details page."
    };
  }
}

export default async function ProductPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams.slug;
  const locale = resolvedSearchParams?.lang || 'en';
  
  // Fetch product details directly by slug
  const product = await getProductBySlug(slug, locale);
  if (!product) {
    notFound();
  }

  // Load variations if it is a variable product
  let variations = [];
  if (product.type === "variable") {
    variations = await getProductVariations(product.id);
  }

  // Load related products based on same category (excluding current product)
  let relatedProducts = [];
  try {
    const relatedResult = await getProducts({
      category: product.category,
      per_page: 5 // Fetch up to 5 to filter out the current one
    }, locale);
    if (relatedResult && relatedResult.products) {
      relatedProducts = relatedResult.products.filter(p => p.id !== product.id).slice(0, 4);
    }
  } catch (err) {
    console.warn("Failed to fetch related products:", err.message);
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Dynamic Breadcrumbs */}
        <nav className="text-sm text-slate-500 mb-6 flex items-center gap-2 overflow-x-auto whitespace-nowrap py-1">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span>&gt;</span>
          <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-blue-600 transition-colors capitalize">
            {product.category}
          </Link>
          {product.brand && (
            <>
              <span>&gt;</span>
              <Link href={`/products?brand=${encodeURIComponent(product.brand)}`} className="hover:text-blue-600 transition-colors">
                {product.brand}
              </Link>
            </>
          )}
          <span>&gt;</span>
          <span className="text-slate-800 font-medium truncate max-w-[200px] md:max-w-xs">{product.name}</span>
        </nav>

        {/* Main Details Wrapper */}
        <ProductDetailsClient 
          product={product} 
          variations={variations} 
          relatedProducts={relatedProducts} 
        />
      </div>
    </div>
  );
}
