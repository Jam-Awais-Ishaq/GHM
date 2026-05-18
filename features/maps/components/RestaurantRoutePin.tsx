"use client";

import {
  MapRouteDotGoogle,
  MapRouteDotLeaflet,
} from "@/features/maps/components/MapRouteDot";
import type { LatLng } from "@/features/restaurants/types/restaurant";

type Props = {
  position: LatLng;
  priceLabel?: string;
  onClick?: () => void;
};

export function RestaurantRoutePinGoogle({ position, onClick }: Props) {
  return (
    <MapRouteDotGoogle coords={position} variant="restaurant" onClick={onClick} />
  );
}

export function RestaurantRoutePinLeaflet({ position, onClick }: Props) {
  return <MapRouteDotLeaflet coords={position} variant="restaurant" onClick={onClick} />;
}
