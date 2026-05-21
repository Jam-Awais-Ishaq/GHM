"use client";

import { useQuery } from "@tanstack/react-query";

import { getMealVoteTotals } from "@/api/routes/votes.api";
import { formatNetScore } from "@/features/restaurants/hooks/useMealVotes";

export function useMealVoteTotals(mealId: number) {
  const query = useQuery({
    queryKey: ["meal-vote-totals", mealId],
    queryFn: async () => {
      const res = await getMealVoteTotals(mealId);
      if (!res.success) return null;
      return res.data;
    },
    enabled: Number.isFinite(mealId) && mealId > 0,
    staleTime: 30_000,
  });

  const score = query.data?.score ?? 0;

  return {
    upVotes: query.data?.upVotes ?? 0,
    downVotes: query.data?.downVotes ?? 0,
    netScoreLabel: formatNetScore(score),
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
