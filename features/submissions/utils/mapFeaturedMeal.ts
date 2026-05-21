import type { FeaturedMealRow } from "@/api/types/featured";
import type { FeaturedListingStatus } from "@/features/submissions/data/mock-featured-listings";

export type FeaturedListingView = {
  id: string;
  mealId: number;
  restaurantId: string;
  name: string;
  dish: string;
  location: string;
  featuredUntil: string | null;
  status: FeaturedListingStatus;
  enabled: boolean;
  imageUrl?: string | null;
};

function formatFeaturedUntil(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

function resolveStatus(row: FeaturedMealRow): FeaturedListingStatus {
  if (!row.isFeatured) return "inactive";
  if (!row.featuredUntil) return "active";
  const until = new Date(row.featuredUntil);
  if (Number.isNaN(until.getTime())) return "active";
  return until.getTime() > Date.now() ? "active" : "inactive";
}

export function mapFeaturedMealToListing(row: FeaturedMealRow): FeaturedListingView {
  return {
    id: String(row.id),
    mealId: row.id,
    restaurantId: String(row.restaurantId),
    name: row.restaurant.name,
    dish: row.dishName,
    location: row.restaurant.suburb,
    featuredUntil: formatFeaturedUntil(row.featuredUntil),
    status: resolveStatus(row),
    enabled: row.isFeatured,
    imageUrl: row.image,
  };
}

export function defaultFeaturedUntilIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString();
}
