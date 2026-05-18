"use client";

import { useMemo } from "react";
import { Polyline } from "react-leaflet";

import type { RouteOption } from "@/features/maps/types/drivingRoute";
import { buildRouteWithConnectors } from "@/features/maps/utils/routeGeometry";
import type { LatLng } from "@/features/restaurants/types/restaurant";
import {
  ROUTE_CONNECTOR_COLOR,
  ROUTE_SELECTED_COLOR,
  ROUTE_SELECTED_WEIGHT,
  ROUTE_UNSELECTED_COLOR,
  ROUTE_UNSELECTED_WEIGHT,
} from "@/lib/maps/routeStyles";

type MapDrivingRouteLeafletProps = {
  options: RouteOption[];
  selectedIndex: number;
  origin?: LatLng | null;
  destination?: LatLng | null;
};

function toPositions(path: LatLng[]): [number, number][] {
  return path.map((p) => [p.lat, p.lng]);
}

function DottedConnector({ path }: { path: LatLng[] }) {
  if (path.length < 2) return null;
  return (
    <Polyline
      positions={toPositions(path)}
      pathOptions={{
        color: ROUTE_CONNECTOR_COLOR,
        weight: 4,
        opacity: 0.95,
        dashArray: "2, 9",
        lineCap: "round",
      }}
    />
  );
}

export function MapDrivingRouteLeaflet({
  options,
  selectedIndex,
  origin,
  destination,
}: MapDrivingRouteLeafletProps) {
  const selectedConnectors = useMemo(() => {
    const path = options[selectedIndex]?.path ?? [];
    if (!path.length) {
      return { mainPath: [], originConnector: null, destinationConnector: null };
    }
    return buildRouteWithConnectors(path, origin, destination);
  }, [options, selectedIndex, origin, destination]);

  if (!options.length) return null;

  return (
    <>
      {options.map((opt, i) => {
        if (!opt.path.length) return null;
        const selected = i === selectedIndex;
        return (
          <Polyline
            key={opt.id}
            positions={toPositions(opt.path)}
            pathOptions={{
              color: selected ? ROUTE_SELECTED_COLOR : ROUTE_UNSELECTED_COLOR,
              weight: selected ? ROUTE_SELECTED_WEIGHT : ROUTE_UNSELECTED_WEIGHT,
              opacity: selected ? 1 : 0.85,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        );
      })}
      {selectedConnectors.originConnector && (
        <DottedConnector path={selectedConnectors.originConnector} />
      )}
      {selectedConnectors.destinationConnector && (
        <DottedConnector path={selectedConnectors.destinationConnector} />
      )}
    </>
  );
}
