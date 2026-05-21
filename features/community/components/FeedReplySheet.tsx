"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { X } from "lucide-react";
import { useEffect, useId, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";

import { ApiError } from "@/api/inspector";
import {
  createCommunityPostComment,
  getCommunityPostComments,
} from "@/api/routes/community.api";
import { PUBLIC_PAGE_ACCENT } from "@/components/layout/PublicListPageShell";
import { routes } from "@/config/routes";
import {
  mapApiCommunityComment,
  type FeedPostComment,
} from "@/features/community/lib/mapCommunityComment";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils/cn";

export type FeedReplySheetPost = {
  id: string;
  author: string;
  ago: string;
  title: string;
  body: string;
};

export type FeedReplySheetProps = {
  open: boolean;
  onClose: () => void;
  post: FeedReplySheetPost | null;
  onCommentPosted?: () => void;
};

export function FeedReplySheet({ open, onClose, post, onCommentPosted }: FeedReplySheetProps) {
  const titleId = useId();
  const queryClient = useQueryClient();
  const { isSignedIn, session } = useAuth();
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const postId = post?.id ?? "";
  const loginHref = `${routes.login}?returnTo=${encodeURIComponent(routes.community)}`;

  const {
    data: comments = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["community-post-comments", postId],
    queryFn: async () => {
      const res = await getCommunityPostComments(postId);
      return res.data.comments.map((c) => mapApiCommunityComment(c));
    },
    enabled: open && postId.length > 0,
    staleTime: 15_000,
  });

  useEffect(() => {
    if (open) {
      setDraft("");
      setError(null);
    }
  }, [open, postId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, submitting]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !postId) return;

    if (!isSignedIn) {
      setError("Login to post a comment.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const res = await createCommunityPostComment(postId, text);
      const mapped = mapApiCommunityComment(res.data, session?.nickname);
      queryClient.setQueryData<FeedPostComment[]>(
        ["community-post-comments", postId],
        (prev) => [...(prev ?? []), mapped],
      );
      setDraft("");
      onCommentPosted?.();
      void queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not post comment. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !post) return null;

  const commentsScrollable = comments.length > 1;
  const countLabel =
    comments.length === 1 ? "1 comment" : `${comments.length} comments`;

  const ui = (
    <>
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        className="fixed inset-0 z-[9998] bg-neutral-950/40"
        onClick={submitting ? undefined : onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "fixed inset-x-0 bottom-0 z-[9999] flex max-h-[min(88dvh,40rem)] w-full flex-col bg-white",
          "rounded-t-3xl border-t border-neutral-200/80 shadow-[0_-10px_44px_rgba(0,0,0,0.14)]",
          "pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2",
        )}
      >
        <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-neutral-200" aria-hidden />

        <div className="flex items-start justify-end px-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4">
          <span id={titleId} className="sr-only">
            Comments on {post.title}
          </span>

          <div className="shrink-0 rounded-2xl bg-orange-50/60 px-3.5 py-3">
            <p className="text-sm text-neutral-500">
              <span className="font-semibold text-neutral-800">{post.author}</span>
              <span aria-hidden> · </span>
              <span>{post.ago}</span>
            </p>
            <p className="mt-1.5 text-[15px] font-bold leading-snug text-neutral-900">{post.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-700">{post.body}</p>
          </div>

          <p className="mt-4 shrink-0 text-sm font-bold text-neutral-900">
            {isLoading ? "Loading comments…" : countLabel}
          </p>

          {isError ? (
            <p className="mt-2 shrink-0 text-sm text-red-600">Could not load comments.</p>
          ) : null}

          {!isLoading && comments.length > 0 ? (
            <ul
              className={cn(
                "mt-2 min-h-0 divide-y divide-dotted divide-neutral-300/55",
                commentsScrollable &&
                  "ghm-scrollbar-hidden max-h-[5.75rem] overflow-y-auto overscroll-contain",
              )}
            >
              {comments.map((comment) => (
                <li key={comment.id} className="flex gap-2.5 py-3 first:pt-1">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: PUBLIC_PAGE_ACCENT }}
                    aria-hidden
                  >
                    {comment.initial}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-neutral-900">
                      {comment.author}
                      <span className="font-normal text-neutral-500"> · {comment.ago}</span>
                    </p>
                    <p className="mt-0.5 text-sm leading-relaxed text-neutral-700">{comment.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : !isLoading && !isError ? (
            <p className="mt-2 text-sm text-neutral-500">No comments yet. Start the thread.</p>
          ) : null}

          <form onSubmit={onSubmit} className="mt-auto flex shrink-0 flex-col gap-3 border-t border-neutral-200/80 py-3">
            {!isSignedIn ? (
              <p className="text-sm text-neutral-700">
                <Link href={loginHref} className="font-semibold text-[#2563a8] underline">
                  Login
                </Link>{" "}
                to comment.
              </p>
            ) : (
              <>
                <label htmlFor="feed-reply-input" className="sr-only">
                  Your comment
                </label>
                <textarea
                  id="feed-reply-input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write a comment…"
                  rows={3}
                  disabled={submitting}
                  className="w-full resize-none rounded-2xl border-0 bg-orange-50/70 px-4 py-3 text-sm text-neutral-900 outline-none ring-0 transition placeholder:text-neutral-400 focus:bg-orange-50 focus:ring-2 focus:ring-[#FF5722]/25 disabled:opacity-60"
                />
                {error ? (
                  <p className="text-sm text-red-600" role="alert">
                    {error}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={!draft.trim() || submitting}
                  className="flex h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold text-white shadow-[0_4px_14px_rgba(255,87,34,0.35)] transition hover:brightness-105 disabled:opacity-50"
                  style={{ backgroundColor: PUBLIC_PAGE_ACCENT }}
                >
                  {submitting ? "Posting…" : "Post comment"}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </>
  );

  if (typeof document === "undefined") return null;
  return createPortal(ui, document.body);
}
