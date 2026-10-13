import { z } from "zod";
import type { BuilderConfig, Design } from "./types";
import { priceDesign } from "./design";

// Shape only. What a design is *allowed* to contain depends on the product's own settings
// (which colours exist and are in stock, how long the word may be), so that part is
// resolveDesign's job — a client can send any JSON, and this is the boundary that decides
// what actually gets printed and charged for.
export const designSchema = z.object({
  format: z.enum(["keychain", "clicker"]),
  trim: z.string().min(1).max(40),
  pieces: z
    .array(
      z.object({
        char: z.string().regex(/^[A-Z0-9♥]$/u, "Letters A–Z, numbers 0–9 and ♥ only"),
        style: z.string().min(1).max(40),
        body: z.string().min(1).max(40),
        ink: z.string().min(1).max(40),
      })
    )
    .min(1, "Type a name to start")
    .max(40),
});

export type ResolvedDesign = { design: Design; price: number } | { error: string };

/**
 * Checks a client-sent design against a product's builder config and prices it. Rebuilds
 * the design from validated parts rather than echoing the input, so nothing unexpected is
 * stored on the order.
 */
export function resolveDesign(config: BuilderConfig, input: unknown): ResolvedDesign {
  const parsed = designSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "This design isn't valid." };
  const d = parsed.data;

  if (d.pieces.length > config.maxPieces) return { error: `Names can be up to ${config.maxPieces} pieces long.` };
  if (!config.formats.some((f) => f.id === d.format)) return { error: "That format isn't available." };

  const styles = new Set(config.styles.map((s) => s.id));
  const colors = new Map(config.colors.map((c) => [c.id, c]));
  const soldOut = new Set<string>();
  const checkColor = (id: string): boolean => {
    const c = colors.get(id);
    if (!c) return false;
    if (!c.available) soldOut.add(c.label);
    return true;
  };

  if (!checkColor(d.trim)) return { error: "That cord or frame colour isn't available." };
  for (const p of d.pieces) {
    if (!styles.has(p.style)) return { error: "That letter style isn't available." };
    if (!checkColor(p.body) || !checkColor(p.ink)) return { error: "One of the colours you picked isn't available." };
  }
  if (soldOut.size > 0) {
    const names = Array.from(soldOut).join(", ");
    return { error: `${names} just sold out — please pick another colour.` };
  }

  const design: Design = {
    format: d.format,
    trim: d.trim,
    pieces: d.pieces.map((p) => ({ char: p.char, style: p.style, body: p.body, ink: p.ink })),
  };
  return { design, price: priceDesign(config, design) };
}
