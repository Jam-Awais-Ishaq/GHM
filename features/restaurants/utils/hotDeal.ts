import type { ListingHotDeal } from "@/api/types/listings";

/** True when deal is active and within its start/end window (same rules as backend). */
export function isActiveHotDeal(deal: ListingHotDeal, now = Date.now()): boolean {
  if (!deal.isActive) return false;
  const start = new Date(deal.startDateTime).getTime();
  const end = new Date(deal.endDateTime).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return false;
  return now >= start && now <= end;
}

export function mealHasActiveHotDeal(meal: { hotDeals?: ListingHotDeal[] }): boolean {
  return (meal.hotDeals ?? []).some((d) => isActiveHotDeal(d));
}

export function dealRemainingMs(deal: ListingHotDeal, now = Date.now()): number {
  if (deal.remainingMs != null && Number.isFinite(deal.remainingMs)) {
    return Math.max(0, deal.remainingMs);
  }
  return Math.max(0, new Date(deal.endDateTime).getTime() - now);
}

export function formatDealRemaining(ms: number): string {
  if (ms <= 0) return "Ended";
  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  const seconds = Math.floor((ms % 60_000) / 1000);
  if (minutes > 0) return `${minutes}m ${seconds}s left`;
  return `${seconds}s left`;
}

export type ActiveDealAtRestaurant = {
  mealId: number;
  dishName: string;
  price: number;
  deal: ListingHotDeal;
  remainingMs: number;
};

function mealRowId(meal: { id?: number; mealId?: number }): number {
  return meal.mealId ?? meal.id ?? 0;
}

/** Soonest-ending active hot deal at this restaurant (for blinking popup). */
export function getSoonestActiveDeal(
  meals: {
    id?: number;
    mealId?: number;
    dishName: string;
    price: number;
    hotDeals?: ListingHotDeal[];
  }[],
  now = Date.now(),
): ActiveDealAtRestaurant | null {
  const items: ActiveDealAtRestaurant[] = [];

  for (const meal of meals) {
    const mealId = mealRowId(meal);
    if (!mealId) continue;
    for (const deal of meal.hotDeals ?? []) {
      if (!isActiveHotDeal(deal, now)) continue;
      items.push({
        mealId,
        dishName: meal.dishName,
        price: meal.price,
        deal,
        remainingMs: dealRemainingMs(deal, now),
      });
    }
  }

  if (!items.length) return null;
  return items.sort((a, b) => a.remainingMs - b.remainingMs)[0]!;
}
