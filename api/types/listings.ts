export type ListingHotDeal = {
  id: number;
  startDateTime: string;
  endDateTime: string;
  isActive: boolean;
  description?: string | null;
  countdown?: string;
  remainingMs?: number;
};

export type ListingMeal = {
  id: number;
  dishName: string;
  cuisine: string | null;
  price: number;
  image: string | null;
  status: string;
  createdAt?: string;
  isFeatured?: boolean;
  featuredUntil?: string | null;
  hotDeals?: ListingHotDeal[];
};

export type FilterListingMeal = ListingMeal;

export type FilterListingRestaurant = {
  id: number;
  name: string;
  /** Display suburb label from server. */
  suburb: string;
  /** Full address stored in DB. */
  address?: string;
  latitude: number | null;
  longitude: number | null;
  /** Vote net score from ranking (Top Rated filter). */
  netScore?: number;
  /** Restaurant popularity score from ranking (Top Rated filter). */
  popularityScore?: number;
  /** Total votes (up + down) from ranking. */
  voteCount?: number;
  meals: FilterListingMeal[];
};

export type FilterListingsResponse = {
  success: boolean;
  count?: number;
  data: FilterListingRestaurant[];
};

export type ListingsResponse = {
  success: boolean;
  data: FilterListingRestaurant[];
};

export type SingleListingResponse = {
  success: boolean;
  data: FilterListingRestaurant;
};

export type HotDealListing = {
  id: number;
  mealId: number;
  description: string | null;
  countdown: string;
  remainingMs: number;
  meal: {
    id: number;
    dishName: string;
    price: number;
    restaurant: {
      id: number;
      name: string;
      suburb: string;
    };
  };
};

export type HotDealsResponse = {
  success: boolean;
  count?: number;
  data: HotDealListing[];
};

export type CreateListingResponse = {
  success: boolean;
  message: string;
};
