import { NextResponse } from "next/server";
import * as productService from "@/services/productService";

export const dynamic = "force-dynamic";

export async function GET() {
  const log = [];
  const results = {};

  try {
    // 1. Test getCategories
    log.push("Testing getCategories()...");
    const categories = await productService.getCategories();
    log.push(`✅ Found ${categories.length} categories.`);
    results.categories = categories;

    // 2. Test getProducts
    log.push("Testing getProducts()...");
    const products = await productService.getProducts({ per_page: 3 });
    log.push(`✅ Fetched ${products.length} products.`);
    results.products = products;

    if (products.length > 0) {
      const sampleProduct = products[0];
      
      // 3. Test getProductById
      log.push(`Testing getProductById(${sampleProduct.id})...`);
      const details = await productService.getProductById(sampleProduct.id);
      log.push(`✅ Successfully fetched details for "${details.name}".`);
      results.productDetails = details;

      // 4. Test getProductsByCategory
      if (sampleProduct.category) {
        log.push(`Testing getProductsByCategory("${sampleProduct.category}")...`);
        const catProducts = await productService.getProductsByCategory(sampleProduct.category, { per_page: 2 });
        log.push(`✅ Fetched ${catProducts.length} products in category "${sampleProduct.category}".`);
        results.categoryProducts = catProducts;
      }

      // 5. Test searchProducts
      const searchWord = sampleProduct.name.split(" ")[0] || "Stealth";
      log.push(`Testing searchProducts("${searchWord}")...`);
      const searchResults = await productService.searchProducts(searchWord, { per_page: 2 });
      log.push(`✅ Found ${searchResults.length} products matching query "${searchWord}".`);
      results.searchResults = searchResults;
    } else {
      log.push("⚠️ Skipping detail, category, and search testing because no products were returned.");
    }

    return NextResponse.json({
      success: true,
      log,
      results
    });

  } catch (error) {
    console.error("[Test Service Layer Error]", error);
    return NextResponse.json({
      success: false,
      log,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
