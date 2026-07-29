import { createClient } from "@supabase/supabase-js";

export const PRODUCT_IMAGES_BUCKET = "product-images";

// Service-role client — server-only, bypasses RLS. Never import this from a client component.
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set — copy .env.example to .env.local and fill it in."
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
