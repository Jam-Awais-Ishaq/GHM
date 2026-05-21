"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Flag, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";

import { ApiError } from "@/api/inspector";
import { createReport, getMyReportStatus } from "@/api/routes/reports.api";
import { routes } from "@/config/routes";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils/cn";

const ACCENT = "#FF5722";

const fieldClass =
  "w-full resize-none rounded-2xl border-0 bg-orange-50/70 px-4 py-3 text-sm text-neutral-900 outline-none ring-0 transition placeholder:text-neutral-400 focus:bg-orange-50 focus:ring-2 focus:ring-[#FF5722]/25";

type FlagOutdatedReportProps = {
  mealId: number;
  className?: string;
};

export function FlagOutdatedReport({ mealId, className }: FlagOutdatedReportProps) {
  const queryClient = useQueryClient();
  const { isSignedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [autoHidden, setAutoHidden] = useState(false);
  const [alreadyReported, setAlreadyReported] = useState(false);
  const titleId = useId();
  const reasonId = useId();

  const loginHref = `${routes.login}?returnTo=${encodeURIComponent(
    typeof window !== "undefined" ? window.location.pathname + window.location.search : routes.map,
  )}`;

  const { data: reportStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["my-report-status", mealId],
    queryFn: () => getMyReportStatus(mealId),
    enabled: isSignedIn && mealId > 0,
    staleTime: 60_000,
  });

  const hasReported = alreadyReported || Boolean(reportStatus?.hasReported);

  const reasonTrimmed = reason.trim();
  const canSubmit =
    isSignedIn &&
    !hasReported &&
    reasonTrimmed.length > 0 &&
    !submitting &&
    !success;

  useEffect(() => {
    if (reportStatus?.hasReported) {
      setAlreadyReported(true);
    }
  }, [reportStatus?.hasReported]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, submitting]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function closeModal() {
    if (submitting) return;
    setOpen(false);
    setReason("");
    setError(null);
    setSuccess(false);
    setAutoHidden(false);
  }

  function openModal() {
    if (!isSignedIn) return;
    if (hasReported) return;
    setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await createReport({ mealId, reason: reasonTrimmed });
      if (!res.success) {
        setError("Could not submit report. Please try again.");
        return;
      }
      setSuccess(true);
      setAlreadyReported(true);
      setAutoHidden(Boolean(res.mealAutoHidden));
      void queryClient.invalidateQueries({ queryKey: ["my-report-status", mealId] });
      void queryClient.invalidateQueries({ queryKey: ["map-listings"] });
      window.setTimeout(() => closeModal(), res.mealAutoHidden ? 2400 : 1600);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setAlreadyReported(true);
        setError("You have already reported this listing.");
        return;
      }
      if (err instanceof ApiError && err.status === 401) {
        setError("Please sign in to report a listing.");
        return;
      }
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not submit report. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!isSignedIn) {
    return (
      <Link
        href={loginHref}
        className={cn(
          "flex items-center gap-2 text-xs font-medium text-neutral-500 transition hover:text-neutral-700",
          className,
        )}
      >
        <Flag className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
        Sign in to flag outdated info
      </Link>
    );
  }

  if (statusLoading) {
    return (
      <p className={cn("text-xs text-neutral-400", className)}>Checking report status…</p>
    );
  }

  if (hasReported) {
    return (
      <p
        className={cn(
          "flex items-center gap-2 text-xs font-medium text-neutral-500",
          className,
        )}
      >
        <Flag className="h-3.5 w-3.5 shrink-0 opacity-50" strokeWidth={2} aria-hidden />
        You already reported this listing
      </p>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={cn(
          "flex items-center gap-2 text-xs font-medium text-neutral-500 transition hover:text-neutral-700",
          className,
        )}
      >
        <Flag className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
        Flag outdated info
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[250] flex items-end justify-center sm:items-center sm:p-4">
              <button
                type="button"
                className="absolute inset-0 bg-neutral-950/40 animate-[ghm-backdrop-in_0.2s_ease-out] motion-reduce:animate-none"
                aria-label="Close"
                onClick={closeModal}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="relative z-10 w-full max-w-md rounded-t-3xl border border-neutral-200/80 bg-[#faf8f5] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 shadow-xl sm:rounded-3xl sm:pb-5 motion-safe:animate-[ghm-sheet-from-bottom_0.32s_cubic-bezier(0.22,1,0.36,1)_both] sm:motion-safe:animate-none"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 id={titleId} className="text-lg font-bold text-neutral-900">
                      Report outdated info
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      One report per account. Tell us what is wrong with this listing.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={submitting}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-neutral-600 shadow-sm transition hover:bg-neutral-50 disabled:opacity-50"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" aria-hidden />
                  </button>
                </div>

                {success ? (
                  <div className="space-y-2">
                    <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                      Thanks — your report was submitted.
                    </p>
                    {autoHidden ? (
                      <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        This listing received 3 reports and has been hidden from the map for admin
                        review.
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor={reasonId}
                        className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500"
                      >
                        Reason <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        id={reasonId}
                        rows={4}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g. Price is now $12, restaurant closed, wrong dish name…"
                        className={fieldClass}
                        disabled={submitting || hasReported}
                        autoFocus
                      />
                    </div>

                    {error ? (
                      <p className="text-sm font-medium text-red-600" role="alert">
                        {error}
                      </p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className={cn(
                        "flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold text-white shadow-md transition",
                        canSubmit
                          ? "bg-[#FF5722] hover:bg-[#e64a19]"
                          : "cursor-not-allowed bg-neutral-300 text-neutral-500",
                      )}
                      style={canSubmit ? { backgroundColor: ACCENT } : undefined}
                    >
                      {submitting ? "Submitting…" : "Submit report"}
                    </button>
                  </form>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
