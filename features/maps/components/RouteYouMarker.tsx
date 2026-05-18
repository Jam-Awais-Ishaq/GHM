"use client";

import {
  MapRouteDotGoogle,
  MapRouteDotLeaflet,
} from "@/features/maps/components/MapRouteDot";
import type { LatLng } from "@/features/restaurants/types/restaurant";

type Props = {
  coords: LatLng;
  onContextMenu?: (e: React.MouseEvent) => void;
};

export function RouteYouMarkerGoogle({ coords, onContextMenu }: Props) {
  return <MapRouteDotGoogle coords={coords} variant="you" onContextMenu={onContextMenu} />;
}

export function RouteYouMarkerLeaflet({
  coords,
  onMapContextMenu,
}: {
  coords: LatLng;
  onMapContextMenu?: (e: import("leaflet").LeafletMouseEvent) => void;
}) {
  return <MapRouteDotLeaflet coords={coords} variant="you" onMapContextMenu={onMapContextMenu} />;
}
