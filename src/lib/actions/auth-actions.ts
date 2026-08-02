"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { verifyPassword } from "@/lib/auth/password";
import { ADMIN_SESSION_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/auth/session";
import { ADMIN_HOST, isSafeAdminRedirect } from "@/lib/auth/admin-routes";

// The clean-URL default ("/") only makes sense on admin.tangerinetwist.in itself —
// localhost/preview deployments have no such subdomain and still serve the dashboard at
// the raw "/admin" path, so the fallback has to be host-aware rather than a constant.
function defaultAdminPath(): string {
  return headers().get("host") === ADMIN_HOST ? "/" : "/admin";
}

export async function loginAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "");

  if (!password || !verifyPassword(password)) {
    return { error: "Incorrect password." };
  }

  const token = await createSessionToken();
  cookies().set(ADMIN_SESSION_COOKIE, token, sessionCookieOptions);

  redirect(isSafeAdminRedirect(from) ? from : defaultAdminPath());
}

export async function logoutAction() {
  cookies().delete(ADMIN_SESSION_COOKIE);
  redirect(defaultAdminPath() === "/" ? "/login" : "/admin/login");
}
