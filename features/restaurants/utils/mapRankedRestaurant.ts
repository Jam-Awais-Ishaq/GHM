import type { RankedRestaurantRow } from "@/api/types/ranking";
import { TOP_RATED_CHIP_MIN_NET_SCORE } from "@/constants/limits";
import type { Restaurant } from "@/features/restaurants/types/restaurant";

/** Navbar Top Rated — restaurant has a non-zero vote net score. */
export function hasValidTopRatedNavbarNetScore(netScore: number): boolean {
  return Number.isFinite(netScore) && netScore >= TOP_RATED_CHIP_MIN_NET_SCORE;
}

export function filterTopRatedNavbarRankingRows(
  rows: RankedRestaurantRow[],
): RankedRestaurantRow[] {
  return rows.filter((row) => hasValidTopRatedNavbarNetScore(row.votes.netScore));
}

export function filterTopRatedNavbarRestaurants(list: Restaurant[]): Restaurant[] {
  return list.filter((r) => hasValidTopRatedNavbarNetScore(r.netScore));
}

/** Map `/api/ranking/restaurants` rows to map pins (meal id for detail links). */
export function mapRankedRowToRestaurant(row: RankedRestaurantRow): Restaurant | null {
  const lat = row.latitude;
  const lng = row.longitude;
  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  const mealId = row.topMealId ?? row.restaurantId;

  return {
    id: String(mealId),
    restaurantId: String(row.restaurantId),
    name: row.restaurantName,
    dish: row.dishName ?? "Meal",
    price: row.topMealPrice ?? row.price ?? 0,
    suburb: row.suburb,
    address: row.address ?? row.suburb,
    imageUrl: row.image,
    position: { lat, lng },
    netScore: row.votes.netScore,
    voteCount: row.votes.upvotes + row.votes.downvotes,
    worthIt: row.votes.upvotes,
    overrated: row.votes.downvotes,
    isTopRated: true,
    isFeatured: false,
    isHotDeal: false,
  };
}

export function mapRankedRowsToRestaurants(rows: RankedRestaurantRow[]): Restaurant[] {
  return filterTopRatedNavbarRestaurants(
    rows.map(mapRankedRowToRestaurant).filter((r): r is Restaurant => r != null),
  );
}
