export type NearbyListingDto = {
  id: number;
  restaurantName: string;
  dishName: string;
  /** Display suburb label from server. */
  suburb: string;
  /** Full address stored in DB. */
  address: string;
  latitude: number;
  longitude: number;
  price: number;
  image: string | null;
  isFeatured?: boolean;
};

export type NearbyListingsResponse = {
  success: boolean;
  data: NearbyListingDto[];
};
