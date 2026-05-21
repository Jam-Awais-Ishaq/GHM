import { notFound } from "next/navigation";

import { ApiError } from "@/api/inspector";
import { getListing } from "@/api/routes/listings.api";
import { RestaurantDetailScreen } from "@/features/restaurants/components/RestaurantDetailScreen";
import { getSoonestActiveDeal } from "@/features/restaurants/utils/hotDeal";
import { mapRestaurantDetail } from "@/features/restaurants/utils/mapRestaurantDetail";
import { siteConfig } from "@/config/site";
import { formatPriceCompact } from "@/lib/utils/formatCurrency";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ meal?: string }>;
};

async function loadRestaurantDetail(id: string) {
  try {
    const res = await getListing(id);
    if (!res.success || !res.data) return null;
    return mapRestaurantDetail(res.data);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

function resolveInitialMealId(
  detail: NonNullable<Awaited<ReturnType<typeof loadRestaurantDetail>>>,
  routeId: string,
  mealParam?: string,
): number {
  const candidates = [mealParam, routeId]
    .filter(Boolean)
    .map((v) => Number.parseInt(v!, 10));
  for (const parsed of candidates) {
    if (Number.isFinite(parsed) && detail.meals.some((m) => m.mealId === parsed)) {
      return parsed;
    }
  }
  const soonest = getSoonestActiveDeal(detail.meals);
  return soonest?.mealId ?? detail.meals[0]!.mealId;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const detail = await loadRestaurantDetail(id);
  if (!detail) return { title: `Not found · ${siteConfig.name}` };
  const meal = detail.meals[0]!;
  return {
    title: `${detail.name} · ${formatPriceCompact(meal.price)} · ${siteConfig.name}`,
    description: meal.dishName,
  };
}

export default async function RestaurantPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { meal: mealParam } = await searchParams;
  const detail = await loadRestaurantDetail(id);
  if (!detail) notFound();

  const initialMealId = resolveInitialMealId(detail, id, mealParam);

  return <RestaurantDetailScreen detail={detail} initialMealId={initialMealId} />;
}
