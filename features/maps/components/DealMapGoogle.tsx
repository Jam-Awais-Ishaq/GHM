"use client";

import {
  AdvancedMarker,
  APIProvider,
  Map,
  useMap,
} from "@vis.gl/react-google-maps";
import { Crown } from "lucide-react";
import { useEffect } from "react";

import { env } from "@/config/env";
import type { DealMapProps } from "@/features/maps/map-types";
import { isNearBrisbane, mapCameraCenter } from "@/features/maps/utils/nearBrisbane";
import {
  BRISBANE_BOUNDS,
  DEFAULT_MAP_ZOOM,
  SILVER_MAP_STYLE,
} from "@/lib/maps/googleMaps";
import { cn } from "@/lib/utils/cn";
import { formatPriceCompact } from "@/lib/utils/formatCurrency";

function RecenterOnUser({
  coords,
  flyTo,
}: {
  coords: NonNullable<DealMapProps["userCoords"]> | null;
  flyTo: DealMapProps["flyTo"];
}) {
  const map = useMap();
  useEffect(() => {
    if (flyTo) return;
    if (map && coords && isNearBrisbane(coords)) map.panTo(coords);
  }, [map, coords, flyTo]);
  return null;
}

function MapFlyToSearch({ target }: { target: google.maps.LatLngLiteral | null | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !target) return;
    const current = map.getZoom() ?? DEFAULT_MAP_ZOOM;
    const z = current < 15 ? 15 : current;
    map.panTo(target);
    map.setZoom(z);
  }, [map, target?.lat, target?.lng]);
  return null;
}

function PriceMarker({
  restaurant,
  selected,
  onSelect,
}: {
  restaurant: DealMapProps["restaurants"][number];
  selected: boolean;
  onSelect: DealMapProps["onSelect"];
}) {
  const { price, isHotDeal, isTopRated, id } = restaurant;
  const label = formatPriceCompact(price);

  const tailFill = isTopRated ? "#171717" : selected ? "#E53935" : "#FF5722";

  return (
    <AdvancedMarker
      position={restaurant.position}
      onClick={() => onSelect(id)}
      zIndex={selected ? 50 : isTopRated ? 20 : 10}
    >
      <div
        className={cn(
          "relative flex flex-col items-center drop-shadow-md transition-transform",
          selected && "scale-105",
        )}
      >
        {selected && (
          <span
            className="pointer-events-none absolute left-1/2 top-[42%] z-0 h-[4.25rem] w-[4.25rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/30 blur-2xl"
            aria-hidden
          />
        )}
        {isTopRated && (
          <Crown
            className="absolute -top-4 z-[2] h-[18px] w-[18px] text-amber-400 drop-shadow"
            strokeWidth={2.2}
            aria-hidden
          />
        )}
        <div
          className={cn(
            "relative z-[1] px-2.5 pb-1.5 pt-1.5 text-[13px] font-extrabold leading-none text-white",
            isTopRated
              ? "rounded-[18px] border-2 border-amber-400/90 bg-neutral-900"
              : selected
                ? "rounded-[18px] border border-red-700/25 bg-[#E53935] shadow-[0_0_0_3px_rgba(255,255,255,0.35)]"
                : "rounded-[18px] border border-black/[0.06] bg-[#FF5722]",
            isHotDeal && !selected && "shadow-[0_0_18px_rgba(239,68,68,0.5)]",
          )}
        >
          {label}
        </div>
        <div
          className="z-0 -mt-0.5 h-0 w-0 border-x-[9px] border-x-transparent border-t-[11px] border-t-solid"
          style={{ borderTopColor: tailFill }}
        />
      </div>
    </AdvancedMarker>
  );
}

export function DealMapGoogle({
  restaurants,
  userCoords,
  selectedId,
  onSelect,
  flyTo,
}: DealMapProps) {
  const center = mapCameraCenter(userCoords);
  const mapId = env.googleMapId.trim() || undefined;
  const showUserHere = isNearBrisbane(userCoords);

  return (
    <APIProvider apiKey={env.googleMapsApiKey} libraries={["marker"]}>
      <Map
        className="h-full w-full min-h-0"
        defaultCenter={center}
        defaultZoom={DEFAULT_MAP_ZOOM}
        minZoom={11}
        maxZoom={19}
        restriction={{
          latLngBounds: BRISBANE_BOUNDS,
          strictBounds: true,
        }}
        gestureHandling="greedy"
        disableDefaultUI
        styles={SILVER_MAP_STYLE}
        mapId={mapId}
        colorScheme="LIGHT"
      >
        <MapFlyToSearch target={flyTo ?? null} />
        <RecenterOnUser coords={userCoords} flyTo={flyTo} />
        {showUserHere && userCoords && (
          <AdvancedMarker position={userCoords} zIndex={5}>
            <div
              className="h-3.5 w-3.5 rounded-full border-[3px] border-white shadow-md"
              style={{ backgroundColor: "#E64A19" }}
              title="You"
            />
          </AdvancedMarker>
        )}
        {restaurants.map((r) => (
          <PriceMarker
            key={r.id}
            restaurant={r}
            selected={r.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </Map>
    </APIProvider>
  );
}
