"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchMapListings, type MapListingsFilterParams } from "@/features/maps/services/fetchMapListings";
import type { LatLng, Restaurant } from "@/features/restaurants/types/restaurant";

export type { MapListingsFilterParams };

export function useNearbyRestaurants(
  searchCenter: LatLng,
  filters: MapListingsFilterParams,
) {
  const query = useQuery({
    queryKey: [
      "map-listings",
      searchCenter.lat,
      searchCenter.lng,
      filters.priceFilterId,
      filters.cuisineId,
    ],
    queryFn: () => fetchMapListings(searchCenter, filters),
    staleTime: 60_000,
  });

  const restaurants: Restaurant[] = query.data ?? [];

  return {
    restaurants,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
