import { NextRequest, NextResponse } from "next/server";
import { getFastrrCollections } from "@/lib/db/fastrr-queries";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1") - 1;
  const limit = Number(searchParams.get("limit") ?? "100");

  const { total, collections } = await getFastrrCollections(Math.max(page, 0), limit);
  return NextResponse.json({ data: { total, collections } });
}
