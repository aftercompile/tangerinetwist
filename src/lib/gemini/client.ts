const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
// Confirmed against the live /v1beta/models list (not guessed) — Google serves Gemma
// models through the same Gemini API surface. The MoE 26B variant was chosen over the
// dense 31B for bulk product-copy drafting: ~2.5x faster inference for a ~2-4 point
// quality trade-off, which matters more here than the last few points of raw quality.
const MODEL = "gemma-4-26b-a4b-it";

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set — copy .env.example to .env.local and fill it in.");
  }
  return key;
}

export interface ProductDraft {
  name: string;
  tagline: string;
  description: string;
  story: string;
  categorySlug: string;
  material: string;
  materials: string[];
  colorway: string;
  features: string[];
  suggestedIcon: string;
  suggestedPrice: number;
}

// One brand-voice example grounds tone (warm, considered, editorial — not generic
// ecommerce copy) without spending many tokens on a long few-shot set.
const VOICE_EXAMPLE = `Example of the brand's voice (a lamp, for tone reference only — do not reuse this text):
{
  "name": "Dune Table Lamp",
  "tagline": "Soft curves, softer light",
  "description": "Inspired by wind-carved sand, the Dune Table Lamp diffuses light through gently ribbed walls that pool warmth across a room rather than casting a single hard beam. It's the lamp we reach for on slow evenings.",
  "story": "Dune began as a study in shadow — we wanted a lamp that looked as good switched off as it did glowing. The ribbing was refined across eleven prototypes until the light fell exactly right: soft at the base, warm at the crown."
}`;

export async function generateProductDraft({
  imageBase64,
  mimeType,
  categoryOptions,
  iconOptions,
  priceRanges,
}: {
  imageBase64: string;
  mimeType: string;
  categoryOptions: { slug: string; name: string }[];
  iconOptions: string[];
  priceRanges: Record<string, { min: number; max: number }>;
}): Promise<ProductDraft> {
  const categorySlugs = categoryOptions.map((c) => c.slug);
  const priceRangeLines = categoryOptions
    .map((c) => {
      const range = priceRanges[c.slug];
      return range ? `- ${c.slug}: ₹${range.min}–₹${range.max}` : `- ${c.slug}: no existing products yet, use your judgement`;
    })
    .join("\n");

  const prompt = `You are a copywriter for TangerineTwist, a premium 3D-printed home décor and
workspace essentials studio (designer lamps, decorative idols, desk organizers). Look at the
attached product photo and draft a listing for it.

${VOICE_EXAMPLE}

Categories available (pick the single best fit for what's in the photo):
${categorySlugs.join(", ")}

Existing price ranges per category (suggest a price within the matching range, based on the
item's apparent size/complexity — do not exceed these ranges):
${priceRangeLines}

Rules:
- Write name, tagline, description, and story in the brand's voice shown above — warm, specific,
  considered. Never generic ecommerce copy ("Great quality!", "Buy now!").
- "material" is the primary material as a short label (e.g. "Premium PLA", "8K Resin").
- "materials" is 2-4 short bullet-style phrases (e.g. "Premium PLA shell", "Warm-white 2700K LED").
- "colorway" is a short, evocative name for the visible color (e.g. "Warm Sand", "Charcoal Matte").
- "features" is 3-5 short bullet-style phrases describing what's visually distinctive.
- Do NOT state exact physical dimensions or weight — you cannot know these from a photo.
- "suggestedIcon" must be exactly one of: ${iconOptions.join(", ")}.
- "suggestedPrice" must be a whole number within the chosen category's range above.`;

  const response = await fetch(`${BASE_URL}/models/${MODEL}:generateContent?key=${getApiKey()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }, { inlineData: { mimeType, data: imageBase64 } }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING" },
            tagline: { type: "STRING" },
            description: { type: "STRING" },
            story: { type: "STRING" },
            categorySlug: { type: "STRING", enum: categorySlugs },
            material: { type: "STRING" },
            materials: { type: "ARRAY", items: { type: "STRING" } },
            colorway: { type: "STRING" },
            features: { type: "ARRAY", items: { type: "STRING" } },
            suggestedIcon: { type: "STRING", enum: iconOptions },
            suggestedPrice: { type: "NUMBER" },
          },
          required: [
            "name",
            "tagline",
            "description",
            "story",
            "categorySlug",
            "material",
            "materials",
            "colorway",
            "features",
            "suggestedIcon",
            "suggestedPrice",
          ],
        },
      },
    }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error?.message ?? `Gemini request failed (${response.status})`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned no draft — the image may have been rejected or blocked.");
  }

  let draft: ProductDraft;
  try {
    draft = JSON.parse(text);
  } catch {
    throw new Error("Gemini returned a response that wasn't valid JSON.");
  }

  return draft;
}
