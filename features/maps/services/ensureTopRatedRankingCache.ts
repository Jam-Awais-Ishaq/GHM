import { getRestaurantRankings } from "@/api/routes/ranking.api";
import type { LatLng } from "@/features/restaurants/types/restaurant";
import {
  TOP_RATED_LEADERBOARD_LIMIT,
  TOP_RATED_MAP_RADIUS_KM,
} from "@/constants/limits";
import {
  getTopRatedRestaurantIdSet,
  isTopRatedRankingCacheFresh,
  syncTopRatedRanking,
} from "@/lib/rankings/topRatedRankingStorage";

/** Load popularity leaderboard into localStorage for map Top rated filter. */
export async function ensureTopRatedRankingCache(
  searchCenter: LatLng,
  radiusKm: number = TOP_RATED_MAP_RADIUS_KM,
): Promise<Set<number>> {
  if (isTopRatedRankingCacheFresh(searchCenter, radiusKm)) {
    return getTopRatedRestaurantIdSet();
  }

  try {
    const res = await getRestaurantRankings({
      sortBy: "popularity",
      limit: TOP_RATED_LEADERBOARD_LIMIT,
      lat: searchCenter.lat,
      lng: searchCenter.lng,
      radiusKm,
    });
    if (res.success && res.data.length > 0) {
      syncTopRatedRanking(res.data, { center: searchCenter, radiusKm });
    }
  } catch {
    /* use existing cache if any */
  }

  return getTopRatedRestaurantIdSet();
}
