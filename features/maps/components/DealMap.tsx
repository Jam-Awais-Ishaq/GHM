"use client";

import dynamic from "next/dynamic";

import { env } from "@/config/env";
import type { DealMapProps } from "@/features/maps/map-types";
import { DealMapGoogle } from "@/features/maps/components/DealMapGoogle";

const DealMapLeaflet = dynamic(
  () => import("@/features/maps/components/DealMapLeaflet").then((m) => m.DealMapLeaflet),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[50vh] flex-1 items-center justify-center bg-[#eceae6] text-sm text-neutral-500">
        Loading map…
      </div>
    ),
  },
);

export type { DealMapProps } from "@/features/maps/map-types";

export function DealMap(props: DealMapProps) {
  const tree = !env.googleMapsApiKey.trim() ? (
    <DealMapLeaflet {...props} />
  ) : (
    <DealMapGoogle {...props} />
  );
  return <div className="h-full min-h-0 w-full">{tree}</div>;
}
