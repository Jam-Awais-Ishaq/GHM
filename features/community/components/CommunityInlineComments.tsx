"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Send } from "lucide-react";
import { useMemo, useRef, useState, type FormEvent } from "react";

import { ApiError } from "@/api/inspector";
import {
  createCommunityPostComment,
  getCommunityPostComments,
} from "@/api/routes/community.api";
import { routes } from "@/config/routes";
import {
  appendTopLevelComment,
  flattenFeedComments,
} from "@/features/community/lib/commentTree";
import {
  mapApiCommunityComment,
  type FeedPostComment,
} from "@/features/community/lib/mapCommunityComment";
import { PUBLIC_PAGE_ACCENT } from "@/components/layout/PublicListPageShell";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils/cn";

const ACCENT = PUBLIC_PAGE_ACCENT;
const INITIAL_VISIBLE = 3;
/** ~3 compact comment rows before scroll. */
const SCROLL_MAX_HEIGHT = "13.5rem";

const SCROLLBAR_HIDDEN =
  "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

type CommunityInlineCommentsProps = {
  postId: string;
  open: boolean;
};

function InlineCommentRow({
  comment,
  isReply,
}: {
  comment: FeedPostComment;
  isReply: boolean;
}) {
  return (
    <li className={cn("flex gap-2.5 py-2", isReply && "ml-8")}>
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
        style={{ backgroundColor: ACCENT }}
        aria-hidden
      >
        {comment.initial}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-neutral-500">
          <span className="font-semibold text-neutral-800">{comment.author}</span>
          <span aria-hidden> · </span>
          {comment.ago}
        </p>
        <p className="mt-0.5 text-sm leading-snug text-neutral-700">{comment.body}</p>
      </div>
    </li>
  );
}

export function CommunityInlineComments({ postId, open }: CommunityInlineCommentsProps) {
  const queryClient = useQueryClient();
  const { isSignedIn, session } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginHref = `${routes.login}?returnTo=${encodeURIComponent(routes.community)}`;
  const commentAsName = session?.nickname?.trim() || "you";

  const { data: comments = [], isLoading, isError } = useQuery({
    queryKey: ["community-post-comments", postId],
    queryFn: async () => {
      const res = await getCommunityPostComments(postId);
      return res.data.comments.map((c) => mapApiCommunityComment(c));
    },
    enabled: open && postId.length > 0,
    staleTime: 15_000,
  });

  const flatComments = useMemo(() => flattenFeedComments(comments), [comments]);
  const needsScroll = flatComments.length > INITIAL_VISIBLE;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !postId) return;

    if (!isSignedIn) {
      setError("Login to comment.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const res = await createCommunityPostComment(postId, text);
      const mapped = mapApiCommunityComment(res.data);
      queryClient.setQueryData<FeedPostComment[]>(
        ["community-post-comments", postId],
        (prev) => appendTopLevelComment(prev ?? [], mapped),
      );
      setDraft("");
      void queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      inputRef.current?.focus();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not post comment. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="mt-3 border-t border-dotted border-neutral-300/50 pt-3 max-sm:hidden">
      {isLoading ? (
        <p className="py-2 text-sm text-neutral-500">Loading comments…</p>
      ) : isError ? (
        <p className="py-2 text-sm text-red-600">Could not load comments.</p>
      ) : flatComments.length === 0 ? (
        <p className="py-2 text-sm text-neutral-500">No comments yet.</p>
      ) : (
        <ul
          className={cn(
            needsScroll && "overflow-y-auto overscroll-contain",
            needsScroll && SCROLLBAR_HIDDEN,
          )}
          style={needsScroll ? { maxHeight: SCROLL_MAX_HEIGHT } : undefined}
        >
          {flatComments.map(({ comment, isReply }) => (
            <InlineCommentRow key={comment.id} comment={comment} isReply={isReply} />
          ))}
        </ul>
      )}

      <div className="mt-3">
        {!isSignedIn ? (
          <p className="text-sm text-neutral-600">
            <Link
              href={loginHref}
              className="font-semibold underline underline-offset-2"
              style={{ color: ACCENT }}
            >
              Sign in
            </Link>{" "}
            to comment
          </p>
        ) : (
          <form onSubmit={onSubmit} className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: ACCENT }}
              aria-hidden
            >
              {commentAsName.slice(0, 1).toUpperCase()}
            </span>
            <div className="relative min-w-0 flex-1">
              <label htmlFor={`inline-comment-${postId}`} className="sr-only">
                Comment as {commentAsName}
              </label>
              <input
                id={`inline-comment-${postId}`}
                ref={inputRef}
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Comment as ${commentAsName}`}
                disabled={submitting}
                className="h-9 w-full rounded-full border-0 bg-neutral-100 py-0 pl-3.5 pr-11 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-500 focus:ring-2 focus:ring-[#FF5722]/25 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!draft.trim() || submitting}
                aria-label="Send comment"
                className="absolute right-0.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ backgroundColor: ACCENT }}
              >
                <Send className="h-3.5 w-3.5" aria-hidden strokeWidth={2.25} />
              </button>
            </div>
          </form>
        )}
        {error ? (
          <p className="mt-2 text-xs font-medium text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
