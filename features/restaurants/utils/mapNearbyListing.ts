import type { NearbyListingDto } from "@/api/types/nearby";
import type { Restaurant } from "@/features/restaurants/types/restaurant";

export function mapNearbyListingToRestaurant(row: NearbyListingDto): Restaurant {
  return {
    id: String(row.id),
    name: row.restaurantName,
    dish: row.dishName,
    price: row.price,
    suburb: row.suburb ?? row.address,
    address: row.address,
    imageUrl: row.image,
    position: { lat: row.latitude, lng: row.longitude },
    netScore: 0,
    worthIt: 0,
    overrated: 0,
    isHotDeal: false,
    isFeatured: Boolean(row.isFeatured),
  };
}

export function mapNearbyListingsToRestaurants(rows: NearbyListingDto[]): Restaurant[] {
  return rows.map(mapNearbyListingToRestaurant);
}
