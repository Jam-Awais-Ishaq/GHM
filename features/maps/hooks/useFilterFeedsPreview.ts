"use client";

import { useQuery } from "@tanstack/react-query";

import type { SearchLocationHit } from "@/features/restaurants/store/mapExplore.store";
import { filterRestaurants } from "@/features/restaurants/store/mapExplore.store";
import type {
  CuisineFilterId,
  LatLng,
  PriceFilterId,
  ShowOnlyFeedsId,
} from "@/features/restaurants/types/restaurant";
import { fetchMapListings } from "@/features/maps/services/fetchMapListings";

type Params = {
  open: boolean;
  searchCenter: LatLng;
  draftPrice: PriceFilterId;
  draftCuisine: CuisineFilterId;
  draftShow: ShowOnlyFeedsId;
  searchQuery: string;
  searchLocation: SearchLocationHit | null;
};

export function useFilterFeedsPreview({
  open,
  searchCenter,
  draftPrice,
  draftCuisine,
  draftShow,
  searchQuery,
  searchLocation,
}: Params) {
  const query = useQuery({
    queryKey: [
      "filter-feeds-preview",
      searchCenter.lat,
      searchCenter.lng,
      draftPrice,
      draftCuisine,
    ],
    queryFn: () =>
      fetchMapListings(searchCenter, {
        priceFilterId: draftPrice,
        cuisineId: draftCuisine,
      }),
    enabled: open,
    staleTime: 30_000,
  });

  const count = filterRestaurants(
    query.data ?? [],
    draftPrice,
    searchQuery,
    searchLocation,
    draftCuisine,
    draftShow,
  ).length;

  return {
    count,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  };
}
