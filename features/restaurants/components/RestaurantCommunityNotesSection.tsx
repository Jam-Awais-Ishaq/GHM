"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { MessageCircle, ThumbsUp } from "lucide-react";
import { useMemo, useState } from "react";

import { ApiError } from "@/api/inspector";
import { createComment, getMealComments, toggleCommentLike } from "@/api/routes/comments.api";
import { routes } from "@/config/routes";
import { mapMealCommentsToNotes } from "@/features/restaurants/lib/mapMealComments";
import type { RestaurantCommunityNote } from "@/features/restaurants/types/restaurant";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils/cn";

const ACCENT = "#FF5722";

type RestaurantCommunityNotesSectionProps = {
  mealId: number;
  className?: string;
};

function countComments(notes: RestaurantCommunityNote[]) {
  return notes.reduce((sum, note) => sum + 1 + (note.replies?.length ?? 0), 0);
}

function NoteAvatar({ name }: { name: string }) {
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
      style={{ backgroundColor: ACCENT }}
      aria-hidden
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

function NoteActions({
  likes,
  replyCount,
  onReply,
  onLike,
  likeDisabled,
}: {
  likes: number;
  replyCount: number;
  onReply: () => void;
  onLike?: () => void;
  likeDisabled?: boolean;
}) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-neutral-500">
      {onLike ? (
        <button
          type="button"
          onClick={onLike}
          disabled={likeDisabled}
          className="inline-flex items-center gap-1.5 transition hover:text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`Like · ${likes}`}
        >
          <ThumbsUp className="h-4 w-4" aria-hidden />
          {likes}
        </button>
      ) : (
        <span className="inline-flex items-center gap-1.5">
          <ThumbsUp className="h-4 w-4" aria-hidden />
          {likes}
        </span>
      )}
      <button
        type="button"
        onClick={onReply}
        className="inline-flex items-center gap-1.5 transition hover:text-neutral-700"
        aria-label={replyCount > 0 ? `Reply · ${replyCount} replies` : "Reply"}
      >
        <MessageCircle className="h-4 w-4" strokeWidth={2} aria-hidden />
        {replyCount > 0 ? replyCount : null}
      </button>
    </div>
  );
}

export function RestaurantCommunityNotesSection({
  mealId,
  className,
}: RestaurantCommunityNotesSectionProps) {
  const queryClient = useQueryClient();
  const { isSignedIn } = useAuth();
  const [draft, setDraft] = useState("");
  const [replyingToIndex, setReplyingToIndex] = useState<number | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [likingId, setLikingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loginHref = `${routes.login}?returnTo=${encodeURIComponent(routes.map)}`;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["meal-comments", mealId],
    queryFn: () => getMealComments(mealId),
    enabled: mealId > 0,
    staleTime: 30_000,
  });

  const notes = useMemo(
    () => (data?.data ? mapMealCommentsToNotes(data.data) : []),
    [data?.data],
  );
  const totalCount = useMemo(() => countComments(notes), [notes]);
  const countLabel = totalCount === 1 ? "1 comment" : `${totalCount} comments`;
  const commentsScrollable = totalCount >= 2;

  const refreshComments = () =>
    queryClient.invalidateQueries({ queryKey: ["meal-comments", mealId] });

  const handleApiError = (err: unknown) => {
    if (err instanceof ApiError) {
      if (err.status === 401) {
        setError("Please sign in again to comment.");
        return;
      }
      setError(err.message);
      return;
    }
    setError("Something went wrong. Please try again.");
  };

  const handleSubmit = async () => {
    const body = draft.trim();
    if (!body || !isSignedIn || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await createComment({ mealId, content: body });
      setDraft("");
      await refreshComments();
    } catch (err) {
      handleApiError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (noteIndex: number) => {
    const body = replyDraft.trim();
    const parentId = notes[noteIndex]?.id;
    if (!body || !isSignedIn || submitting || parentId == null) return;
    setError(null);
    setSubmitting(true);
    try {
      await createComment({ mealId, content: body, parentCommentId: parentId });
      setReplyDraft("");
      setReplyingToIndex(null);
      await refreshComments();
    } catch (err) {
      handleApiError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId: number) => {
    if (!isSignedIn || likingId != null) return;
    setError(null);
    setLikingId(commentId);
    try {
      await toggleCommentLike(commentId);
      await refreshComments();
    } catch (err) {
      handleApiError(err);
    } finally {
      setLikingId(null);
    }
  };

  const startReply = (index: number) => {
    if (!isSignedIn) {
      window.location.href = loginHref;
      return;
    }
    setReplyingToIndex(index);
    setReplyDraft("");
  };

  const cancelReply = () => {
    setReplyingToIndex(null);
    setReplyDraft("");
  };

  const isReplying = replyingToIndex !== null;

  return (
    <section className={cn("mt-6", className)} aria-labelledby={`community-notes-${mealId}`}>
      <p
        id={`community-notes-${mealId}`}
        className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500"
      >
        Community notes
      </p>

      <p className="mt-3 text-sm font-bold text-neutral-900">
        {isLoading ? "Loading comments…" : countLabel}
      </p>

      {isError ? (
        <p className="mt-2 text-sm text-red-600">Could not load comments.</p>
      ) : null}

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      {!isLoading && notes.length > 0 ? (
        <div
          className={cn(
            "mt-3",
            commentsScrollable &&
              "ghm-scrollbar-hidden max-h-[min(38vh,280px)] overflow-y-auto overscroll-contain",
          )}
        >
          <ul className="divide-y divide-dotted divide-neutral-300/55">
          {notes.map((note, index) => (
            <li key={note.id ?? index} className="py-4 first:pt-0">
              <div className="flex gap-3">
                <NoteAvatar name={note.author} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-neutral-900">
                    {note.author}
                    <span className="font-normal text-neutral-500"> · {note.ago}</span>
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-700">{note.body}</p>
                  <NoteActions
                    likes={note.likes}
                    replyCount={note.replies?.length ?? 0}
                    onReply={() => startReply(index)}
                    onLike={
                      isSignedIn && note.id != null
                        ? () => handleLike(note.id!)
                        : undefined
                    }
                    likeDisabled={likingId === note.id}
                  />
                </div>
              </div>

              {note.replies && note.replies.length > 0 ? (
                <ul className="mt-3 space-y-3 border-l border-dotted border-neutral-300/55 pl-3 sm:ml-12">
                  {note.replies.map((reply) => (
                    <li key={reply.id ?? `${reply.author}-${reply.ago}`} className="flex gap-2.5">
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: ACCENT }}
                        aria-hidden
                      >
                        {reply.author.slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-neutral-900">
                          {reply.author}
                          <span className="font-normal text-neutral-500"> · {reply.ago}</span>
                        </p>
                        <p className="mt-0.5 text-[13px] leading-relaxed text-neutral-700">
                          {reply.body}
                        </p>
                        {isSignedIn && reply.id != null ? (
                          <button
                            type="button"
                            onClick={() => handleLike(reply.id!)}
                            disabled={likingId === reply.id}
                            className="mt-1.5 flex items-center gap-1 text-xs text-neutral-500 transition hover:text-neutral-700 disabled:opacity-50"
                            aria-label={`Like · ${reply.likes}`}
                          >
                            <ThumbsUp className="h-3 w-3 text-neutral-400" aria-hidden />
                            {reply.likes}
                          </button>
                        ) : (
                          <p className="mt-1.5 flex items-center gap-1 text-xs text-neutral-500">
                            <ThumbsUp className="h-3 w-3 text-neutral-400" aria-hidden />
                            {reply.likes}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}

              {replyingToIndex === index && isSignedIn ? (
                <div className="mt-3 space-y-2 sm:ml-12">
                  <label htmlFor={`community-reply-${mealId}-${index}`} className="sr-only">
                    Reply to {note.author}
                  </label>
                  <textarea
                    id={`community-reply-${mealId}-${index}`}
                    rows={1}
                    value={replyDraft}
                    onChange={(e) => setReplyDraft(e.target.value)}
                    placeholder={`Reply to ${note.author}…`}
                    className="w-full resize-none rounded-xl border border-neutral-200/90 bg-white px-3 py-2 text-sm leading-snug text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-neutral-300 focus:ring-0"
                    autoFocus
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleReplySubmit(index)}
                      disabled={!replyDraft.trim() || submitting}
                      className="rounded-full bg-[#FF5722] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {submitting ? "Posting…" : "Post reply"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelReply}
                      disabled={submitting}
                      className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-100 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
            </li>
          ))}
          </ul>
        </div>
      ) : null}

      {!isSignedIn ? (
        <div
          className={cn(
            "rounded-2xl bg-[#e8f4fc] px-4 py-4",
            notes.length > 0 ? "mt-4" : "mt-3",
          )}
        >
          <p className="text-sm font-bold text-[#1e4d7a]">Leave a comment as a member.</p>
          <Link
            href={loginHref}
            className="mt-2 inline-block text-sm font-medium text-[#2563a8] underline-offset-2 hover:underline"
          >
            Login
          </Link>
        </div>
      ) : !isReplying ? (
        <div className={cn("space-y-3", notes.length > 0 ? "mt-4" : "mt-3")}>
          <label htmlFor={`community-note-${mealId}`} className="sr-only">
            Add a community note
          </label>
          <textarea
            id={`community-note-${mealId}`}
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Share a tip about price, portion, or cash only…"
            disabled={submitting}
            className="w-full resize-none rounded-2xl border border-neutral-200/90 bg-white px-3.5 py-2.5 text-sm leading-snug text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-neutral-300 focus:ring-0 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!draft.trim() || submitting}
            className="rounded-full bg-[#FF5722] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {submitting ? "Posting…" : "Post note"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
