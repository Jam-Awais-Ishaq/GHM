import type { FilterListingRestaurant } from "@/api/types/listings";
import type { Restaurant } from "@/features/restaurants/types/restaurant";

export function mapFilterListingToRestaurants(
  rows: FilterListingRestaurant[],
  maxPrice?: number,
): Restaurant[] {
  const out: Restaurant[] = [];

  for (const r of rows) {
    if (r.latitude == null || r.longitude == null) continue;

    for (const meal of r.meals) {
      if (meal.status !== "APPROVED") continue;
      if (maxPrice != null && meal.price > maxPrice) continue;

      out.push({
        id: String(meal.id),
        name: r.name,
        dish: meal.dishName,
        price: meal.price,
        suburb: r.suburb,
        address: r.suburb,
        imageUrl: r.image,
        position: { lat: r.latitude, lng: r.longitude },
        netScore: 0,
        worthIt: 0,
        overrated: 0,
        isHotDeal: true,
      });
    }
  }

  return out;
}
