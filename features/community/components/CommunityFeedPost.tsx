"use client";

import Image from "next/image";
import { Ellipsis, MessageCircle, ThumbsUp } from "lucide-react";
import { routes } from "@/config/routes";
import { CommunityInlineComments } from "@/features/community/components/CommunityInlineComments";
import type { FeedPostCard } from "@/features/community/lib/mapCommunityPost";
import { PUBLIC_PAGE_ACCENT } from "@/components/layout/PublicListPageShell";
import { cn } from "@/lib/utils/cn";

type CommunityFeedPostProps = {
  post: FeedPostCard;
  likedByMe: boolean;
  liking: boolean;
  isSignedIn: boolean;
  canEdit?: boolean;
  onLike: () => void;
  onCommentsOpen: () => void;
  commentsExpanded?: boolean;
  onCommentsToggle?: () => void;
  onEditOpen: () => void;
};

export function CommunityFeedPost({
  post,
  likedByMe,
  liking,
  isSignedIn,
  canEdit = false,
  onLike,
  onCommentsOpen,
  commentsExpanded = false,
  onCommentsToggle,
  onEditOpen,
}: CommunityFeedPostProps) {
  const loginHref = `${routes.login}?returnTo=${encodeURIComponent(routes.community)}`;

  const handleLikeClick = () => {
    if (!isSignedIn) {
      window.location.href = loginHref;
      return;
    }
    onLike();
  };

  const handleCommentsClick = () => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 640px)").matches) {
      onCommentsToggle?.();
      return;
    }
    onCommentsOpen();
  };

  return (
    <article className="py-4 sm:py-[1.125rem]">
      <div className="flex gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: PUBLIC_PAGE_ACCENT }}
          aria-hidden
        >
          {post.initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-neutral-500">
            <span className="font-semibold text-neutral-800">{post.author}</span>
            {post.isAdminAuthor ? (
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-600">
                Admin
              </span>
            ) : null}
            <span aria-hidden>·</span>
            <span>{post.ago}</span>
          </p>
          <div className="mt-1.5 flex items-start justify-between gap-2">
            <h3 className="min-w-0 flex-1 text-[15px] font-bold leading-snug text-neutral-900 sm:text-base">
              {post.title}
            </h3>
            {canEdit ? (
              <button
                type="button"
                onClick={onEditOpen}
                className="mt-[-2px] inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700"
                aria-label={`Edit · ${post.title}`}
                title="Edit"
              >
                <Ellipsis className="h-5 w-5" aria-hidden />
              </button>
            ) : null}
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">{post.body}</p>

          {post.imageUrl ? (
            <div className="relative mt-3 aspect-[16/10] w-full overflow-hidden rounded-2xl bg-neutral-100">
              <Image
                src={post.imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 560px"
              />
            </div>
          ) : null}

          <div className="mt-3 flex items-center gap-4 text-neutral-500">
            <button
              type="button"
              onClick={handleLikeClick}
              disabled={liking}
              aria-pressed={likedByMe}
              className={cn(
                "inline-flex items-center gap-1.5 text-xs font-medium transition hover:text-neutral-700 disabled:opacity-50",
                likedByMe && "text-[#FF5722]",
              )}
              aria-label={likedByMe ? `Unlike · ${post.likes}` : `Like · ${post.likes}`}
            >
              <ThumbsUp
                className={cn("h-4 w-4", likedByMe && "fill-current")}
                aria-hidden
              />
              {post.likes}
            </button>
            <button
              type="button"
              onClick={handleCommentsClick}
              aria-expanded={commentsExpanded}
              className={cn(
                "inline-flex items-center gap-1.5 text-xs font-medium transition hover:text-neutral-700",
                commentsExpanded && "text-[#FF5722]",
              )}
              aria-label={`Comments · ${post.comments}`}
            >
              <MessageCircle className="h-4 w-4" strokeWidth={2} aria-hidden />
              {post.comments}
            </button>
          </div>

          <CommunityInlineComments postId={post.id} open={commentsExpanded} />
        </div>
      </div>
    </article>
  );
}
