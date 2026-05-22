import { PRICE_FILTER_CHIPS } from "@/constants/filters";
import type { FilterListingsParams } from "@/api/routes/listings.api";
import type {
  CuisineFilterId,
  PriceFilterId,
  ShowOnlyFeedsId,
} from "@/features/restaurants/types/restaurant";

/** Filter feeds modal SHOW ONLY → `/api/listings/filter` query flags. */
export function showOnlyFeedsToApi(
  show: ShowOnlyFeedsId,
): Pick<FilterListingsParams, "hotDeals" | "priceVerified" | "topRated"> {
  switch (show) {
    case "hotDeals":
      return { hotDeals: true };
    case "verified":
      return { priceVerified: true };
    case "top50":
      return { topRated: true };
    default:
      return {};
  }
}

/** SHOW ONLY flags for listings API (`top50` adds `topRated` + lat/lng in `fetchMapListings`). */
export function showOnlyFeedsToListingsApi(
  show: ShowOnlyFeedsId,
): Pick<FilterListingsParams, "hotDeals" | "priceVerified"> {
  const { hotDeals, priceVerified } = showOnlyFeedsToApi(show);
  return {
    ...(hotDeals ? { hotDeals: true } : {}),
    ...(priceVerified ? { priceVerified: true } : {}),
  };
}

export function maxPriceForFilter(id: PriceFilterId): number | undefined {
  const chip = PRICE_FILTER_CHIPS.find((c) => c.id === id);
  if (!chip || chip.topRatedOnly) return undefined;
  return chip.maxPrice ?? undefined;
}

export function isTopRatedFilter(id: PriceFilterId): boolean {
  return id === "top";
}

export function cuisineFilterToApi(id: CuisineFilterId): string | undefined {
  if (id === "all") return undefined;
  const map: Record<Exclude<CuisineFilterId, "all">, string> = {
    vietnamese: "Vietnamese",
    thai: "Thai",
    korean: "Korean",
    indian: "Indian",
    bakery: "Bakery",
    burgers: "Burgers",
  };
  return map[id];
}
