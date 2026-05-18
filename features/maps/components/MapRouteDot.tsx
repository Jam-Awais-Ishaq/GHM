"use client";

import { AdvancedMarker } from "@vis.gl/react-google-maps";
import L from "leaflet";
import { Marker } from "react-leaflet";

import type { LatLng } from "@/features/restaurants/types/restaurant";

export const ROUTE_DOT = {
  you: { fill: "#2563eb", size: 12 },
  restaurant: { fill: "#EA4335", size: 12 },
  gps: { fill: "#E65100", size: 11 },
} as const;

type MapRouteDotProps = {
  coords: LatLng;
  variant: keyof typeof ROUTE_DOT;
  onContextMenu?: (e: React.MouseEvent) => void;
  onClick?: () => void;
};

function DotStyle({ variant }: { variant: keyof typeof ROUTE_DOT }) {
  const { fill, size } = ROUTE_DOT[variant];
  return (
    <div
      className="rounded-full border-2 border-white shadow-[0_1px_6px_rgba(0,0,0,0.28)]"
      style={{ width: size, height: size, backgroundColor: fill }}
      aria-hidden
    />
  );
}

export function MapRouteDotGoogle({
  coords,
  variant,
  onContextMenu,
  onClick,
}: MapRouteDotProps) {
  return (
    <AdvancedMarker position={coords} zIndex={variant === "restaurant" ? 55 : 8} onClick={onClick}>
      <div
        role="img"
        aria-label={variant === "you" ? "Your location" : variant === "restaurant" ? "Restaurant" : "Location"}
        className="cursor-context-menu"
        onContextMenu={onContextMenu}
      >
        <DotStyle variant={variant} />
      </div>
    </AdvancedMarker>
  );
}

function leafletDotIcon(variant: keyof typeof ROUTE_DOT): L.DivIcon {
  const { fill, size } = ROUTE_DOT[variant];
  return L.divIcon({
    className: "ghm-route-dot",
    html: `<div style="
      width:${size}px;height:${size}px;
      border-radius:9999px;
      background:${fill};
      border:2px solid #fff;
      box-shadow:0 1px 6px rgba(0,0,0,0.28);
    "></div>`,
    iconSize: [size + 4, size + 4],
    iconAnchor: [(size + 4) / 2, (size + 4) / 2],
  });
}

export function MapRouteDotLeaflet({
  coords,
  variant,
  onMapContextMenu,
  onClick,
}: Omit<MapRouteDotProps, "onContextMenu"> & {
  onMapContextMenu?: (e: L.LeafletMouseEvent) => void;
}) {
  return (
    <Marker
      position={[coords.lat, coords.lng]}
      icon={leafletDotIcon(variant)}
      zIndexOffset={variant === "restaurant" ? 900 : 700}
      eventHandlers={{
        ...(onClick ? { click: onClick } : {}),
        ...(onMapContextMenu
          ? {
              contextmenu: (e: L.LeafletMouseEvent) => {
                onMapContextMenu(e);
                L.DomEvent.stopPropagation(e);
              },
            }
          : {}),
      }}
    />
  );
}
