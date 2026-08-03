"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/seo";
import { claimGuestOrders } from "@/lib/actions/order-actions";
import {
  signUpSchema,
  signInSchema,
  requestPasswordResetSchema,
  updatePasswordSchema,
} from "@/lib/validation/auth";

type ActionState = { error?: string };

function safeAccountRedirect(from: FormDataEntryValue | null): string {
  const target = String(from ?? "/account");
  return target.startsWith("/account") ? target : "/account";
}

export async function signUpAction(_prevState: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const parsed = signUpSchema.safeParse({
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { fullName, email, phone, password } = parsed.data;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    return { error: error.message };
  }
  if (!data.user) {
    return { error: "Something went wrong creating your account." };
  }

  // Supabase owns auth.users; this is our own profile row, created once right after
  // sign-up so getCurrentCustomer() never has to lazily backfill it.
  await db.insert(customers).values({ id: data.user.id, email, fullName, phone: phone || null });

  // Sweep up any guest orders placed under this email before the account existed —
  // otherwise a customer who checks out as a guest and immediately registers with the
  // same email would never see that order under "Order history".
  await claimGuestOrders(data.user.id, email);

  redirect(safeAccountRedirect(formData.get("from")));
}

export async function signInAction(_prevState: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const parsed = signInSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: "Incorrect email or password." };
  }

  // Also sweep on sign-in, not just sign-up — covers a customer who already has an
  // account but placed a later order as a guest (different browser, cleared cookies).
  if (data.user) {
    await claimGuestOrders(data.user.id, parsed.data.email);
  }

  redirect(safeAccountRedirect(formData.get("from")));
}

export async function signInWithGoogleAction(formData: FormData) {
  const origin = headers().get("origin") ?? siteConfig.url;
  const from = safeAccountRedirect(formData.get("from"));

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(from)}` },
  });

  if (error || !data.url) {
    redirect(`/account/login?error=google`);
  }
  redirect(data.url);
}

export async function signOutAction() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordResetAction(
  _prevState: (ActionState & { success?: boolean }) | undefined,
  formData: FormData
): Promise<ActionState & { success?: boolean }> {
  const parsed = requestPasswordResetSchema.safeParse({ email: String(formData.get("email") ?? "") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  // Prefer the actual request origin (so local dev links back to localhost) and fall
  // back to the production site config if headers are ever unavailable.
  const origin = headers().get("origin") ?? siteConfig.url;

  const supabase = createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/confirm?next=/account/update-password`,
  });

  // Always report success regardless of whether the email exists, so this can't be used
  // to enumerate registered accounts.
  return { success: true };
}

export async function updatePasswordAction(_prevState: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const parsed = updatePasswordSchema.safeParse({
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { error: error.message };
  }

  redirect("/account");
}
