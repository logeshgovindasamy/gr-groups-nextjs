import { NextResponse } from "next/server";
import { getAllProducts as getLegacyProducts } from "@/services/product.service";
import { getProducts as getWooCommerceProducts } from "@/services/productService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("[Data Verification] Fetching products from both sources...");
    
    // Fetch from both sources
    const legacyProducts = await getLegacyProducts();
    const wooProducts = await getWooCommerceProducts();

    console.log(`[Data Verification] Legacy: ${legacyProducts.length} items, WooCommerce: ${wooProducts.length} items`);

    const comparisonReport = [];

    // Compare each legacy product to WooCommerce products to see if it exists and matches
    legacyProducts.forEach(legacy => {
      // Find matching WooCommerce product by title/name (case-insensitive)
      const matchedWoo = wooProducts.find(
        w => w.name.toLowerCase().trim() === legacy.name.toLowerCase().trim()
      );

      const comparison = {
        legacyId: legacy.id,
        legacyName: legacy.name,
        wooId: matchedWoo ? matchedWoo.id : "Not Found",
        wooName: matchedWoo ? matchedWoo.name : "Not Found",
        matches: {
          name: matchedWoo ? true : false,
          image: matchedWoo ? (matchedWoo.image === legacy.image) : false,
          description: matchedWoo ? (matchedWoo.description.substring(0, 30) === legacy.description.substring(0, 30)) : false,
          price: matchedWoo ? (Number(matchedWoo.price) === Number(legacy.price)) : false,
          stock: matchedWoo ? (Number(matchedWoo.stock) === Number(legacy.stock)) : false,
          sku: matchedWoo ? (matchedWoo.sku !== "") : false
        },
        rawValues: {
          legacy: {
            name: legacy.name,
            image: legacy.image || "No image",
            description: legacy.description || "No desc",
            price: legacy.price,
            stock: legacy.stock,
            sku: legacy.sku || "No SKU"
          },
          woo: matchedWoo ? {
            name: matchedWoo.name,
            image: matchedWoo.image || "No image",
            description: matchedWoo.description || "No desc",
            price: matchedWoo.price,
            stock: matchedWoo.stock,
            sku: matchedWoo.sku || "No SKU"
          } : null
        }
      };

      comparisonReport.push(comparison);
    });

    return NextResponse.json({
      success: true,
      legacyCount: legacyProducts.length,
      woocommerceCount: wooProducts.length,
      report: comparisonReport,
      allLegacy: legacyProducts,
      allWooCommerce: wooProducts
    });

  } catch (error) {
    console.error("[Data Verification Error]", error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
