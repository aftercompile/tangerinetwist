import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length === 0) {
    return NextResponse.json({ products: [] });
  }
  const products = await searchProducts(query, 6);
  return NextResponse.json({ products });
}
