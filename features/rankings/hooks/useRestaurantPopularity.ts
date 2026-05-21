"use client";

import { useQuery } from "@tanstack/react-query";

import { getRestaurantRankings } from "@/api/routes/ranking.api";
import type { RankedRestaurantRow } from "@/api/types/ranking";

/** Ranking row for one restaurant (votes, activity, engagement, popularity). */
export function useRestaurantPopularity(restaurantId: number, suburb: string) {
  return useQuery({
    queryKey: ["restaurant-popularity", restaurantId, suburb],
    queryFn: async () => {
      const res = await getRestaurantRankings({
        suburb: suburb.trim() || undefined,
        limit: 50,
        sortBy: "popularity",
      });
      return res.data.find((r) => r.restaurantId === restaurantId) ?? null;
    },
    enabled: restaurantId > 0,
    staleTime: 60_000,
  });
}

export function getPopularityScoreFromRow(row: RankedRestaurantRow | null | undefined) {
  return row?.popularityScore ?? null;
}
