import type { ApiComment } from "@/api/types/comments";
import type {
  RestaurantCommunityNote,
  RestaurantCommunityNoteReply,
} from "@/features/restaurants/types/restaurant";

function formatCommentAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  if (diffMs < 60_000) return "now";
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Intl.DateTimeFormat("en-AU", { dateStyle: "medium" }).format(new Date(iso));
}

function authorLabel(user: ApiComment["user"]): string {
  const name = user.name?.trim();
  return name && name.length > 0 ? name : "Member";
}

function mapReply(comment: ApiComment): RestaurantCommunityNoteReply {
  return {
    id: comment.id,
    author: authorLabel(comment.user),
    ago: formatCommentAgo(comment.createdAt),
    body: comment.content,
    likes: comment._count.likes,
  };
}

export function mapMealCommentsToNotes(comments: ApiComment[]): RestaurantCommunityNote[] {
  return comments.map((comment) => ({
    id: comment.id,
    author: authorLabel(comment.user),
    ago: formatCommentAgo(comment.createdAt),
    body: comment.content,
    likes: comment._count.likes,
    replies: (comment.replies ?? []).map(mapReply),
  }));
}
