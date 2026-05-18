"use client";

import { useMap } from "@vis.gl/react-google-maps";
import { useEffect, useMemo } from "react";

import type { RouteOption } from "@/features/maps/types/drivingRoute";
import { buildRouteWithConnectors } from "@/features/maps/utils/routeGeometry";
import type { LatLng } from "@/features/restaurants/types/restaurant";
import {
  ROUTE_CONNECTOR_COLOR,
  ROUTE_CONNECTOR_DOT_REPEAT_PX,
  ROUTE_CONNECTOR_DOT_SCALE,
  ROUTE_SELECTED_COLOR,
  ROUTE_SELECTED_WEIGHT,
  ROUTE_UNSELECTED_COLOR,
  ROUTE_UNSELECTED_WEIGHT,
} from "@/lib/maps/routeStyles";

type MapDrivingRouteGoogleProps = {
  options: RouteOption[];
  selectedIndex: number;
  origin?: LatLng | null;
  destination?: LatLng | null;
};

function dottedLine(path: LatLng[]): google.maps.PolylineOptions {
  return {
    path,
    strokeOpacity: 0,
    zIndex: 3,
    icons: [
      {
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: ROUTE_CONNECTOR_COLOR,
          fillOpacity: 0.95,
          scale: ROUTE_CONNECTOR_DOT_SCALE,
          strokeWeight: 0,
        },
        offset: "0",
        repeat: `${ROUTE_CONNECTOR_DOT_REPEAT_PX}px`,
      },
    ],
  };
}

export function MapDrivingRouteGoogle({
  options,
  selectedIndex,
  origin,
  destination,
}: MapDrivingRouteGoogleProps) {
  const map = useMap();

  const selectedConnectors = useMemo(() => {
    const path = options[selectedIndex]?.path ?? [];
    if (!path.length) {
      return { mainPath: [], originConnector: null, destinationConnector: null };
    }
    return buildRouteWithConnectors(path, origin, destination);
  }, [options, selectedIndex, origin, destination]);

  useEffect(() => {
    if (!map || !options.length) return;

    const lines: google.maps.Polyline[] = [];

    options.forEach((opt, i) => {
      if (!opt.path.length) return;
      const selected = i === selectedIndex;

      const line = new google.maps.Polyline({
        path: opt.path,
        strokeColor: selected ? ROUTE_SELECTED_COLOR : ROUTE_UNSELECTED_COLOR,
        strokeOpacity: selected ? 1 : 0.85,
        strokeWeight: selected ? ROUTE_SELECTED_WEIGHT : ROUTE_UNSELECTED_WEIGHT,
        zIndex: selected ? 2 : 1,
      });
      line.setMap(map);
      lines.push(line);
    });

    const addConnector = (connector: LatLng[] | null) => {
      if (!connector || connector.length < 2) return;
      const line = new google.maps.Polyline(dottedLine(connector));
      line.setMap(map);
      lines.push(line);
    };

    addConnector(selectedConnectors.originConnector);
    addConnector(selectedConnectors.destinationConnector);

    return () => {
      for (const line of lines) line.setMap(null);
    };
  }, [map, options, selectedIndex, selectedConnectors]);

  return null;
}
