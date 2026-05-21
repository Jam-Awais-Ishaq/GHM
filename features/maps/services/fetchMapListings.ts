import { filterListings, getListings } from "@/api/routes/listings.api";
import { nearbySearchConfig } from "@/config/nearbySearch";
import { TOP_RATED_MIN_NET_SCORE } from "@/constants/limits";
import type {
  CuisineFilterId,
  LatLng,
  PriceFilterId,
  Restaurant,
} from "@/features/restaurants/types/restaurant";
import { haversineKm } from "@/features/restaurants/utils/distance";
import {
  cuisineFilterToApi,
  maxPriceForFilter,
} from "@/features/restaurants/utils/listingFilters";
import { mapFilterListingToRestaurants } from "@/features/restaurants/utils/mapListingFilter";
import { mapListingRowsToRestaurants } from "@/features/restaurants/utils/mapListings";

function withinRadiusKm(list: Restaurant[], center: LatLng, radiusKm: number): Restaurant[] {
  return list.filter((r) => haversineKm(center, r.position) <= radiusKm);
}

function applyTopRatedFilter(list: Restaurant[]): Restaurant[] {
  return list.filter((r) => r.isTopRated || r.netScore >= TOP_RATED_MIN_NET_SCORE);
}

export type MapListingsFilterParams = {
  priceFilterId: PriceFilterId;
  cuisineId: CuisineFilterId;
};

export async function fetchMapListings(
  searchCenter: LatLng,
  filters: MapListingsFilterParams,
): Promise<Restaurant[]> {
  const { radiusKm } = nearbySearchConfig;
  const maxPrice = maxPriceForFilter(filters.priceFilterId);
  const cuisine = cuisineFilterToApi(filters.cuisineId);
  const useFilterApi = maxPrice != null || cuisine != null;

  if (useFilterApi) {
    const filterRes = await filterListings({
      ...(maxPrice != null ? { maxPrice } : {}),
      ...(cuisine ? { cuisine } : {}),
    });
    if (!filterRes.success) return [];
    return withinRadiusKm(
      mapFilterListingToRestaurants(filterRes.data, maxPrice),
      searchCenter,
      radiusKm,
    );
  }

  const listingsRes = await getListings();
  if (!listingsRes.success) return [];

  let list = withinRadiusKm(
    mapListingRowsToRestaurants(listingsRes.data),
    searchCenter,
    radiusKm,
  );

  if (filters.priceFilterId === "top") {
    list = applyTopRatedFilter(list);
  }

  return list;
}
