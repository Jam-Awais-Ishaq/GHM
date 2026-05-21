import type { FilterListingRestaurant } from "@/api/types/listings";
import type { RestaurantDetailView } from "@/features/restaurants/types/restaurantDetail";
import { mealHasActiveHotDeal } from "@/features/restaurants/utils/hotDeal";

export function mapRestaurantDetail(row: FilterListingRestaurant): RestaurantDetailView | null {
  const meals = row.meals
    .filter((m) => m.status === "APPROVED")
    .map((m) => ({
      mealId: m.id,
      dishName: m.dishName,
      price: m.price,
      cuisine: m.cuisine,
      imageUrl: m.image,
      isHotDeal: mealHasActiveHotDeal(m),
      hotDeals: m.hotDeals ?? [],
    }));

  if (!meals.length) return null;

  return {
    restaurantId: row.id,
    name: row.name,
    suburb: row.suburb,
    address: row.suburb,
    latitude: row.latitude,
    longitude: row.longitude,
    meals,
  };
}
