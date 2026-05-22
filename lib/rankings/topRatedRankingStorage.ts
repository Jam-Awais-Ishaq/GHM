import type { RankedRestaurantRow } from "@/api/types/ranking";
import type { LatLng } from "@/features/restaurants/types/restaurant";
import { haversineKm } from "@/features/restaurants/utils/distance";

import { setStoredPopularityNetScore } from "@/lib/rankings/restaurantPopularityStorage";

const STORAGE_KEY = "ghm-top-rated-ranking";
const MAX_AGE_MS = 5 * 60_000;
/** Re-fetch leaderboard when the map centre moves beyond this (km). */
const CACHE_CENTER_MAX_DRIFT_KM = 0.35;

type StoredTopRated = {
  restaurantIds: number[];
  updatedAt: number;
  center?: LatLng;
  radiusKm?: number;
};

function readStored(): StoredTopRated | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null) return null;
    const ids = (parsed as StoredTopRated).restaurantIds;
    const updatedAt = (parsed as StoredTopRated).updatedAt;
    if (!Array.isArray(ids) || typeof updatedAt !== "number") return null;
    const restaurantIds = ids
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0);
    return { restaurantIds, updatedAt };
  } catch {
    return null;
  }
}

/** Save ranking leaderboard (popularity order) for map Top rated filter. */
export function syncTopRatedRanking(
  rows: RankedRestaurantRow[],
  context?: { center: LatLng; radiusKm: number },
): void {
  if (typeof window === "undefined" || rows.length === 0) return;

  const sorted = [...rows].sort(
    (a, b) => (b.popularityScore ?? 0) - (a.popularityScore ?? 0),
  );

  const restaurantIds = sorted.map((r) => r.restaurantId);
  for (const row of sorted) {
    if (row.popularityScore != null) {
      setStoredPopularityNetScore(row.restaurantId, row.popularityScore);
    }
  }

  const payload: StoredTopRated = {
    restaurantIds,
    updatedAt: Date.now(),
    ...(context
      ? { center: context.center, radiusKm: context.radiusKm }
      : {}),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function getTopRatedRestaurantIdSet(): Set<number> {
  const stored = readStored();
  if (!stored) return new Set();
  return new Set(stored.restaurantIds);
}

export function isTopRatedRankingCacheFresh(
  center?: LatLng,
  radiusKm?: number,
): boolean {
  const stored = readStored();
  if (!stored || stored.restaurantIds.length === 0) return false;
  if (Date.now() - stored.updatedAt >= MAX_AGE_MS) return false;

  if (center && stored.center) {
    if (haversineKm(center, stored.center) > CACHE_CENTER_MAX_DRIFT_KM) {
      return false;
    }
  }

  if (
    radiusKm != null &&
    stored.radiusKm != null &&
    Math.abs(stored.radiusKm - radiusKm) > 0.01
  ) {
    return false;
  }

  return true;
}

export function restaurantIdFromListing(r: {
  restaurantId?: string;
  id: string;
}): number {
  const rid = r.restaurantId != null ? Number.parseInt(String(r.restaurantId), 10) : NaN;
  if (Number.isFinite(rid) && rid > 0) return rid;
  const mid = Number.parseInt(r.id, 10);
  return Number.isFinite(mid) && mid > 0 ? mid : 0;
}

export function filterRestaurantsToTopRatedLeaderboard<T extends {
  restaurantId?: string;
  id: string;
}>(list: T[], topIds: Set<number>): T[] {
  if (topIds.size === 0) return [];
  const order = new Map(
    [...topIds].map((id, index) => [id, index] as const),
  );
  return list
    .filter((r) => order.has(restaurantIdFromListing(r)))
    .sort(
      (a, b) =>
        (order.get(restaurantIdFromListing(a)) ?? 0) -
        (order.get(restaurantIdFromListing(b)) ?? 0),
    );
}
