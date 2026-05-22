import { filterListings, getListings } from "@/api/routes/listings.api";
import { getRestaurantRankings } from "@/api/routes/ranking.api";
import { nearbySearchConfig } from "@/config/nearbySearch";
import {
  TOP_RATED_LEADERBOARD_LIMIT,
  TOP_RATED_MAP_RADIUS_KM,
} from "@/constants/limits";
import type {
  CuisineFilterId,
  LatLng,
  PriceFilterId,
  Restaurant,
} from "@/features/restaurants/types/restaurant";
import { haversineKm } from "@/features/restaurants/utils/distance";
import {
  cuisineFilterToApi,
  isTopRatedFilter,
  maxPriceForFilter,
  showOnlyFeedsToListingsApi,
} from "@/features/restaurants/utils/listingFilters";
import type { ShowOnlyFeedsId } from "@/features/restaurants/types/restaurant";
import { mapFilterListingToRestaurants } from "@/features/restaurants/utils/mapListingFilter";
import { mapListingRowsToRestaurants } from "@/features/restaurants/utils/mapListings";
import {
  filterTopRatedNavbarRankingRows,
  mapRankedRowsToRestaurants,
} from "@/features/restaurants/utils/mapRankedRestaurant";
import { syncTopRatedRanking } from "@/lib/rankings/topRatedRankingStorage";

function withinRadiusKm(list: Restaurant[], center: LatLng, radiusKm: number): Restaurant[] {
  return list.filter((r) => haversineKm(center, r.position) <= radiusKm);
}

export type MapListingsFilterParams = {
  priceFilterId: PriceFilterId;
  cuisineId: CuisineFilterId;
  showOnlyFeeds?: ShowOnlyFeedsId;
};

/** Top Rated chip — popularity leaderboard within 2km from `/api/ranking/restaurants`. */
async function fetchTopRatedNearMe(searchCenter: LatLng): Promise<Restaurant[]> {
  const res = await getRestaurantRankings({
    sortBy: "popularity",
    limit: TOP_RATED_LEADERBOARD_LIMIT,
    lat: searchCenter.lat,
    lng: searchCenter.lng,
    radiusKm: TOP_RATED_MAP_RADIUS_KM,
  });

  if (!res.success || res.data.length === 0) {
    return [];
  }

  const scoredRows = filterTopRatedNavbarRankingRows(res.data);
  if (scoredRows.length === 0) {
    return [];
  }

  syncTopRatedRanking(scoredRows, {
    center: searchCenter,
    radiusKm: TOP_RATED_MAP_RADIUS_KM,
  });

  return mapRankedRowsToRestaurants(scoredRows);
}

export async function fetchMapListings(
  searchCenter: LatLng,
  filters: MapListingsFilterParams,
): Promise<Restaurant[]> {
  const { radiusKm } = nearbySearchConfig;
  const maxPrice = maxPriceForFilter(filters.priceFilterId);
  const cuisine = cuisineFilterToApi(filters.cuisineId);
  const topRatedChip = isTopRatedFilter(filters.priceFilterId);
  const showTopRated = filters.showOnlyFeeds === "top50";
  const showOnlyApi = showOnlyFeedsToListingsApi(filters.showOnlyFeeds ?? "all");

  if (topRatedChip) {
    return fetchTopRatedNearMe(searchCenter);
  }

  const useFilterApi =
    maxPrice != null ||
    cuisine != null ||
    showTopRated ||
    Object.keys(showOnlyApi).length > 0;

  let list: Restaurant[] = [];

  if (useFilterApi) {
    const filterRes = await filterListings({
      ...(maxPrice != null ? { maxPrice } : {}),
      ...(cuisine ? { cuisine } : {}),
      ...showOnlyApi,
      ...(showTopRated
        ? {
            topRated: true,
            lat: searchCenter.lat,
            lng: searchCenter.lng,
            radiusKm,
          }
        : {}),
    });
    if (!filterRes.success) return [];
    list = mapFilterListingToRestaurants(
      filterRes.data,
      maxPrice,
      filters.showOnlyFeeds === "hotDeals",
    );
  } else {
    const listingsRes = await getListings();
    if (!listingsRes.success) return [];
    list = mapListingRowsToRestaurants(listingsRes.data);
  }

  return withinRadiusKm(list, searchCenter, radiusKm);
}
