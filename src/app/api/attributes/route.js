import { NextResponse } from "next/server";
import { getBrandAttributes, getColorAttributes, getCategories, getTags } from "@/services/productService";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    console.log("[API Attributes] Fetching categories, brands, colors, and tags...");
    
    // Fetch all attributes concurrently for optimal performance
    const [brands, colors, categories, tags] = await Promise.all([
      getBrandAttributes().catch(err => {
        console.warn("Failed to fetch brands from WooCommerce API", err);
        return [];
      }),
      getColorAttributes().catch(err => {
        console.warn("Failed to fetch colors from WooCommerce API", err);
        return [];
      }),
      getCategories().catch(err => {
        console.warn("Failed to fetch categories from WooCommerce API", err);
        return [];
      }),
      getTags().catch(err => {
        console.warn("Failed to fetch tags from WooCommerce API", err);
        return [];
      })
    ]);

    return NextResponse.json({
      success: true,
      brands,
      colors,
      categories,
      tags
    });
  } catch (error) {
    console.error("[API Attributes] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch filter attributes",
        details: error.message
      },
      { status: 500 }
    );
  }
}
