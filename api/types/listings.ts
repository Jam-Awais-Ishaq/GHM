export type FilterListingMeal = {
  id: number;
  dishName: string;
  cuisine: string | null;
  price: number;
  status: string;
};

export type FilterListingRestaurant = {
  id: number;
  name: string;
  suburb: string;
  latitude: number | null;
  longitude: number | null;
  image: string | null;
  meals: FilterListingMeal[];
};

export type FilterListingsResponse = {
  success: boolean;
  count?: number;
  data: FilterListingRestaurant[];
};
