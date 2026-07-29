"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyPassword } from "@/lib/auth/password";
import { ADMIN_SESSION_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/auth/session";

export async function loginAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/admin");

  if (!password || !verifyPassword(password)) {
    return { error: "Incorrect password." };
  }

  const token = await createSessionToken();
  cookies().set(ADMIN_SESSION_COOKIE, token, sessionCookieOptions);

  redirect(from.startsWith("/admin") ? from : "/admin");
}

export async function logoutAction() {
  cookies().delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}
