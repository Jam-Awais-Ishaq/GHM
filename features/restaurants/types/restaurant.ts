export type PriceFilterId = "u15" | "u12" | "u8" | "u5" | "top";

export type CuisineFilterId =
  | "all"
  | "vietnamese"
  | "thai"
  | "korean"
  | "indian"
  | "bakery"
  | "burgers";

export type ShowOnlyFeedsId = "all" | "hotDeals" | "verified" | "top50";

export type LatLng = { lat: number; lng: number };

export type RestaurantCommunityNoteReply = {
  id?: number;
  author: string;
  ago: string;
  body: string;
  likes: number;
};

export type RestaurantCommunityNote = {
  id?: number;
  author: string;
  ago: string;
  body: string;
  likes: number;
  replies?: RestaurantCommunityNoteReply[];
};

export type Restaurant = {
  id: string;
  /** Set when `id` is a meal id; use for `/restaurant/[id]` links. */
  restaurantId?: string;
  name: string;
  dish: string;
  price: number;
  suburb: string;
  address: string;
  /** Restaurant photo URL (e.g. Cloudinary). */
  imageUrl?: string | null;
  position: LatLng;
  netScore: number;
  worthIt: number;
  overrated: number;
  isHotDeal?: boolean;
  /** Admin-featured — crown + black pin on map. */
  isFeatured?: boolean;
  isTopRated?: boolean;
  priceVerifiedAt?: string;
  communityNotes?: RestaurantCommunityNote[];
};

export type RestaurantWithDistance = Restaurant & {
  distanceKm: number | null;
  /** Road distance from routing API; otherwise straight-line fallback. */
  distanceIsDriving?: boolean;
};
