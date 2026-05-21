"use client";

import { useQuery } from "@tanstack/react-query";

import { getHotDeals } from "@/api/routes/listings.api";
import type { HotDealListing } from "@/api/types/listings";

export function useHotDeals() {
  return useQuery({
    queryKey: ["listings-hot-deals"],
    queryFn: async (): Promise<HotDealListing[]> => {
      const res = await getHotDeals();
      if (!res.success) return [];
      return res.data;
    },
    staleTime: 60_000,
  });
}
