import { nearbySearchConfig } from "@/config/nearbySearch";
import type { LatLng } from "@/features/restaurants/types/restaurant";

/** Full street address e.g. "8 Bent St, Toowong QLD 4066, Australia" */
export function isFullStreetAddress(input: string): boolean {
  const t = input.trim();
  if (t.length < 10) return false;
  if (/,/.test(t)) return true;
  if (/^\d+\s+\S/.test(t)) return true;
  if (
    /\b(street|st|road|rd|avenue|ave|drive|dr|court|ct|parade|pde|lane|ln|way|blvd|boulevard|crescent|cres)\b/i.test(
      t,
    )
  ) {
    return true;
  }
  return /\b\d{4}\b/.test(t) && /\b(qld|queensland|australia)\b/i.test(t);
}

export async function geocodeAddress(query: string): Promise<LatLng | null> {
  const res = await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}`);
  if (!res.ok) return null;
  const data = (await res.json()) as { lat?: number; lng?: number } | null;
  if (data && typeof data.lat === "number" && typeof data.lng === "number") {
    return { lat: data.lat, lng: data.lng };
  }
  return null;
}

function resolveGpsCoords(): Promise<LatLng> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(nearbySearchConfig.listingsHub);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(nearbySearchConfig.listingsHub),
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 12_000 },
    );
  });
}

/**
 * Full address in suburb field → geocode that location.
 * Suburb name only (West End, etc.) → live GPS where the user is standing.
 */
export async function resolveDropFeedLocation(
  suburbInput: string,
): Promise<{ coords: LatLng; mode: "address" | "gps" }> {
  const trimmed = suburbInput.trim();

  if (isFullStreetAddress(trimmed)) {
    const geocoded = await geocodeAddress(trimmed);
    if (geocoded) {
      return { coords: geocoded, mode: "address" };
    }
    throw new Error(
      "Could not find that address. Check spelling or use a suburb name with your current location.",
    );
  }

  return { coords: await resolveGpsCoords(), mode: "gps" };
}
