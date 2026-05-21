import type { FilterListingRestaurant } from "@/api/types/listings";
import type { Restaurant } from "@/features/restaurants/types/restaurant";
import { mapListingRowsToRestaurants } from "@/features/restaurants/utils/mapListings";

export function mapFilterListingToRestaurants(
  rows: FilterListingRestaurant[],
  maxPrice?: number,
): Restaurant[] {
  return mapListingRowsToRestaurants(rows, maxPrice);
}
