"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";

import { updatePrivacyPolicy } from "@/api/routes/privacyPolicy.api";
import { cn } from "@/lib/utils/cn";

const ACCENT = "#FF5722";

export type PrivacyPolicyEditModalProps = {
  open: boolean;
  initialContent: string;
  onClose: () => void;
};

export function PrivacyPolicyEditModal({
  open,
  initialContent,
  onClose,
}: PrivacyPolicyEditModalProps) {
  const titleId = useId();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(initialContent);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(initialContent);
      setError(null);
    }
  }, [open, initialContent]);

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

  const saveMutation = useMutation({
    mutationFn: () => updatePrivacyPolicy(draft),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["privacy-policy"] });
      onClose();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Could not save privacy policy.");
    },
  });

  if (!open) return null;

  const ui = (
    <>
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        className="fixed inset-0 z-[9998] bg-neutral-950/40"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "fixed left-1/2 z-[9999] flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 flex-col overflow-hidden bg-white",
          "top-[max(2.25rem,env(safe-area-inset-top)+1rem)]",
          "bottom-[max(1.25rem,env(safe-area-inset-bottom)+0.75rem)]",
          "rounded-3xl border border-neutral-200/80 shadow-[0_8px_40px_rgba(0,0,0,0.12)]",
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 id={titleId} className="text-xl font-bold text-neutral-900 sm:text-2xl">
                Edit privacy policy
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Use blank lines between paragraphs. Start a line with <code className="text-xs">## </code> for a
                heading.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition hover:bg-neutral-200"
              aria-label="Close"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>

          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="mt-4 min-h-0 flex-1 resize-none rounded-2xl border border-neutral-200 bg-neutral-50/80 px-4 py-3 text-sm leading-relaxed text-neutral-800 outline-none focus:border-neutral-300 focus:ring-2 focus:ring-[#FF5722]/20"
            aria-label="Privacy policy content"
          />

          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

          <div className="mt-4 flex shrink-0 justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saveMutation.isPending || !draft.trim()}
              onClick={() => saveMutation.mutate()}
              className="rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: ACCENT }}
            >
              {saveMutation.isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(ui, document.body);
}
