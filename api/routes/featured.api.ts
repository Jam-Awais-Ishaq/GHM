import { apiRequest } from "@/api/inspector";
import type {
  GetFeaturedListingsResponse,
  SearchRestaurantsResponse,
  ToggleFeaturedResponse,
} from "@/api/types/featured";

export function getFeaturedListings(search?: string) {
  const q = search?.trim();
  const qs = q ? `?search=${encodeURIComponent(q)}` : "";
  return apiRequest<GetFeaturedListingsResponse>(`/api/admin/featured${qs}`, {
    credentials: "include",
  });
}

export function toggleFeaturedListing(
  mealId: number,
  body: { isFeatured: boolean; featuredUntil?: string | null },
) {
  return apiRequest<ToggleFeaturedResponse>(`/api/admin/featured/${mealId}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** All approved meals when `query` is empty; FTS search when 2+ chars. */
export function listMealsForFeaturedAdmin(query = "", limit = 100) {
  const q = new URLSearchParams();
  const trimmed = query.trim();
  if (trimmed.length >= 2) q.set("q", trimmed);
  q.set("limit", String(limit));
  return apiRequest<SearchRestaurantsResponse>(
    `/api/admin/restaurants/search?${q.toString()}`,
    { credentials: "include" },
  );
}
