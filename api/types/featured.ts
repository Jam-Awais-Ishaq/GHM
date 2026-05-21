export type FeaturedMealRestaurant = {
  id: number;
  name: string;
  suburb: string;
};

export type FeaturedMealRow = {
  id: number;
  dishName: string;
  price: number;
  image: string | null;
  isFeatured: boolean;
  featuredUntil: string | null;
  restaurantId: number;
  restaurant: FeaturedMealRestaurant;
};

export type GetFeaturedListingsResponse = {
  success: boolean;
  count: number;
  data: FeaturedMealRow[];
};

export type ToggleFeaturedResponse = {
  success: boolean;
  message: string;
  data: FeaturedMealRow;
};

export type SearchRestaurantsResponse = {
  success: boolean;
  count: number;
  data: FeaturedMealRow[];
};
