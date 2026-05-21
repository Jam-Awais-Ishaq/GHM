export type VoteType = "UP" | "DOWN";

export type MealVoteTotals = {
  upVotes: number;
  downVotes: number;
  totalVotes: number;
  score: number;
};

export type MealVoteTotalsResponse = {
  success: boolean;
  data: MealVoteTotals;
};

export type SubmitMealVoteResponse = {
  success: boolean;
  message: string;
  data: MealVoteTotals;
};
