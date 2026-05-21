import { ApiError, apiRequest } from "@/api/inspector";
import { env } from "@/config/env";
import type {
  CreateListingResponse,
  FilterListingsResponse,
  HotDealsResponse,
  ListingsResponse,
  SingleListingResponse,
} from "@/api/types/listings";

export type FilterListingsParams = {
  maxPrice?: number;
  cuisine?: string;
};

export function getListings() {
  return apiRequest<ListingsResponse>("/api/listings");
}

export function getListing(id: string | number) {
  return apiRequest<SingleListingResponse>(`/api/listings/${id}`);
}

export function getHotDeals() {
  return apiRequest<HotDealsResponse>("/api/listings/hot-deals");
}

/** Drop a feed — multipart POST, no auth required. */
export async function createListing(formData: FormData): Promise<CreateListingResponse> {
  const res = await fetch(`${env.apiBaseUrl}/api/listings`, {
    method: "POST",
    body: formData,
    credentials: "omit",
  });

  const data: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data);
  }

  return data as CreateListingResponse;
}

export function filterListings(params: FilterListingsParams = {}) {
  const q = new URLSearchParams();
  if (params.maxPrice != null) q.set("maxPrice", String(params.maxPrice));
  if (params.cuisine?.trim()) q.set("cuisine", params.cuisine.trim());
  const qs = q.toString();
  return apiRequest<FilterListingsResponse>(
    `/api/listings/filter${qs ? `?${qs}` : ""}`,
  );
}
