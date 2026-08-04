import { createHmac } from "node:crypto";

// Confirmed empirically (see commit history) rather than assumed: a wrong signature on
// this exact recipe gets a distinct 401 "Invalid value for X-Api-HMAC-SHA256", and a wrong
// key gets a distinct 511 "Invalid credentials" — a correctly-signed request with the real
// key reaches Fastrr's business logic instead of either auth rejection.
const BASE_URLS = {
  staging: "https://fastrr-api-dev.pickrr.com",
  production: "https://checkout-api.shiprocket.com",
} as const;

function getConfig() {
  const apiKey = process.env.FASTRR_API_KEY;
  const apiSecret = process.env.FASTRR_API_SECRET;
  const env = process.env.FASTRR_ENV === "staging" ? "staging" : "production";
  if (!apiKey || !apiSecret) {
    throw new Error("FASTRR_API_KEY / FASTRR_API_SECRET are not set — copy .env.example to .env.local and fill it in.");
  }
  return { apiKey, apiSecret, baseUrl: BASE_URLS[env] };
}

function sign(bodyStr: string, secret: string): string {
  return createHmac("sha256", secret).update(bodyStr).digest("base64");
}

// Every Fastrr endpoint used here is POST-with-signed-body; GET (none needed on our side —
// we're always the caller, never fetching a Fastrr resource without a body) isn't handled.
export async function fastrrFetch<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const { apiKey, apiSecret, baseUrl } = getConfig();
  // Sign the exact string being sent, not a second independent serialization of the same
  // object — removes any chance of the signature and the body ever silently diverging.
  const bodyStr = JSON.stringify({ ...body, timestamp: new Date().toISOString() });

  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
      "X-Api-HMAC-SHA256": sign(bodyStr, apiSecret),
    },
    body: bodyStr,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || data?.ok === false) {
    const message = data?.error?.message ?? data?.result ?? data?.code ?? `Fastrr request failed (${res.status})`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }
  return data as T;
}
