"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Info, ThumbsUp } from "lucide-react";

import { BrokiesClubModal } from "@/features/maps/saved/components/BrokiesClubModal";

import {
  PUBLIC_PAGE_ACCENT,
  PublicListPageShell,
} from "@/components/layout/PublicListPageShell";
import { routes } from "@/config/routes";
import {
  clearAllSavedPlaces,
  getSavedPlaces,
  SAVED_PLACES_CHANGED_EVENT,
  type SavedPlace,
} from "@/lib/saved/savedPlaces";
import { formatPriceCompact } from "@/lib/utils/formatCurrency";
import { cn } from "@/lib/utils/cn";

const VOTE_YELLOW = "#facc15";

export default function SavedPage() {
  const [brokiesOpen, setBrokiesOpen] = useState(false);
  const [saved, setSaved] = useState<SavedPlace[]>([]);

  const refresh = useCallback(() => {
    setSaved(getSavedPlaces());
  }, []);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener(SAVED_PLACES_CHANGED_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(SAVED_PLACES_CHANGED_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [refresh]);

  return (
    <PublicListPageShell
      title="Saved feeds"
      subtitle="Your secret stash of cheap wins."
      showEditButton={false}
    >
      <section className="mb-5">
        <h3 className="text-lg font-bold tracking-tight text-neutral-900">Brokies Club</h3>
        <button
          type="button"
          onClick={() => setBrokiesOpen(true)}
          className="mt-3 w-full rounded-2xl py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(255,87,34,0.35)] transition hover:brightness-105 active:scale-[0.99]"
          style={{ backgroundColor: PUBLIC_PAGE_ACCENT }}
        >
          Join the Club
        </button>
      </section>

      <BrokiesClubModal open={brokiesOpen} onClose={() => setBrokiesOpen(false)} />

      <div className="mb-5 flex gap-2.5 rounded-2xl border border-orange-200/50 bg-[#ffe8d9]/80 px-4 py-3.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-900/70" aria-hidden />
        <p className="text-sm leading-snug text-amber-950/80">
          Your saved places are stored on this device only. No account needed.
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {saved.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-neutral-300 bg-white/60 px-4 py-10 text-center text-sm text-neutral-600">
            No saved places yet. Tap the heart on a listing from the map.
          </li>
        ) : null}
        {saved.map((r) => (
          <li key={r.id}>
            <Link
              href={routes.restaurant(r.restaurantId ?? r.id)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white p-3.5 shadow-sm",
                "transition hover:border-neutral-300 hover:shadow-md active:scale-[0.995]",
              )}
            >
              {r.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.imageUrl}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-xl border border-neutral-200/70 object-cover"
                />
              ) : (
                <div
                  className="h-16 w-16 shrink-0 rounded-xl border border-neutral-200/70 bg-neutral-100"
                  aria-hidden
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-neutral-900">{r.name}</p>
                <p className="mt-0.5 text-sm text-neutral-500">{r.dish}</p>
                <p className="mt-2 text-[13px] font-bold text-neutral-900">{r.suburb}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2 self-stretch justify-between py-0.5">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50"
                  aria-hidden
                >
                  <Heart className="h-4 w-4 fill-current" style={{ color: PUBLIC_PAGE_ACCENT }} />
                </span>
                <span
                  className="text-2xl font-bold leading-none tabular-nums tracking-tight"
                  style={{ color: PUBLIC_PAGE_ACCENT }}
                >
                  {formatPriceCompact(r.price)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {saved.length > 0 ? (
        <button
          type="button"
          onClick={() => {
            clearAllSavedPlaces();
            refresh();
          }}
          className="mt-5 w-full rounded-full border border-neutral-200/90 bg-white py-3.5 text-sm font-bold text-neutral-900 shadow-sm transition hover:bg-neutral-50 active:scale-[0.99]"
        >
          Clear all
        </button>
      ) : null}
    </PublicListPageShell>
  );
}
