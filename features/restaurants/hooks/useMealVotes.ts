"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import { ApiError } from "@/api/inspector";
import { getMealVoteTotals, submitMealVote } from "@/api/routes/votes.api";
import type { MealVoteTotals, VoteType } from "@/api/types/votes";
import { getOrCreateDeviceId } from "@/lib/votes/deviceId";
import { getMealVoteChoice, setMealVoteChoice } from "@/lib/votes/mealVoteStorage";

const EMPTY: MealVoteTotals = {
  upVotes: 0,
  downVotes: 0,
  totalVotes: 0,
  score: 0,
};

export function formatNetScore(score: number): string {
  if (score > 0) return `+${score}`;
  if (score === 0) return "+0";
  return String(score);
}

export function useMealVotes(mealId: number) {
  const queryClient = useQueryClient();
  const [totals, setTotals] = useState<MealVoteTotals>(EMPTY);
  const [myVote, setMyVote] = useState<"UP" | "DOWN" | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<"UP" | "DOWN" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voteLocked, setVoteLocked] = useState(false);

  const refresh = useCallback(async () => {
    if (!Number.isFinite(mealId) || mealId <= 0) {
      setTotals(EMPTY);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getMealVoteTotals(mealId);
      if (res.success && res.data) {
        setTotals(res.data);
      }
      const stored = getMealVoteChoice(mealId);
      setMyVote(stored);
      if (stored) setVoteLocked(true);
    } catch (err) {
      setTotals(EMPTY);
      setError(err instanceof ApiError ? err.message : "Could not load votes.");
    } finally {
      setLoading(false);
    }
  }, [mealId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const vote = useCallback(
    async (voteType: VoteType) => {
      if (myVote || submitting) return;

      setSubmitting(voteType);
      setError(null);

      try {
        const res = await submitMealVote(mealId, voteType, getOrCreateDeviceId());
        if (res.success && res.data) {
          setTotals(res.data);
          setMealVoteChoice(mealId, voteType);
          setMyVote(voteType);
          setVoteLocked(true);
          void queryClient.invalidateQueries({ queryKey: ["meal-vote-totals", mealId] });
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          const stored = getMealVoteChoice(mealId);
          if (stored) setMyVote(stored);
          setVoteLocked(true);
          setError("You already voted for this meal.");
          void refresh();
          return;
        }
        setError(
          err instanceof ApiError ? err.message : "Could not submit your vote.",
        );
      } finally {
        setSubmitting(null);
      }
    },
    [mealId, myVote, submitting, refresh],
  );

  const hasVoted = voteLocked || myVote != null;

  return {
    totals,
    netScoreLabel: formatNetScore(totals.score),
    myVote,
    hasVoted,
    loading,
    submitting,
    error,
    voteUp: () => vote("UP"),
    voteDown: () => vote("DOWN"),
    refresh,
  };
}
