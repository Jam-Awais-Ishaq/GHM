"use client";

import { useQuery } from "@tanstack/react-query";

import { getListings } from "@/api/routes/listings.api";
import { mapListingRowsToRestaurants } from "@/features/restaurants/utils/mapListings";
import type { Restaurant } from "@/features/restaurants/types/restaurant";

export function useListings() {
  return useQuery({
    queryKey: ["listings"],
    queryFn: async (): Promise<Restaurant[]> => {
      const res = await getListings();
      if (!res.success) return [];
      return mapListingRowsToRestaurants(res.data);
    },
    staleTime: 60_000,
  });
}
