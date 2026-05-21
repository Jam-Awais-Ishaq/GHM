import type { RankedRestaurantRow, RankingSortBy } from "@/api/types/ranking";

export const RANKING_SORT_LABELS: Record<RankingSortBy, string> = {
  votes: "Community votes",
  activity: "Recent activity",
  engagement: "Engagement",
  popularity: "Popularity score",
};

export function getRankingBannerSubtitle(
  sortBy: RankingSortBy,
  context: { nearMe: boolean; radiusKm: number | null },
): string {
  const sortLabel = RANKING_SORT_LABELS[sortBy];
  if (context.nearMe && context.radiusKm != null) {
    return `Within ${context.radiusKm}km · ${sortLabel}`;
  }
  return `Highest ${sortLabel.toLowerCase()} first`;
}

/** Primary badge for the active API sortBy (no frontend re-sort). */
export function getPrimaryRankingScore(row: RankedRestaurantRow, sortBy: RankingSortBy) {
  switch (sortBy) {
    case "activity":
      return {
        value: String(row.activity.score),
        title: `${row.activity.recentVotes} votes + ${row.activity.recentComments} comments (${row.activity.windowDays}d)`,
      };
    case "engagement":
      return {
        value: String(row.engagement.score),
        title: `${row.engagement.totalComments} comments · ${row.engagement.commentLikes} likes`,
      };
    case "popularity":
      return {
        value: String(row.popularityScore),
        title: "Weighted votes, activity & engagement",
      };
    case "votes":
    default:
      return {
        value: row.votes.displayScore,
        title: `${row.votes.upvotes} up · ${row.votes.downvotes} down`,
      };
  }
}

/** All backend scores for transparency under each row. */
export function formatRankingScoreBreakdown(row: RankedRestaurantRow): string {
  return [
    `Votes ${row.votes.displayScore}`,
    `Activity ${row.activity.score}`,
    `Engagement ${row.engagement.score}`,
    `Popularity ${row.popularityScore}`,
  ].join(" · ");
}
