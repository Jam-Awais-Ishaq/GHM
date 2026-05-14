import type { PriceFilterId } from "@/features/restaurants/types/restaurant";

export const PRICE_FILTER_CHIPS: {
  id: PriceFilterId;
  label: string;
  maxPrice: number | null;
  topRatedOnly?: boolean;
}[] = [
  { id: "u15", label: "Under $15", maxPrice: 15 },
  { id: "u12", label: "Under $12", maxPrice: 12 },
  { id: "u8", label: "Under $8", maxPrice: 8 },
  { id: "u5", label: "Under $5", maxPrice: 5 },
  { id: "top", label: "Top Rated", maxPrice: null, topRatedOnly: true },
];
