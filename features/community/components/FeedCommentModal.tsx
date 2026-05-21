"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";

import { ApiError } from "@/api/inspector";
import { createCommunityPost } from "@/api/routes/community.api";
import type { ApiCommunityPost } from "@/api/types/community";
import { routes } from "@/config/routes";
import {
  FEED_CATEGORIES,
  type FeedCategoryId,
} from "@/features/community/constants/feedCategories";
import {
  FeedRichTextEditor,
  isRichTextEmpty,
} from "@/features/community/components/FeedRichTextEditor";
import { buildCreatePostPayload } from "@/features/community/lib/feedComposerPayload";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils/cn";

const ACCENT = "#FF5722";

const fieldClass =
  "w-full rounded-2xl border-0 bg-orange-50/70 px-4 py-3 text-sm text-neutral-900 outline-none ring-0 transition placeholder:text-neutral-400 focus:bg-orange-50 focus:ring-2 focus:ring-[#FF5722]/25";

const labelClass =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500";

export type FeedComposerMode = "feed" | "comment";

export type FeedCommentModalProps = {
  open: boolean;
  onClose: () => void;
  mode: FeedComposerMode;
  defaultTitle?: string;
  defaultCategory?: FeedCategoryId;
  defaultDetailsHtml?: string;
  /** When false, submit stays local-only (e.g. mock edit flow). */
  submitToApi?: boolean;
  onPostCreated?: (post: ApiCommunityPost) => void;
};

export function FeedCommentModal({
  open,
  onClose,
  mode,
  defaultTitle = "",
  defaultCategory,
  defaultDetailsHtml = "",
  submitToApi = true,
  onPostCreated,
}: FeedCommentModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const ui = (
    <FeedCommentModalForm
      key={open ? `${mode}-${defaultTitle}-${defaultCategory ?? ""}` : "closed"}
      titleId={titleId}
      mode={mode}
      defaultTitle={defaultTitle}
      defaultCategory={defaultCategory}
      defaultDetailsHtml={defaultDetailsHtml}
      submitToApi={submitToApi}
      onPostCreated={onPostCreated}
      onClose={onClose}
    />
  );

  if (typeof document === "undefined") return null;
  return createPortal(ui, document.body);
}

type FeedCommentModalFormProps = {
  titleId: string;
  mode: FeedComposerMode;
  defaultTitle: string;
  defaultCategory?: FeedCategoryId;
  defaultDetailsHtml: string;
  submitToApi: boolean;
  onPostCreated?: (post: ApiCommunityPost) => void;
  onClose: () => void;
};

function FeedCommentModalForm({
  titleId,
  mode,
  defaultTitle,
  defaultCategory,
  defaultDetailsHtml,
  submitToApi,
  onPostCreated,
  onClose,
}: FeedCommentModalFormProps) {
  const { isSignedIn } = useAuth();
  const isFeed = mode === "feed";
  const [title, setTitle] = useState(isFeed ? defaultTitle : "");
  const [category, setCategory] = useState<FeedCategoryId>(defaultCategory ?? "finds");
  const [comment, setComment] = useState(isFeed ? defaultDetailsHtml : "");
  const [commentError, setCommentError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginHref = `${routes.login}?returnTo=${encodeURIComponent(routes.community)}`;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isRichTextEmpty(comment)) {
      setCommentError(true);
      return;
    }
    setCommentError(false);

    if (isFeed && submitToApi) {
      if (!isSignedIn) {
        setError("Login to post to the feed.");
        return;
      }
      const titleTrimmed = title.trim();
      if (!titleTrimmed) return;

      const payload = buildCreatePostPayload(comment, category, titleTrimmed);
      if (!payload.body) {
        setCommentError(true);
        return;
      }

      setSubmitting(true);
      try {
        const res = await createCommunityPost(payload);
        onPostCreated?.(res.data);
        onClose();
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : "Could not post. Please try again.",
        );
      } finally {
        setSubmitting(false);
      }
      return;
    }

    console.info(
      isFeed ? "Feed post:" : "Feed comment:",
      isFeed
        ? { title: title.trim(), category, comment }
        : { title: defaultTitle.trim(), comment },
    );
    onClose();
  };

  const heading = isFeed ? "Add feed" : "Add comment";
  const submitLabel = submitting ? "Posting…" : isFeed ? "Post feed" : "Post comment";
  const canSubmit =
    !submitting &&
    (isFeed ? title.trim().length > 0 : true) &&
    !isRichTextEmpty(comment);

  return (
    <>
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        className={cn(
          "fixed inset-0 z-[9998] bg-neutral-950/40 transition-opacity motion-reduce:transition-none",
          "max-sm:bg-neutral-950/25 sm:bg-neutral-950/40",
        )}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "fixed z-[9999] flex flex-col overflow-hidden bg-white shadow-xl",
          "max-sm:inset-0 max-sm:h-[100dvh] max-sm:max-h-[100dvh] max-sm:w-full max-sm:rounded-none",
          "sm:left-1/2 sm:top-[calc(50%+0.75rem)] sm:h-auto sm:max-h-[min(92dvh,44rem)] sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:border sm:border-neutral-200/80 sm:shadow-[0_8px_40px_rgba(0,0,0,0.12)]",
        )}
      >
        <header className="shrink-0 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:pb-4 sm:pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition hover:bg-neutral-200 hover:text-neutral-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
            <h2 id={titleId} className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-[1.65rem]">
              {heading}
            </h2>
          </div>
        </header>

        <form
          onSubmit={onSubmit}
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6",
            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          <div className="mb-4">
            <label htmlFor="feed-composer-title" className={labelClass}>
              Title
            </label>
            {isFeed ? (
              <input
                id="feed-composer-title"
                type="text"
                required
                placeholder="e.g. Found $6 pho in the Valley!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={fieldClass}
              />
            ) : (
              <input
                id="feed-composer-title"
                type="text"
                readOnly
                value={defaultTitle}
                className={cn(fieldClass, "cursor-default text-neutral-700")}
                tabIndex={-1}
                aria-readonly
              />
            )}
          </div>

          {isFeed ? (
            <div className="mb-4">
              <label htmlFor="feed-composer-category" className={labelClass}>
                Category
              </label>
              <select
                id="feed-composer-category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value as FeedCategoryId)}
                className={cn(fieldClass, "cursor-pointer appearance-none")}
              >
                {FEED_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="mb-5">
            <label htmlFor="feed-composer-body" className={labelClass}>
              Details
            </label>
            <FeedRichTextEditor
              id="feed-composer-body"
              value={comment}
              onChange={(html) => {
                setComment(html);
                setCommentError(false);
              }}
              placeholder="Share your take…"
            />
            {commentError ? (
              <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">
                Please add details or an image.
              </p>
            ) : null}
          </div>

          {error ? (
            <p className="mb-3 text-sm text-red-600" role="alert">
              {error}{" "}
              {!isSignedIn ? (
                <Link href={loginHref} className="font-semibold underline underline-offset-2">
                  Login
                </Link>
              ) : null}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className="flex h-12 min-h-12 w-full shrink-0 items-center justify-center rounded-2xl text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(255,87,34,0.35)] transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: ACCENT }}
          >
            {submitLabel}
          </button>
        </form>
      </div>
    </>
  );
}
