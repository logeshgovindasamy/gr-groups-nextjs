import { NextResponse } from "next/server";
import { getProductReviews } from "@/services/productService";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 });
    }

    console.log(`[API Reviews] Fetching reviews for product ID: ${id}`);
    const reviews = await getProductReviews(id);

    return NextResponse.json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error("[API Reviews] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch reviews",
        details: error.message
      },
      { status: 500 }
    );
  }
}
