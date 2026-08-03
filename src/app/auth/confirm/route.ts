import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { claimGuestOrders } from "@/lib/actions/order-actions";

// Supabase's password-reset email links here with a PKCE `code` param, and so does
// Google OAuth (signInWithGoogleAction's redirectTo points here too) — exchanging it is
// what actually establishes the session cookie, since Server Component renders can't set
// cookies themselves.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  if (code) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      // Email/password sign-up creates this row itself (signUpAction); Google sign-in
      // never goes through that path, so a first-time Google sign-in needs its profile
      // row created here instead — onConflictDoNothing makes this a no-op on every
      // subsequent sign-in (and for the password-reset flow, which also lands here).
      const [existing] = await db.select({ id: customers.id }).from(customers).where(eq(customers.id, data.user.id));
      if (!existing && data.user.email) {
        const fullName =
          (data.user.user_metadata?.full_name as string | undefined) ??
          (data.user.user_metadata?.name as string | undefined) ??
          data.user.email;
        await db.insert(customers).values({ id: data.user.id, email: data.user.email, fullName }).onConflictDoNothing();
        await claimGuestOrders(data.user.id, data.user.email);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/account/login`);
}
