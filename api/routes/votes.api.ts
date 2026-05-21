import { apiRequest } from "@/api/inspector";
import type {
  MealVoteTotalsResponse,
  SubmitMealVoteResponse,
  VoteType,
} from "@/api/types/votes";

export function getMealVoteTotals(mealId: number | string) {
  return apiRequest<MealVoteTotalsResponse>(`/api/votes/${mealId}/total`);
}

export function submitMealVote(
  mealId: number | string,
  voteType: VoteType,
  deviceId: string,
) {
  return apiRequest<SubmitMealVoteResponse>(`/api/votes/${mealId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ voteType, deviceId }),
  });
}
