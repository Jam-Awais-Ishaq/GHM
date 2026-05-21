import { apiRequest } from "@/api/inspector";
import type {
  GetRestaurantRankingsResponse,
  GetSuburbRankingsResponse,
  RankingSortBy,
} from "@/api/types/ranking";

export type GetRestaurantRankingsParams = {
  sortBy?: RankingSortBy;
  suburb?: string;
  limit?: number;
  lat?: number;
  lng?: number;
  radiusKm?: number;
};

export function getRestaurantRankings(params: GetRestaurantRankingsParams = {}) {
  const q = new URLSearchParams();
  if (params.sortBy) q.set("sortBy", params.sortBy);
  if (params.suburb?.trim()) q.set("suburb", params.suburb.trim());
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.lat != null && params.lng != null) {
    q.set("lat", String(params.lat));
    q.set("lng", String(params.lng));
  }
  if (params.radiusKm != null) q.set("radiusKm", String(params.radiusKm));
  const qs = q.toString();
  return apiRequest<GetRestaurantRankingsResponse>(
    `/api/ranking/restaurants${qs ? `?${qs}` : ""}`,
  );
}

export function getSuburbRankings(sortBy: RankingSortBy = "popularity") {
  return apiRequest<GetSuburbRankingsResponse>(
    `/api/ranking/suburbs?sortBy=${encodeURIComponent(sortBy)}`,
  );
}
