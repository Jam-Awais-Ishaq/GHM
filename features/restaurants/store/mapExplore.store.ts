import { create } from "zustand";

import { LOCATION_SEARCH_ALIASES } from "@/constants/locationAliases";
import { SEARCH_LOCATION_RADIUS_KM, TOP_RATED_MIN_NET_SCORE } from "@/constants/limits";
import type {
  CuisineFilterId,
  LatLng,
  PriceFilterId,
  Restaurant,
  RestaurantWithDistance,
  ShowOnlyFeedsId,
} from "@/features/restaurants/types/restaurant";
import { haversineKm } from "@/features/restaurants/utils/distance";

export type SearchLocationHit = {
  lat: number;
  lng: number;
  label: string;
};

type MapExploreState = {
  activePriceFilter: PriceFilterId;
  activeCuisine: CuisineFilterId;
  showOnlyFeeds: ShowOnlyFeedsId;
  searchQuery: string;
  /** Geocoded place from search bar (Brisbane area only). */
  searchLocation: SearchLocationHit | null;
  selectedRestaurantId: string | null;
  setActivePriceFilter: (id: PriceFilterId) => void;
  setActiveCuisine: (id: CuisineFilterId) => void;
  setShowOnlyFeeds: (id: ShowOnlyFeedsId) => void;
  setSearchQuery: (q: string) => void;
  setSearchLocation: (loc: SearchLocationHit | null) => void;
  setSelectedRestaurantId: (id: string | null) => void;
};

export const useMapExploreStore = create<MapExploreState>((set) => ({
  activePriceFilter: "u12",
  activeCuisine: "all",
  showOnlyFeeds: "hot",
  searchQuery: "",
  searchLocation: null,
  selectedRestaurantId: null,
  setActivePriceFilter: (id) => set({ activePriceFilter: id }),
  setActiveCuisine: (id) => set({ activeCuisine: id }),
  setShowOnlyFeeds: (id) => set({ showOnlyFeeds: id }),
  setSearchQuery: (q) =>
    set((s) => ({
      searchQuery: q,
      searchLocation: q.trim() ? s.searchLocation : null,
    })),
  setSearchLocation: (loc) => set({ searchLocation: loc }),
  setSelectedRestaurantId: (id) => set({ selectedRestaurantId: id }),
}));

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/['']/g, "");
}

function priceTokens(price: number): string[] {
  const t = new Set<string>();
  t.add(String(price));
  if (Number.isInteger(price)) t.add(String(Math.floor(price)));
  if (price % 1 !== 0) t.add(price.toFixed(2));
  return [...t];
}

function haystack(r: Restaurant): string {
  const parts = [
    r.name,
    r.dish,
    r.suburb,
    r.address,
    r.id.replace(/-/g, " "),
    ...priceTokens(r.price).map((p) => `$${p}`),
    ...priceTokens(r.price),
  ];
  return norm(parts.join(" "));
}

function wordMatchesInStack(word: string, stack: string): boolean {
  if (!word) return true;
  if (stack.includes(word)) return true;
  const alias = LOCATION_SEARCH_ALIASES[word];
  if (!alias) return false;
  const parts = norm(alias)
    .split(/\s+/)
    .map((p) => p.replace(/^\$+/, ""))
    .filter(Boolean);
  return parts.length > 0 && parts.every((p) => stack.includes(p));
}

function matchesSearch(r: Restaurant, raw: string): boolean {
  const q = raw.trim();
  if (!q) return true;
  const stack = haystack(r);
  const words = norm(q)
    .split(/\s+/)
    .map((w) => w.replace(/^\$+/, ""))
    .filter(Boolean);
  if (words.length === 0) return true;
  return words.every((w) => wordMatchesInStack(w, stack));
}

function unionById(a: Restaurant[], b: Restaurant[]): Restaurant[] {
  const m = new Map<string, Restaurant>();
  for (const r of a) m.set(r.id, r);
  for (const r of b) m.set(r.id, r);
  return [...m.values()];
}

function applyPriceFilter(list: Restaurant[], activePriceFilter: PriceFilterId): Restaurant[] {
  switch (activePriceFilter) {
    case "top":
      return list.filter((r) => r.isTopRated || r.netScore >= TOP_RATED_MIN_NET_SCORE);
    case "u15":
      return list.filter((r) => r.price <= 15);
    case "u12":
      return list.filter((r) => r.price <= 12);
    case "u8":
      return list.filter((r) => r.price <= 8);
    case "u5":
      return list.filter((r) => r.price <= 5);
    default:
      return list;
  }
}

function nearPoint(list: Restaurant[], center: LatLng, radiusKm: number): Restaurant[] {
  return list.filter((r) => haversineKm(center, r.position) <= radiusKm);
}

function applyCuisineFilter(list: Restaurant[], id: CuisineFilterId): Restaurant[] {
  if (id === "all") return list;
  const text = (r: Restaurant) => `${r.name} ${r.dish}`.toLowerCase();
  const by: Record<Exclude<CuisineFilterId, "all">, (t: string) => boolean> = {
    vietnamese: (t) => /pho|banh|momo|viet|spring roll/.test(t),
    thai: (t) => /thai|pad thai|tom yum/.test(t),
    korean: (t) => /korean|kimchi|bulgogi|bibimbap/.test(t),
    indian: (t) => /curry|indian|naan|tikka|masala|biryani|kebab/.test(t),
    bakery: (t) => /bake|bread|croissant|cake|pastry|donut/.test(t),
    burgers: (t) => /burger/.test(t),
  };
  return list.filter((r) => by[id](text(r)));
}

function applyShowOnlyFilter(list: Restaurant[], mode: ShowOnlyFeedsId): Restaurant[] {
  if (mode === "all") return list;
  if (mode === "hot") return list.filter((r) => r.isHotDeal);
  if (mode === "verified") {
    const cutoff = Date.now() - 30 * 86400000;
    return list.filter((r) => r.priceVerifiedAt && new Date(r.priceVerifiedAt).getTime() >= cutoff);
  }
  return list.filter((r) => r.netScore >= 50);
}

export function filterRestaurants(
  list: Restaurant[],
  activePriceFilter: PriceFilterId,
  searchQuery: string,
  searchLocation: SearchLocationHit | null,
  activeCuisine: CuisineFilterId = "all",
  showOnlyFeeds: ShowOnlyFeedsId = "all",
): Restaurant[] {
  let next = applyPriceFilter(list, activePriceFilter);
  next = applyCuisineFilter(next, activeCuisine);
  next = applyShowOnlyFilter(next, showOnlyFeeds);
  const q = searchQuery.trim();
  const center: LatLng | null = searchLocation
    ? { lat: searchLocation.lat, lng: searchLocation.lng }
    : null;

  if (!q && !center) return next;

  const byText = q ? next.filter((r) => matchesSearch(r, searchQuery)) : [];
  const byNear = center ? nearPoint(next, center, SEARCH_LOCATION_RADIUS_KM) : [];

  if (q && center) return unionById(byText, byNear);
  if (q) return byText;
  return byNear;
}

export function withDistances(
  list: Restaurant[],
  user: LatLng | null,
): RestaurantWithDistance[] {
  return list.map((r) => ({
    ...r,
    distanceKm: user ? haversineKm(user, r.position) : null,
  }));
}
