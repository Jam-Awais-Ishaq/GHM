"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowDownUp, Send, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
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
import type { FeedPostCard } from "@/features/community/lib/mapCommunityPost";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils/cn";

type CommunityCommentsPanelProps = {
  open: boolean;
  post: FeedPostCard | null;
  onClose: () => void;
};

type CommentSort = "top" | "newest";

function UserAvatar({
  initial,
  className,
}: {
  initial: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-neutral-600 text-sm font-bold text-white",
        className,
      )}
      aria-hidden
    >
      {initial.slice(0, 1).toUpperCase()}
    </span>
  );
}

function CommentRow({ comment }: { comment: FeedPostComment }) {
  return (
    <li className="flex gap-3 py-3">
      <UserAvatar initial={comment.initial} className="h-9 w-9" />
      <div className="min-w-0 flex-1">
        <p className="text-[13px]">
          <span className="font-medium text-white/95">{comment.author}</span>
          <span className="ml-2 text-white/45">{comment.ago}</span>
        </p>
        <p className="mt-1 text-sm leading-snug text-white/85">{comment.body}</p>
      </div>
    </li>
  );
}

export function CommunityCommentsPanel({ open, post, onClose }: CommunityCommentsPanelProps) {
  const titleId = useId();
  const queryClient = useQueryClient();
  const { isSignedIn, session } = useAuth();
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<CommentSort>("top");
  const inputRef = useRef<HTMLInputElement>(null);

  const postId = post?.id ?? "";
  const loginHref = `${routes.login}?returnTo=${encodeURIComponent(routes.community)}`;
  const userInitial = session?.nickname?.trim().slice(0, 1) || "Y";

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

  const sortedComments = useMemo(() => {
    if (sort === "top") return comments;
    return [...comments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [comments, sort]);

  useEffect(() => {
    if (!open) {
      setDraft("");
      setError(null);
      setSort("top");
      return;
    }
    const t = window.setTimeout(() => inputRef.current?.focus(), 280);
    return () => window.clearTimeout(t);
  }, [open, postId]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, submitting]);

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
      const mapped = mapApiCommunityComment(res.data, session?.nickname);
      queryClient.setQueryData<FeedPostComment[]>(
        ["community-post-comments", postId],
        (prev) => [...(prev ?? []), mapped],
      );
      setDraft("");
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

  const ui = (
    <>
      <button
        type="button"
        aria-label="Close comments"
        className="fixed inset-0 z-[998] bg-black/40 animate-[ghm-backdrop-in_0.2s_ease-out] motion-reduce:animate-none sm:bg-black/25"
        onClick={submitting ? undefined : onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "fixed z-[999] flex min-h-0 flex-col overflow-hidden rounded-2xl bg-[#212121] text-white",
          "shadow-[0_8px_40px_rgba(0,0,0,0.45)]",
          "motion-safe:animate-[ghm-slide-in-right_0.28s_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none",
          "max-sm:right-2 max-sm:left-2 max-sm:top-[max(4.5rem,calc(env(safe-area-inset-top)+3.5rem))]",
          "max-sm:bottom-[max(5.75rem,calc(env(safe-area-inset-bottom)+4.75rem))]",
          "sm:right-4 sm:left-auto sm:top-[max(5rem,calc(env(safe-area-inset-top)+4.5rem))]",
          "sm:h-[min(78dvh,640px)] sm:w-[min(100%,24rem)] sm:max-w-[402px]",
        )}
      >
        <header className="flex shrink-0 items-center justify-between gap-2 px-4 py-3.5">
          <h2 id={titleId} className="text-lg font-medium tracking-tight text-white">
            Comments
          </h2>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setSort((s) => (s === "top" ? "newest" : "top"))}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10"
              aria-label={sort === "top" ? "Sort by newest" : "Sort by top"}
              title={sort === "top" ? "Newest first" : "Oldest first"}
            >
              <ArrowDownUp className="h-5 w-5" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 disabled:opacity-50"
              aria-label="Close"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 [scrollbar-color:rgba(255,255,255,0.2)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20">
          {isLoading ? (
            <p className="py-12 text-center text-sm text-white/50">Loading comments…</p>
          ) : isError ? (
            <p className="py-12 text-center text-sm text-red-400">Could not load comments.</p>
          ) : sortedComments.length === 0 ? (
            <p className="py-12 text-center text-sm text-white/45">
              No comments yet.
            </p>
          ) : (
            <ul>
              {sortedComments.map((comment) => (
                <CommentRow key={comment.id} comment={comment} />
              ))}
            </ul>
          )}
        </div>

        <footer className="shrink-0 border-t border-white/10 px-4 py-3">
          {!isSignedIn ? (
            <p className="text-sm text-white/70">
              <Link href={loginHref} className="font-medium text-white underline underline-offset-2">
                Sign in
              </Link>{" "}
              to comment
            </p>
          ) : (
            <form onSubmit={onSubmit} className="flex items-center gap-2.5">
              <UserAvatar
                initial={userInitial}
                className="h-9 w-9 ring-1 ring-white/10"
              />
              <label htmlFor="community-comments-input" className="sr-only">
                Add a comment
              </label>
              <input
                id="community-comments-input"
                ref={inputRef}
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add a comment..."
                disabled={submitting}
                className="h-10 min-w-0 flex-1 rounded-full bg-[#3f3f3f] px-4 text-sm text-white outline-none transition placeholder:text-white/40 focus:ring-2 focus:ring-white/20 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!draft.trim() || submitting}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ backgroundColor: PUBLIC_PAGE_ACCENT }}
                aria-label={submitting ? "Sending" : "Send comment"}
              >
                <Send className="h-[18px] w-[18px]" aria-hidden />
              </button>
            </form>
          )}
          {error ? (
            <p className="mt-2 pl-[3.25rem] text-xs font-medium text-red-400" role="alert">
              {error}
            </p>
          ) : null}
        </footer>
      </aside>
    </>
  );

  if (typeof document === "undefined") return null;
  return createPortal(ui, document.body);
}
