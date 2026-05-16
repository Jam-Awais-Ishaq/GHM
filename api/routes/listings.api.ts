import { apiRequest } from "@/api/inspector";
import type { FilterListingsResponse } from "@/api/types/listings";

export type FilterListingsParams = {
  maxPrice?: number;
  cuisine?: string;
};

export function filterListings(params: FilterListingsParams = {}) {
  const q = new URLSearchParams();
  if (params.maxPrice != null) q.set("maxPrice", String(params.maxPrice));
  if (params.cuisine?.trim()) q.set("cuisine", params.cuisine.trim());
  const qs = q.toString();
  return apiRequest<FilterListingsResponse>(
    `/api/listings/filter${qs ? `?${qs}` : ""}`,
  );
}
