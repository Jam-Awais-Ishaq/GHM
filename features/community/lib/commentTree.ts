import type { FeedPostComment } from "@/features/community/lib/mapCommunityComment";

export function updateCommentInTree(
  comments: FeedPostComment[],
  commentId: string,
  updater: (comment: FeedPostComment) => FeedPostComment,
): FeedPostComment[] {
  return comments.map((comment) => {
    if (comment.id === commentId) {
      return updater(comment);
    }
    if (comment.replies.length > 0) {
      return {
        ...comment,
        replies: updateCommentInTree(comment.replies, commentId, updater),
      };
    }
    return comment;
  });
}

export function appendReplyToComment(
  comments: FeedPostComment[],
  parentId: string,
  reply: FeedPostComment,
): FeedPostComment[] {
  return comments.map((comment) => {
    if (comment.id === parentId) {
      return { ...comment, replies: [...comment.replies, reply] };
    }
    return comment;
  });
}

export function removeCommentFromTree(
  comments: FeedPostComment[],
  commentId: string,
): FeedPostComment[] {
  return comments
    .filter((comment) => comment.id !== commentId)
    .map((comment) => ({
      ...comment,
      replies: removeCommentFromTree(comment.replies, commentId),
    }));
}

export function appendTopLevelComment(
  comments: FeedPostComment[],
  comment: FeedPostComment,
): FeedPostComment[] {
  return [...comments, comment];
}

export type FlatFeedComment = {
  comment: FeedPostComment;
  isReply: boolean;
};

/** Top-level comments then their replies, for inline feed preview. */
export function flattenFeedComments(comments: FeedPostComment[]): FlatFeedComment[] {
  const out: FlatFeedComment[] = [];
  for (const comment of comments) {
    out.push({ comment, isReply: false });
    for (const reply of comment.replies) {
      out.push({ comment: reply, isReply: true });
    }
  }
  return out;
}
