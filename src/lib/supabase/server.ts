import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Anon-key client scoped to the current request's cookies — represents the signed-in
// customer (or nobody), unlike getSupabaseAdmin() which uses the service role key and
// bypasses auth entirely. Never use that one to check who's signed in.
export function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set — copy .env.example to .env.local and fill it in."
    );
  }

  const cookieStore = cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component render, which can't write cookies — safe to
          // ignore since middleware refreshes the session on every request anyway.
        }
      },
    },
  });
}
