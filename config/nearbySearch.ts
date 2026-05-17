import { NEARBY_LISTINGS_RADIUS_KM } from "@/constants/limits";
import type { LatLng } from "@/features/restaurants/types/restaurant";
import { isNearBrisbane } from "@/features/maps/utils/nearBrisbane";
import { DEFAULT_MAP_CENTER } from "@/lib/maps/googleMaps";

/** Fallback centre for nearby/filter queries when GPS is off or outside the service area. */
export const BRISBANE_LISTINGS_HUB: LatLng = {
  lat: DEFAULT_MAP_CENTER.lat,
  lng: DEFAULT_MAP_CENTER.lng,
};

export const nearbySearchConfig = {
  radiusKm: NEARBY_LISTINGS_RADIUS_KM,
  listingsHub: BRISBANE_LISTINGS_HUB,
} as const;

/**
 * Where to query nearby/filter APIs.
 * - Inside service area: live GPS.
 * - Otherwise: Bahawalpur hub.
 */
export function resolveNearbySearchCenter(
  coords: LatLng | null,
  locationReady: boolean,
): LatLng {
  if (locationReady && coords && isNearBrisbane(coords)) {
    return coords;
  }
  return nearbySearchConfig.listingsHub;
}

export function listingsHubLabel(): string {
  return "Bahawalpur, Punjab";
}
