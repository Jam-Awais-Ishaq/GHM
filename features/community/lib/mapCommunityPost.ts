import type { ApiCommunityPost } from "@/api/types/community";
import type { FeedCategoryId } from "@/features/community/constants/feedCategories";

export type FeedPostCard = {
  id: string;
  author: string;
  initial: string;
  ago: string;
  title: string;
  body: string;
  imageUrl: string | null;
  likes: number;
  comments: number;
  category: FeedCategoryId;
};

const CATEGORY_FROM_API: Record<string, FeedCategoryId> = {
  FINDS: "finds",
  TIPS: "tips",
  PRICE_CHECKS: "price-checks",
};

export function formatFeedAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  if (diffMs < 60_000) return "now";
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Intl.DateTimeFormat("en-AU", { dateStyle: "medium" }).format(new Date(iso));
}

export function mapApiCommunityPostToFeedCard(
  post: ApiCommunityPost,
  authorName?: string,
): FeedPostCard {
  const author = authorName?.trim() || post.user?.name?.trim() || "Member";
  return {
    id: post.id,
    author,
    initial: author.slice(0, 1).toUpperCase(),
    ago: formatFeedAgo(post.createdAt),
    title: post.title,
    body: post.body,
    imageUrl: post.imageUrl ?? null,
    likes: post.likesCount,
    comments: post.commentsCount,
    category: CATEGORY_FROM_API[post.category] ?? "finds",
  };
}
