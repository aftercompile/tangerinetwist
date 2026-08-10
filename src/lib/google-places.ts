import { normalizeIndianState } from "@/lib/pincode";

export interface AddressSuggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
}

export interface RetrievedAddress {
  addressLine: string;
  city: string;
  state: string;
  pin: string;
}

// Public key by design (NEXT_PUBLIC_ — runs from the browser), same as Mapbox's own
// Address Autofill is meant to be used. Restricted by HTTP referrer in Google Cloud
// Console rather than kept secret — see .env.example.
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

interface PlacePredictionResponse {
  suggestions?: {
    placePrediction?: {
      placeId: string;
      text: { text: string };
      structuredFormat?: { mainText?: { text: string }; secondaryText?: { text: string } };
    };
  }[];
}

/**
 * Google Places API (New) — Autocomplete. Restricted to India; returns [] on any
 * failure (missing key, network error, bad response) rather than throwing, so a
 * caller can always just fall back to plain manual typing.
 */
export async function suggestAddresses(
  input: string,
  sessionToken: string,
  signal?: AbortSignal
): Promise<AddressSuggestion[]> {
  if (!API_KEY || input.trim().length < 4) return [];

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": API_KEY },
      body: JSON.stringify({ input, includedRegionCodes: ["in"], sessionToken }),
      signal,
    });
    if (!res.ok) return [];

    const data: PlacePredictionResponse = await res.json();
    return (data.suggestions ?? [])
      .filter((s) => s.placePrediction)
      .map((s) => {
        const p = s.placePrediction!;
        return {
          placeId: p.placeId,
          mainText: p.structuredFormat?.mainText?.text ?? p.text.text,
          secondaryText: p.structuredFormat?.secondaryText?.text ?? "",
        };
      });
  } catch {
    // Includes AbortError from a superseded search — not a real failure.
    return [];
  }
}

interface AddressComponent {
  longText: string;
  types: string[];
}

// Everything EXCEPT these types gets joined into the free-text address line — this
// covers both normal street results (route, sublocality_level_1/2) and POI-style
// results (neighborhood) without special-casing which type combination a given
// result happens to have, which varies a lot across India's addressing data.
const ADDRESS_LINE_EXCLUDE_TYPES = new Set([
  "locality",
  "administrative_area_level_1",
  "administrative_area_level_2",
  "administrative_area_level_3",
  "country",
  "postal_code",
  "plus_code",
]);

/**
 * Place Details — fetched only after the customer picks a suggestion (never on every
 * keystroke), closing out the billable session the sessionToken opened. Returns null
 * on failure; the caller already has the suggestion's own display text to fall back to.
 */
export async function retrieveAddress(placeId: string, sessionToken: string): Promise<RetrievedAddress | null> {
  if (!API_KEY) return null;

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?sessionToken=${encodeURIComponent(sessionToken)}`,
      { headers: { "X-Goog-Api-Key": API_KEY, "X-Goog-FieldMask": "addressComponents" } }
    );
    if (!res.ok) return null;

    const data: { addressComponents?: AddressComponent[] } = await res.json();
    const components = data.addressComponents ?? [];
    if (components.length === 0) return null;

    const find = (type: string) => components.find((c) => c.types.includes(type))?.longText ?? "";
    const addressLine = components
      .filter((c) => !c.types.some((t) => ADDRESS_LINE_EXCLUDE_TYPES.has(t)))
      .map((c) => c.longText)
      .join(", ");
    const rawState = find("administrative_area_level_1");

    return {
      addressLine,
      city: find("locality") || find("administrative_area_level_2"),
      state: normalizeIndianState(rawState) ?? rawState,
      pin: find("postal_code"),
    };
  } catch {
    return null;
  }
}
