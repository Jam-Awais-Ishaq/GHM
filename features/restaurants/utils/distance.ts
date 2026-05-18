import type { LatLng } from "@/features/restaurants/types/restaurant";

const R = 6371;

function toRad(d: number) {
  return (d * Math.PI) / 180;
}

/** Great-circle distance in kilometres. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatDistanceKm(
  km: number,
  mode: "drive" | "straight" = "drive",
): string {
  const suffix = mode === "drive" ? " drive" : "";
  if (km < 1) return `${Math.round(km * 1000)}m${suffix}`;
  if (km >= 1000) return `${Math.round(km).toLocaleString()}km${suffix}`;
  return `${km.toFixed(1)}km${suffix}`;
}
