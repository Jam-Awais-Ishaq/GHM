import type { LatLng, RestaurantWithDistance } from "@/features/restaurants/types/restaurant";

export type DealMapProps = {
  restaurants: RestaurantWithDistance[];
  userCoords: LatLng | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Geocoded search — map flies here (Brisbane). */
  flyTo?: LatLng | null;
};
