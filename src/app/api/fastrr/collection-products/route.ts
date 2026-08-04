import { NextRequest, NextResponse } from "next/server";
import { getFastrrProductsByCollection } from "@/lib/db/fastrr-queries";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const collectionId = Number(searchParams.get("collection_id"));
  const page = Number(searchParams.get("page") ?? "1") - 1;
  const limit = Number(searchParams.get("limit") ?? "100");

  if (!collectionId) {
    return NextResponse.json({ data: { total: 0, products: [] } });
  }

  const { total, products } = await getFastrrProductsByCollection(collectionId, Math.max(page, 0), limit);
  return NextResponse.json({ data: { total, products } });
}
