export type PendingSubmission = {
  id: string;
  restaurant: string;
  price: number;
  dish: string;
  suburb: string;
  imageUrl?: string | null;
};

export type ReportedListing = {
  id: string;
  mealId: number;
  restaurantId: number;
  restaurant: string;
  dish: string;
  price: number;
  suburb: string;
  imageUrl?: string | null;
  flagCount: number;
  isHidden: boolean;
  latestReason: string;
  reasons: string[];
};

/** @deprecated Use API-backed reported listings on submissions queue. */
export type FlaggedListing = Pick<
  ReportedListing,
  "id" | "restaurant" | "flagCount"
> & { reason: string };

export const PENDING_SUBMISSIONS: PendingSubmission[] = [
  {
    id: "sub-1",
    restaurant: "Momo House",
    price: 10,
    dish: "8pc steamed momos",
    suburb: "South Bank",
  },
  {
    id: "sub-2",
    restaurant: "Sushi d'Lite",
    price: 11,
    dish: "10pc salmon nigiri box",
    suburb: "South Bank",
  },
];

export const FLAGGED_LISTINGS: FlaggedListing[] = [];
