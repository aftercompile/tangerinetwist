const BASE_URL = "https://apiv2.shiprocket.in/v1/external";
// Shiprocket tokens last ~10 days — cache and refresh a day early rather than
// re-authenticating on every call.
const TOKEN_TTL_MS = 9 * 24 * 60 * 60 * 1000;

// Cached on globalThis so a warm serverless instance reuses the same token across
// requests instead of logging in again each time — same reasoning as the cached
// postgres client in src/lib/db/index.ts, just without the dev-hot-reload leak concern
// (there's no connection here to accumulate, just a string + expiry).
const globalForShiprocket = globalThis as unknown as {
  shiprocketToken?: { value: string; expiresAt: number };
};

async function getToken(): Promise<string> {
  const cached = globalForShiprocket.shiprocketToken;
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD are not set — copy .env.example to .env.local and fill it in."
    );
  }

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.token) {
    throw new Error(data?.message ?? "Shiprocket login failed");
  }

  globalForShiprocket.shiprocketToken = { value: data.token, expiresAt: Date.now() + TOKEN_TTL_MS };
  return data.token;
}

export async function shiprocketFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message ?? `Shiprocket request failed (${res.status})`);
  }
  return data as T;
}

export function getPickupLocation(): string {
  const location = process.env.SHIPROCKET_PICKUP_LOCATION;
  if (!location) {
    throw new Error(
      "SHIPROCKET_PICKUP_LOCATION is not set — copy .env.example to .env.local and fill it in with the pickup nickname already registered in your Shiprocket dashboard."
    );
  }
  return location;
}

// Shiprocket's own public tracking page — used directly rather than trusting a
// track_url field from the API response, which isn't consistently present.
export function buildTrackingUrl(awbCode: string): string {
  return `https://shiprocket.co/tracking/${awbCode}`;
}
