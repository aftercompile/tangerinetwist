import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

// TEMPORARY — invalidates the stale Next.js Data Cache left over from the
// category-redesign backfill script, which wrote directly to Postgres and
// bypassed revalidateTag(). Deleted immediately after use.
export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  revalidateTag("products");
  revalidateTag("categories");
  return NextResponse.json({ revalidated: true });
}
