import { INDIAN_STATES } from "@/lib/data/indian-states";

export interface PincodeLocation {
  city: string;
  state: string;
}

/**
 * India Post's official PIN code lookup — free, keyless, no rate-limit key needed.
 * Used to auto-fill city/state at checkout so a customer only has to type the PIN
 * once instead of typing city and picking state by hand too.
 *
 * Returns null on anything short of a clean match (bad PIN, network error, no
 * postal record) — callers should treat that as "couldn't autofill," not an error
 * to surface, since the fields stay manually editable either way.
 */
export async function lookupPincode(pin: string, signal?: AbortSignal): Promise<PincodeLocation | null> {
  if (!/^\d{6}$/.test(pin)) return null;

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, { signal });
    if (!res.ok) return null;

    const data = await res.json();
    const result = data?.[0];
    if (result?.Status !== "Success" || !result.PostOffice?.length) return null;

    const office = result.PostOffice[0];
    const city: string = office.District || office.Name || "";
    const state = normalizeIndianState(office.State);
    if (!city) return null;

    return { city, state: state ?? "" };
  } catch {
    // Includes AbortError from a superseded lookup — not a real failure.
    return null;
  }
}

// India Post's data predates a couple of renames/mergers (Puducherry was still
// Pondicherry when their dataset was built; Daman & Diu merged into Dadra and Nagar
// Haveli in 2020) and abbreviates "and" as "&" in a few union territory names.
// Confirmed against the live API (not guessed) for 751001/744101/396210/605001/180001.
const STATE_ALIASES: Record<string, string> = {
  "andaman and nicobar": "Andaman and Nicobar Islands",
  "daman and diu": "Dadra and Nagar Haveli and Daman and Diu",
  pondicherry: "Puducherry",
};

// The API's state names are usually exact matches for INDIAN_STATES, but not always
// (casing varies, "&" vs "and", stray whitespace, the aliases above) — normalize
// rather than pass through a value the checkout's <Select> won't recognize.
function normalizeIndianState(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const cleaned = raw.trim().replace(/&/g, "and").replace(/\s+/g, " ").toLowerCase();
  return INDIAN_STATES.find((s) => s.toLowerCase() === cleaned) ?? STATE_ALIASES[cleaned];
}
