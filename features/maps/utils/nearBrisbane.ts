import { NEAR_BRISBANE_MAX_KM } from "@/constants/limits";
import { haversineKm } from "@/features/restaurants/utils/distance";
import { DEFAULT_MAP_CENTER } from "@/lib/maps/googleMaps";

export type Coords = { lat: number; lng: number };

export function isNearBrisbane(coords: Coords | null | undefined): boolean {
  if (!coords) return false;
  return haversineKm(coords, DEFAULT_MAP_CENTER) <= NEAR_BRISBANE_MAX_KM;
}

export function mapCameraCenter(userCoords: Coords | null | undefined): Coords {
  return isNearBrisbane(userCoords) && userCoords ? userCoords : DEFAULT_MAP_CENTER;
}
