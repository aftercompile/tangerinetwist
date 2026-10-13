import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/db/queries";
import { DesignThumbnail, THUMB_SIZE } from "@/lib/letter-builder/design-thumbnail";
import { designSchema } from "@/lib/letter-builder/validate";
import type { Design } from "@/lib/letter-builder/types";

export const dynamic = "force-dynamic";

// Satori (what ImageResponse renders with) needs real font files, so the three letter fonts
// ship in the repo (src/assets/fonts) rather than being fetched from Google at request time.
// Read from disk (Node's fetch can't read file: URLs), and listed in next.config.mjs under
// outputFileTracingIncludes so Vercel bundles them with this route. Loaded once per instance.
let fontsPromise: Promise<ArrayBuffer[]> | undefined;
function loadFonts(): Promise<ArrayBuffer[]> {
  fontsPromise ??= Promise.all(
    ["LilitaOne-Regular.ttf", "ArchivoBlack-Regular.ttf", "Chewy-Regular.ttf"].map(async (name) => {
      const file = await readFile(path.join(process.cwd(), "src", "assets", "fonts", name));
      return file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer;
    })
  );
  return fontsPromise;
}
// A design thumbnail for places that need a real image link (payment providers, emails).
// The design arrives in the URL, so it's only shape-checked and drawn — colours or styles
// that no longer exist just fall back to grey/default rather than failing, since this also
// has to keep rendering for past orders. Nothing here touches personal data beyond the word.
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("p") ?? "";
  const encoded = request.nextUrl.searchParams.get("d") ?? "";
  let design: Design;
  try {
    const parsed = designSchema.safeParse(JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")));
    if (!parsed.success) throw new Error("bad design");
    design = parsed.data;
  } catch {
    return NextResponse.json({ error: "Invalid design" }, { status: 400 });
  }

  const product = await getProductBySlug(slug);
  if (!product?.builderConfig) return NextResponse.json({ error: "Unknown product" }, { status: 404 });
  const config = product.builderConfig;
  if (design.pieces.length > config.maxPieces) return NextResponse.json({ error: "Too long" }, { status: 400 });

  const [lilita, archivo, chewy] = await loadFonts();
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", backgroundColor: "#FBF8F3" }}>
        <DesignThumbnail design={design} config={config} />
      </div>
    ),
    {
      width: THUMB_SIZE,
      height: THUMB_SIZE,
      fonts: [
        { name: "Lilita One", data: lilita, style: "normal", weight: 400 },
        { name: "Archivo Black", data: archivo, style: "normal", weight: 400 },
        { name: "Chewy", data: chewy, style: "normal", weight: 400 },
      ],
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    }
  );
}
