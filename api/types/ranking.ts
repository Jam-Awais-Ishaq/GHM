export type RankingSortBy = "votes" | "activity" | "engagement" | "popularity";

export type RankedRestaurantVotes = {
  upvotes: number;
  downvotes: number;
  netScore: number;
  displayScore: string;
};

export type RankedRestaurantActivity = {
  windowDays: number;
  recentVotes: number;
  recentComments: number;
  score: number;
};

export type RankedRestaurantEngagement = {
  topLevelComments: number;
  replies: number;
  totalComments: number;
  commentLikes: number;
  score: number;
};

export type RankedRestaurantRow = {
  rank: number;
  restaurantId: number;
  restaurantName: string;
  dishName: string;
  topMealId: number;
  suburb: string;
  /** Full address from DB (same source as listing detail). */
  address: string;
  price: number;
  topMealPrice: number;
  cuisine: string | null;
  image: string | null;
  latitude: number;
  longitude: number;
  distance: string | null;
  distanceMeters: number | null;
  mealCount: number;
  votes: RankedRestaurantVotes;
  activity: RankedRestaurantActivity;
  engagement: RankedRestaurantEngagement;
  popularityScore: number;
};

export type RankingContext = {
  label: string;
  suburb: string | null;
  nearMe: boolean;
  radiusKm: number | null;
};

export type GetRestaurantRankingsResponse = {
  success: boolean;
  sortBy: RankingSortBy;
  limit: number;
  context: RankingContext;
  count: number;
  data: RankedRestaurantRow[];
};

export type RankedSuburbRow = {
  rank: number;
  suburb: string;
  restaurantCount: number;
  mealCount: number;
  votes: {
    upvotes: number;
    downvotes: number;
    netScore: number;
    totalEvents: number;
  };
  activity: {
    windowDays: number;
    recentVotes: number;
    recentComments: number;
    score: number;
  };
  engagement: {
    topLevelComments: number;
    replies: number;
    totalComments: number;
    commentLikes: number;
    score: number;
  };
  popularityScore: number;
};

export type GetSuburbRankingsResponse = {
  success: boolean;
  sortBy: RankingSortBy;
  count: number;
  data: RankedSuburbRow[];
};
