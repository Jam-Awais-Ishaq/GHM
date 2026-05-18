import { NEAR_BRISBANE_MAX_KM } from "@/constants/limits";
import { haversineKm } from "@/features/restaurants/utils/distance";
import { BRISBANE_BOUNDS, DEFAULT_MAP_CENTER } from "@/lib/maps/googleMaps";

export type Coords = { lat: number; lng: number };

const COORD_EPS = 0.00015;

export function coordsNear(a: Coords, b: Coords): boolean {
  return Math.abs(a.lat - b.lat) < COORD_EPS && Math.abs(a.lng - b.lng) < COORD_EPS;
}

export function isInBrisbaneBounds(coords: Coords | null | undefined): boolean {
  if (!coords) return false;
  return (
    coords.lat >= BRISBANE_BOUNDS.south &&
    coords.lat <= BRISBANE_BOUNDS.north &&
    coords.lng >= BRISBANE_BOUNDS.west &&
    coords.lng <= BRISBANE_BOUNDS.east
  );
}

export function isNearBrisbane(coords: Coords | null | undefined): boolean {
  if (!coords) return false;
  return haversineKm(coords, DEFAULT_MAP_CENTER) <= NEAR_BRISBANE_MAX_KM;
}

export function mapCameraCenter(userCoords: Coords | null | undefined): Coords {
  return isNearBrisbane(userCoords) && userCoords ? userCoords : DEFAULT_MAP_CENTER;
}
