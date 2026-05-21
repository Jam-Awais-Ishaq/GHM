import type { ReportedMealDto } from "@/api/types/admin";
import type { ReportedListing } from "@/features/submissions/data/mock-submissions";

export function mapReportedMealToListing(meal: ReportedMealDto): ReportedListing {
  const reports = meal.reports ?? [];
  const sorted = [...reports].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return {
    id: String(meal.id),
    mealId: meal.id,
    restaurantId: meal.restaurant.id,
    restaurant: meal.restaurant.name,
    dish: meal.dishName,
    price: meal.price,
    suburb: meal.restaurant.suburb,
    imageUrl: meal.image,
    flagCount: reports.length,
    isHidden: meal.isHidden,
    latestReason: sorted[0]?.reason ?? "No reason provided",
    reasons: sorted.map((r) => r.reason),
  };
}
