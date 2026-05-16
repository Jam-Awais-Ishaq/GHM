export type NearbyListingDto = {
  id: number;
  restaurantName: string;
  dishName: string;
  address: string;
  latitude: number;
  longitude: number;
  price: number;
  image: string | null;
};

export type NearbyListingsResponse = {
  success: boolean;
  data: NearbyListingDto[];
};
