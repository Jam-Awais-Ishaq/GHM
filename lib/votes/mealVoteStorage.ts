export type MealVoteChoice = "UP" | "DOWN";

const STORAGE_KEY = "ghm-meal-votes";

function readAll(): Record<string, MealVoteChoice> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed as Record<string, MealVoteChoice>;
  } catch {
    return {};
  }
}

export function getMealVoteChoice(mealId: number | string): MealVoteChoice | null {
  const choice = readAll()[String(mealId)];
  return choice === "UP" || choice === "DOWN" ? choice : null;
}

export function setMealVoteChoice(mealId: number | string, voteType: MealVoteChoice) {
  const all = readAll();
  all[String(mealId)] = voteType;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
