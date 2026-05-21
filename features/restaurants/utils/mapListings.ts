import type { FilterListingRestaurant, ListingMeal } from "@/api/types/listings";
import type { Restaurant } from "@/features/restaurants/types/restaurant";
import { isMealFeaturedActive } from "@/features/restaurants/utils/featuredMeal";
import { mealHasActiveHotDeal } from "@/features/restaurants/utils/hotDeal";

/** One map pin per restaurant — picks cheapest eligible meal; swaps when that meal is hidden/deleted. */
function pickMapPinMeal(
  meals: ListingMeal[],
  maxPrice?: number,
): ListingMeal | null {
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
): Restaurant[] {
  const out: Restaurant[] = [];

  for (const r of rows) {
    if (r.latitude == null || r.longitude == null) continue;

    const meal = pickMapPinMeal(r.meals, maxPrice);
    if (!meal) continue;

    out.push({
      id: String(meal.id),
      restaurantId: String(r.id),
      name: r.name,
      dish: meal.dishName,
      price: meal.price,
      suburb: r.suburb,
      address: r.suburb,
      imageUrl: meal.image,
      position: { lat: r.latitude, lng: r.longitude },
      netScore: 0,
      worthIt: 0,
      overrated: 0,
      isHotDeal: false,
      isFeatured: isMealFeaturedActive(meal),
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
    address: row.suburb,
    imageUrl: meal.image,
    position: { lat: row.latitude, lng: row.longitude },
    netScore: 0,
    worthIt: 0,
    overrated: 0,
    isHotDeal: mealHasActiveHotDeal(meal),
  };
}
