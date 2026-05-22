import type { FilterListingRestaurant, ListingMeal } from "@/api/types/listings";
import { TOP_RATED_CHIP_MIN_NET_SCORE } from "@/constants/limits";
import type { Restaurant } from "@/features/restaurants/types/restaurant";
import { isMealFeaturedActive } from "@/features/restaurants/utils/featuredMeal";
import { mealHasActiveHotDeal } from "@/features/restaurants/utils/hotDeal";

type PickMapPinOptions = {
  /** Hot-deals filter: pin the meal that has a live special (not regular meals). */
  hotDealsOnly?: boolean;
};

/** One map pin per restaurant — picks cheapest eligible meal; swaps when that meal is hidden/deleted. */
function pickMapPinMeal(
  meals: ListingMeal[],
  maxPrice?: number,
  options?: PickMapPinOptions,
): ListingMeal | null {
  if (options?.hotDealsOnly) {
    const withLiveDeal = meals.filter((m) => {
      if (m.status !== "APPROVED") return false;
      if (!mealHasActiveHotDeal(m)) return false;
      if (maxPrice != null && m.price > maxPrice) return false;
      return true;
    });
    if (!withLiveDeal.length) return null;
    return withLiveDeal.reduce((best, m) => (m.price < best.price ? m : best));
  }

  const eligible = meals.filter((m) => {
    if (m.status !== "APPROVED") return false;
    if (mealHasActiveHotDeal(m)) return false;
    if (maxPrice != null && m.price > maxPrice) return false;
    return true;
  });

  if (!eligible.length) return null;

  const featured = eligible.filter((m) => isMealFeaturedActive(m));
  const pool = featured.length > 0 ? featured : eligible;

  return pool.reduce((best, m) => (m.price < best.price ? m : best));
}

export function mapListingRowsToRestaurants(
  rows: FilterListingRestaurant[],
  maxPrice?: number,
  options?: PickMapPinOptions,
): Restaurant[] {
  const out: Restaurant[] = [];

  for (const r of rows) {
    if (r.latitude == null || r.longitude == null) continue;

    const meal = pickMapPinMeal(r.meals, maxPrice, options);
    if (!meal) continue;

    const hasHotDeal =
      options?.hotDealsOnly || mealHasActiveHotDeal(meal);

    out.push({
      id: String(meal.id),
      restaurantId: String(r.id),
      name: r.name,
      dish: meal.dishName,
      price: meal.price,
      suburb: r.suburb,
      address: r.address ?? r.suburb,
      imageUrl: meal.image,
      position: { lat: r.latitude, lng: r.longitude },
      netScore: r.netScore ?? 0,
      popularityScore: r.popularityScore,
      voteCount: r.voteCount ?? 0,
      isTopRated: (r.netScore ?? 0) >= TOP_RATED_CHIP_MIN_NET_SCORE,
      worthIt: 0,
      overrated: 0,
      isHotDeal: hasHotDeal,
      isFeatured: isMealFeaturedActive(meal),
      createdAt: meal.createdAt,
    });
  }

  return out;
}

export function mapSingleListingToRestaurant(row: FilterListingRestaurant): Restaurant | null {
  if (row.latitude == null || row.longitude == null) return null;

  const meals = row.meals.filter((m) => m.status === "APPROVED");
  if (!meals.length) return null;

  const meal = meals.reduce((a, b) => (a.price <= b.price ? a : b));

  return {
    id: String(row.id),
    name: row.name,
    dish: meal.dishName,
    price: meal.price,
    suburb: row.suburb,
    address: row.address ?? row.suburb,
    imageUrl: meal.image,
    position: { lat: row.latitude, lng: row.longitude },
    netScore: 0,
    worthIt: 0,
    overrated: 0,
    isHotDeal: mealHasActiveHotDeal(meal),
  };
}
