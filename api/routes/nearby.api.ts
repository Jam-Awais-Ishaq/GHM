import { apiRequest } from "@/api/inspector";
import type { NearbyListingsResponse } from "@/api/types/nearby";

export function getNearbyListings(
  lat: number,
  lng: number,
  radiusKm: number,
) {
  const q = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radiusKm: String(radiusKm),
  });
  return apiRequest<NearbyListingsResponse>(`/api/listingNearby/nearby?${q}`);
}
