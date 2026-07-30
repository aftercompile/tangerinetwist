import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface CurrentCustomer {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
}

export async function getCurrentCustomer(): Promise<CurrentCustomer | null> {
  // Called from the storefront's shared layout on every page load, so a misconfigured
  // or unreachable Supabase Auth setup must degrade to "signed out," never break the
  // entire storefront — accounts are optional/additive on top of guest checkout.
  let userId: string | undefined;
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id;
  } catch {
    return null;
  }
  if (!userId) return null;

  const [row] = await db.select().from(customers).where(eq(customers.id, userId));
  return row ?? null;
}

// Mirrors requireAdminSession(): re-derives identity from the verified session cookie,
// never from client input. Call at the top of every account-scoped server action/query.
export async function requireCustomerSession(): Promise<CurrentCustomer> {
  const customer = await getCurrentCustomer();
  if (!customer) {
    throw new Error("Unauthorized");
  }
  return customer;
}
