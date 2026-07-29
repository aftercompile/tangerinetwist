import { NextRequest, NextResponse } from "next/server";
import { getProductsBySlugs } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const slugs = Array.isArray(body?.slugs) ? body.slugs.filter((s: unknown) => typeof s === "string") : [];
  const products = await getProductsBySlugs(slugs);
  return NextResponse.json({ products });
}
