import { scryptSync, timingSafeEqual } from "node:crypto";

// Node-runtime only (uses node:crypto) — never import this from middleware or edge routes.
export function verifyPassword(password: string): boolean {
  const stored = process.env.ADMIN_PASSWORD_HASH;
  if (!stored) {
    throw new Error("ADMIN_PASSWORD_HASH is not set — run: npm run admin:hash-password -- \"your-password\"");
  }
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;

  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}
