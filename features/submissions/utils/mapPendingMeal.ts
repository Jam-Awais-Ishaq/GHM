import type { PendingMealDto } from "@/api/types/admin";
import type { PendingSubmission } from "@/features/submissions/data/mock-submissions";

export function mapPendingMealToSubmission(meal: PendingMealDto): PendingSubmission {
  return {
    id: String(meal.id),
    restaurant: meal.restaurant.name,
    price: meal.price,
    dish: meal.dishName,
    suburb: meal.restaurant.suburb,
    imageUrl: meal.image,
  };
}
