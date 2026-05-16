import { PRICE_FILTER_CHIPS } from "@/constants/filters";
import type {
  CuisineFilterId,
  PriceFilterId,
} from "@/features/restaurants/types/restaurant";

export function maxPriceForFilter(id: PriceFilterId): number | undefined {
  const chip = PRICE_FILTER_CHIPS.find((c) => c.id === id);
  if (!chip || chip.topRatedOnly) return undefined;
  return chip.maxPrice ?? undefined;
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
