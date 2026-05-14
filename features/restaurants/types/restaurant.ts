export type PriceFilterId = "u15" | "u12" | "u8" | "u5" | "top";

export type CuisineFilterId =
  | "all"
  | "vietnamese"
  | "thai"
  | "korean"
  | "indian"
  | "bakery"
  | "burgers";

export type ShowOnlyFeedsId = "all" | "hot" | "verified" | "top50";

export type LatLng = { lat: number; lng: number };

export type RestaurantCommunityNote = {
  author: string;
  ago: string;
  body: string;
  likes: number;
};

export type Restaurant = {
  id: string;
  name: string;
  dish: string;
  price: number;
  suburb: string;
  address: string;
  position: LatLng;
  netScore: number;
  worthIt: number;
  overrated: number;
  isHotDeal?: boolean;
  isTopRated?: boolean;
  priceVerifiedAt?: string;
  communityNotes?: RestaurantCommunityNote[];
};

export type RestaurantWithDistance = Restaurant & {
  distanceKm: number | null;
};
