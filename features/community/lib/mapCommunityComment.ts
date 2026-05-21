import type { ApiCommunityPostComment } from "@/api/types/community";
import { formatFeedAgo } from "@/features/community/lib/mapCommunityPost";

export type FeedPostComment = {
  id: string;
  author: string;
  initial: string;
  ago: string;
  body: string;
  createdAt: string;
};

export function mapApiCommunityComment(
  comment: ApiCommunityPostComment,
  authorName?: string,
): FeedPostComment {
  const author = authorName?.trim() || comment.user.name?.trim() || "Member";
  return {
    id: comment.id,
    author,
    initial: author.slice(0, 1).toUpperCase(),
    ago: formatFeedAgo(comment.createdAt),
    body: comment.body,
    createdAt: comment.createdAt,
  };
}
