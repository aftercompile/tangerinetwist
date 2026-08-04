import { NextRequest, NextResponse } from "next/server";
import { getFastrrProducts } from "@/lib/db/fastrr-queries";

// Polled by Fastrr's system to sync our catalog — see the "Catalog APIs" section of the
// Fastrr Checkout integration docs. Public/unauthenticated, matching how the docs define
// it (no auth headers shown for this endpoint, unlike the checkout/webhook APIs).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1") - 1;
  const limit = Number(searchParams.get("limit") ?? "100");

  const { total, products } = await getFastrrProducts(Math.max(page, 0), limit);
  return NextResponse.json({ data: { total, products } });
}
