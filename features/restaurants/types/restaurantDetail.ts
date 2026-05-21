import type { ListingHotDeal } from "@/api/types/listings";

export type RestaurantMealDetail = {
  mealId: number;
  dishName: string;
  price: number;
  cuisine: string | null;
  imageUrl: string | null;
  isHotDeal: boolean;
  hotDeals: ListingHotDeal[];
};

export type RestaurantDetailView = {
  restaurantId: number;
  name: string;
  suburb: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  meals: RestaurantMealDetail[];
};
