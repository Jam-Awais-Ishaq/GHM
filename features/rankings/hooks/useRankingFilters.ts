"use client";

import { RANKING_PAGE_FILTERS } from "@/features/rankings/constants/rankingFilters";

/** Fixed filter chips for the rankings page (no suburb API / address labels). */
export function useRankingFilters() {
  return { filters: RANKING_PAGE_FILTERS };
}
