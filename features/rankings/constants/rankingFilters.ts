import type { RankingSortBy } from "@/api/types/ranking";

export type RankingFilterConfig = {
  id: string;
  label: string;
  nearMe?: boolean;
  suburb?: string;
  sortBy: RankingSortBy;
};

/** Rankings tabs — fixed labels (screenshot); no dynamic suburb/address chips. */
export const RANKING_PAGE_FILTERS: RankingFilterConfig[] = [
  {
    id: "near-me",
    label: "Near me",
    nearMe: true,
    sortBy: "popularity",
  },
  {
    id: "suburb-cbd",
    label: "CBD",
    suburb: "CBD",
    sortBy: "popularity",
  },
  {
    id: "suburb-west-end",
    label: "West End",
    suburb: "West End",
    sortBy: "popularity",
  },
  {
    id: "suburb-fortitude-valley",
    label: "Fortitude Valley",
    suburb: "Fortitude Valley",
    sortBy: "popularity",
  },
  {
    id: "price-checks",
    label: "Price checks",
    sortBy: "activity",
  },
];
