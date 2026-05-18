"use client";

import { useMap as useGoogleMap } from "@vis.gl/react-google-maps";
import { useEffect } from "react";
import { useMap as useLeafletMap } from "react-leaflet";

import type { RouteOption } from "@/features/maps/types/drivingRoute";
import type { LatLng } from "@/features/restaurants/types/restaurant";

const FIT_PADDING = { top: 100, right: 48, bottom: 140, left: 48 };

type MapFitRouteBoundsProps = {
  origin: LatLng | null | undefined;
  destination: LatLng | null | undefined;
  options: RouteOption[];
  selectedIndex: number;
};

export function MapFitRouteBoundsGoogle({
  origin,
  destination,
  options,
  selectedIndex,
}: MapFitRouteBoundsProps) {
  const map = useGoogleMap();

  useEffect(() => {
    if (!map || !origin || !destination) return;

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(origin);
    bounds.extend(destination);

    const path = options[selectedIndex]?.path ?? options[0]?.path;
    for (const p of path ?? []) {
      bounds.extend(p);
    }

    map.fitBounds(bounds, FIT_PADDING);
  }, [map, origin, destination, options, selectedIndex]);

  return null;
}

export function MapFitRouteBoundsLeaflet({
  origin,
  destination,
  options,
  selectedIndex,
}: MapFitRouteBoundsProps) {
  const map = useLeafletMap();

  useEffect(() => {
    if (!map || !origin || !destination) return;

    const points: [number, number][] = [
      [origin.lat, origin.lng],
      [destination.lat, destination.lng],
    ];

    const path = options[selectedIndex]?.path ?? options[0]?.path;
    for (const p of path ?? []) {
      points.push([p.lat, p.lng]);
    }

    map.fitBounds(points, { padding: [100, 48] });
  }, [map, origin, destination, options, selectedIndex]);

  return null;
}
