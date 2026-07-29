import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "./session";

// Middleware guards the /admin routes, but every server action is an independently
// invocable endpoint, so each one must verify the session itself too.
export async function requireAdminSession(): Promise<void> {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  const valid = await verifySessionToken(token);
  if (!valid) {
    throw new Error("Unauthorized");
  }
}
