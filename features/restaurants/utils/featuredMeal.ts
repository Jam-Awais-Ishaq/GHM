/** Meal is actively featured for map pin (admin toggle + optional end date). */
export function isMealFeaturedActive(meal: {
  isFeatured?: boolean;
  featuredUntil?: string | null;
}): boolean {
  if (!meal.isFeatured) return false;
  if (!meal.featuredUntil) return true;
  const until = new Date(meal.featuredUntil);
  return !Number.isNaN(until.getTime()) && until.getTime() > Date.now();
}
