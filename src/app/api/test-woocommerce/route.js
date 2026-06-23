import { NextResponse } from "next/server";
import { woocommerce } from "@/lib/woocommerce";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("[Test WooCommerce] Starting connection test...");
    const products = await woocommerce.get("products", { per_page: 3 });
    console.log("[Test WooCommerce] Success! Fetched products count:", products?.length);
    return NextResponse.json({
      success: true,
      count: products?.length,
      products: products?.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        stock: p.stock_quantity,
        sku: p.sku
      }))
    });
  } catch (error) {
    console.error("[Test WooCommerce] Error details:", error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message;
    return NextResponse.json({
      success: false,
      error: message,
      status
    }, { status });
  }
}
