"use client";

import { Check, Flame, Star, X } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { PRICE_FILTER_CHIPS } from "@/constants/filters";
import { filterRestaurants } from "@/features/restaurants/store/mapExplore.store";
import type { SearchLocationHit } from "@/features/restaurants/store/mapExplore.store";
import type {
  CuisineFilterId,
  PriceFilterId,
  Restaurant,
  ShowOnlyFeedsId,
} from "@/features/restaurants/types/restaurant";
import { cn } from "@/lib/utils/cn";

const ACCENT = "#FF5722";
const ACCENT_SOFT = "rgba(255, 87, 34, 0.09)";
const CHIP_INACTIVE_BG = "#F3F4F6";

const MAX_PRICE_IDS = ["u15", "u12", "u8", "u5"] as const satisfies readonly PriceFilterId[];

const CUISINE_CHIPS: { id: CuisineFilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "vietnamese", label: "Vietnamese" },
  { id: "thai", label: "Thai" },
  { id: "korean", label: "Korean" },
  { id: "indian", label: "Indian" },
  { id: "bakery", label: "Bakery" },
  { id: "burgers", label: "Burgers" },
];

const SHOW_ROWS: {
  id: Exclude<ShowOnlyFeedsId, "all">;
  title: string;
  kind: "flame" | "verified" | "star";
}[] = [
  { id: "hot", title: "Hot Deals (live specials)", kind: "flame" },
  { id: "verified", title: "Price verified in last 30 days", kind: "verified" },
  { id: "top50", title: "Top rated (vote score 50+)", kind: "star" },
];

function isModalPriceId(id: PriceFilterId): id is (typeof MAX_PRICE_IDS)[number] {
  return (MAX_PRICE_IDS as readonly string[]).includes(id);
}

function FilterChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl px-2.5 py-1.5 text-[13px] font-semibold leading-none tracking-tight transition-colors max-sm:px-2.5 max-sm:py-1.5 max-sm:text-[13px] sm:px-3 sm:py-2 sm:text-[13px]",
        active ? "text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]" : "text-neutral-700 hover:bg-neutral-200/85 hover:text-neutral-800",
      )}
      style={active ? { backgroundColor: ACCENT } : { backgroundColor: CHIP_INACTIVE_BG }}
    >
      {children}
    </button>
  );
}

function ShowOnlyRowIcon({ kind, selected }: { kind: "flame" | "verified" | "star"; selected: boolean }) {
  if (kind === "flame") {
    return (
      <Flame
        className={cn("h-[19px] w-[19px] shrink-0 max-sm:h-[18px] max-sm:w-[18px]", !selected && "text-orange-600")}
        strokeWidth={2.35}
        style={selected ? { color: ACCENT } : undefined}
        aria-hidden
      />
    );
  }
  if (kind === "verified") {
    if (selected) {
      return (
        <Check className="h-[19px] w-[19px] shrink-0 max-sm:h-[18px] max-sm:w-[18px]" strokeWidth={2.35} style={{ color: ACCENT }} aria-hidden />
      );
    }
    return (
      <span
        className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md bg-emerald-500 text-white shadow-[0_1px_2px_rgba(16,185,129,0.35)] max-sm:h-[18px] max-sm:w-[18px]"
        aria-hidden
      >
        <Check className="h-2.5 w-2.5" strokeWidth={3} />
      </span>
    );
  }
  return (
    <Star
      className={cn("h-[19px] w-[19px] shrink-0 max-sm:h-[18px] max-sm:w-[18px]", selected ? "" : "fill-transparent")}
      strokeWidth={2.35}
      style={
        selected
          ? { color: ACCENT, fill: "rgba(255, 87, 34, 0.18)" }
          : { color: "#CA8A04", fill: "transparent" }
      }
      aria-hidden
    />
  );
}

function ShowOnlyRow({
  title,
  kind,
  selected,
  onClick,
}: {
  title: string;
  kind: "flame" | "verified" | "star";
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3.5 text-left transition-[background-color,border-color,box-shadow] duration-150 max-sm:gap-2.5 max-sm:border-neutral-200/90 max-sm:px-3 max-sm:py-3.5",
        selected ? "shadow-[0_1px_0_rgba(0,0,0,0.03)]" : "border-neutral-200 bg-white hover:border-neutral-300/90 hover:bg-neutral-50/60",
      )}
      style={
        selected
          ? {
              borderColor: ACCENT,
              backgroundColor: ACCENT_SOFT,
            }
          : undefined
      }
    >
      <ShowOnlyRowIcon kind={kind} selected={selected} />
      <span className="min-w-0 flex-1 text-[15px] font-semibold leading-snug tracking-[-0.01em] text-neutral-900 max-sm:font-medium max-sm:text-neutral-800 sm:text-[16px]">
        {title}
      </span>
      <span className="flex h-5 w-5 shrink-0 items-center justify-center max-sm:h-5 max-sm:w-5" aria-hidden>
        {selected ? (
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] max-sm:h-5 max-sm:w-5"
            style={{ backgroundColor: ACCENT }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white max-sm:h-1.5 max-sm:w-1.5" />
          </span>
        ) : (
          <span className="h-5 w-5 rounded-full border-2 border-neutral-200 bg-white max-sm:h-5 max-sm:w-5 max-sm:border-[#E5E5E5]" />
        )}
      </span>
    </button>
  );
}

export type MapFilterFeedsModalProps = {
  open: boolean;
  onClose: () => void;
  panelTopPx?: number | null;
  /** Mobile: Y position (viewport px) where map becomes visible — bottom sheet top aligns here. */
  mobileSheetTopPx?: number | null;
  restaurants: Restaurant[];
  searchQuery: string;
  searchLocation: SearchLocationHit | null;
  activePriceFilter: PriceFilterId;
  activeCuisine: CuisineFilterId;
  showOnlyFeeds: ShowOnlyFeedsId;
  onApply: (p: {
    price: (typeof MAX_PRICE_IDS)[number];
    cuisine: CuisineFilterId;
    show: ShowOnlyFeedsId;
  }) => void;
};

export function MapFilterFeedsModal({
  open,
  onClose,
  panelTopPx = null,
  mobileSheetTopPx = null,
  restaurants,
  searchQuery,
  searchLocation,
  activePriceFilter,
  activeCuisine,
  showOnlyFeeds,
  onApply,
}: MapFilterFeedsModalProps) {
  const [isNarrow, setIsNarrow] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 639px)").matches : false,
  );

  useLayoutEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setIsNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const [draftPrice, setDraftPrice] = useState<(typeof MAX_PRICE_IDS)[number]>("u12");
  const [draftCuisine, setDraftCuisine] = useState<CuisineFilterId>("all");
  const [draftShow, setDraftShow] = useState<ShowOnlyFeedsId>("all");

  useEffect(() => {
    if (!open) return;
    setDraftPrice(isModalPriceId(activePriceFilter) ? activePriceFilter : "u12");
    setDraftCuisine(activeCuisine);
    setDraftShow(showOnlyFeeds);
  }, [open, activePriceFilter, activeCuisine, showOnlyFeeds]);

  const count = useMemo(
    () =>
      filterRestaurants(restaurants, draftPrice, searchQuery, searchLocation, draftCuisine, draftShow).length,
    [restaurants, draftPrice, searchQuery, searchLocation, draftCuisine, draftShow],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !isNarrow) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isNarrow]);

  if (!open) return null;

  const priceChips = PRICE_FILTER_CHIPS.filter((c) => c.id !== "top");

  const dialogTopStyle =
    isNarrow && mobileSheetTopPx != null
      ? { top: mobileSheetTopPx, bottom: 0 }
      : !isNarrow && panelTopPx != null
        ? { top: Math.max(panelTopPx, 10) }
        : undefined;

  const ui = (
    <>
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        className="fixed inset-0 z-[200] bg-neutral-950/10 animate-[ghm-backdrop-in_0.2s_ease-out] motion-reduce:animate-none"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-feeds-title"
        className={cn(
          "fixed z-[210] flex min-h-0 flex-col overflow-hidden border border-neutral-200/80 bg-white max-sm:overscroll-y-contain max-sm:touch-manipulation",
          "max-sm:inset-x-0 max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:w-full max-sm:max-w-none max-sm:rounded-t-3xl max-sm:rounded-b-none max-sm:border-x-0 max-sm:border-b-0 max-sm:border-t max-sm:border-neutral-200/85 max-sm:shadow-[0_-12px_40px_rgba(0,0,0,0.14)]",
          !(isNarrow && mobileSheetTopPx != null) &&
            "max-sm:top-auto max-sm:max-h-[min(90dvh,calc(100dvh-env(safe-area-inset-top)-0.5rem))]",
          "max-sm:motion-safe:animate-[ghm-sheet-from-bottom_0.32s_cubic-bezier(0.22,1,0.36,1)_both] max-sm:motion-reduce:animate-none",
          "sm:left-[max(1.25rem,env(safe-area-inset-left))] sm:right-[max(1.25rem,env(safe-area-inset-right))] sm:bottom-[max(1.25rem,calc(env(safe-area-inset-bottom)+0.75rem))] sm:top-[max(1.5rem,calc(env(safe-area-inset-top)+1rem))] sm:w-auto sm:max-w-[25rem] sm:max-h-none sm:rounded-3xl sm:border sm:border-neutral-200/80 sm:shadow-[0_8px_40px_rgba(0,0,0,0.1),0_2px_12px_rgba(0,0,0,0.05)]",
          "sm:motion-safe:animate-[ghm-filter-panel-from-left_0.28s_cubic-bezier(0.22,1,0.36,1)_both] sm:motion-reduce:animate-none",
        )}
        style={dialogTopStyle}
      >
        <header className="shrink-0 px-4 pb-3 pt-2 max-sm:px-3 max-sm:pb-2.5 max-sm:pt-2 sm:px-6 sm:pb-4 sm:pt-3">
          <div className="flex justify-center pb-2 max-sm:pb-1 sm:hidden" aria-hidden>
            <div className="h-[3px] w-9 rounded-full bg-neutral-300 max-sm:h-1 max-sm:w-8" />
          </div>
          <div className="hidden sm:flex sm:justify-end sm:pb-1">
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition hover:bg-neutral-200/90 hover:text-neutral-700"
              aria-label="Close filters"
            >
              <X className="h-[15px] w-[15px]" strokeWidth={2} />
            </button>
          </div>
          <div className="min-w-0">
            <h2
              id="filter-feeds-title"
              className="text-[26px] font-bold leading-[1.15] tracking-[-0.025em] text-neutral-900 max-sm:text-[22px] max-sm:leading-snug sm:text-2xl"
            >
              Filter feeds
            </h2>
            <p className="mt-1 text-[13px] font-normal leading-snug text-neutral-500 max-sm:mt-1 max-sm:text-[13px] sm:mt-1 sm:text-[14px]">
              {"Spoiler: it's cheap."}
            </p>
          </div>
        </header>

        <div className="flex min-h-0 flex-col gap-4 overflow-x-hidden px-4 pb-1 pt-0 max-sm:min-h-0 max-sm:flex-1 max-sm:gap-3 max-sm:overflow-hidden max-sm:px-3 max-sm:pb-0 max-sm:pt-0 sm:flex-1 sm:gap-5 sm:overflow-hidden sm:px-6 sm:pb-3 sm:pt-1">
          <section className="shrink-0">
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500 max-sm:mb-2 max-sm:text-[11px] max-sm:tracking-[0.14em] max-sm:text-neutral-600 sm:mb-2.5 sm:font-bold sm:text-[10px] sm:tracking-[0.16em] sm:text-neutral-600">
              MAX PRICE
            </p>
            <div className="flex flex-wrap gap-x-2 gap-y-2 max-sm:gap-x-2 max-sm:gap-y-1.5 sm:gap-x-2">
              {priceChips.map((chip) => (
                <FilterChip
                  key={chip.id} 
                  active={draftPrice === chip.id}
                  onClick={() => setDraftPrice(chip.id as (typeof MAX_PRICE_IDS)[number])}
                >
                  {chip.label}
                </FilterChip>
              ))}
            </div>
          </section>

          <section className="shrink-0">
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500 max-sm:mb-2 max-sm:text-[11px] max-sm:tracking-[0.14em] max-sm:text-neutral-600 sm:mb-2.5 sm:font-bold sm:text-[10px] sm:tracking-[0.16em] sm:text-neutral-600">
              CUISINE
            </p>
            <div className="flex flex-wrap gap-x-2 gap-y-2 max-sm:gap-x-2 max-sm:gap-y-1.5 sm:gap-x-2">
              {CUISINE_CHIPS.map((chip) => (
                <FilterChip
                  key={chip.id}
                  active={draftCuisine === chip.id}
                  onClick={() => setDraftCuisine(chip.id)}
                >
                  {chip.label}
                </FilterChip>
              ))}
            </div>
          </section>

          <section className="flex flex-col overflow-hidden max-sm:flex-shrink-0 sm:min-h-0 sm:flex-1">
            <p className="mb-2 shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500 max-sm:mb-2 max-sm:text-[11px] max-sm:tracking-[0.14em] max-sm:text-neutral-600 sm:mb-2.5 sm:font-bold sm:text-[10px] sm:tracking-[0.16em] sm:text-neutral-600">
              SHOW ONLY
            </p>
            <div className="flex flex-col justify-start gap-1.5 overflow-x-hidden max-sm:gap-2.5 sm:min-h-0 sm:flex-1 sm:gap-2.5 sm:overflow-hidden">
              {SHOW_ROWS.map(({ id, title, kind }) => (
                <ShowOnlyRow
                  key={id}
                  title={title}
                  kind={kind}
                  selected={draftShow === id}
                  onClick={() => setDraftShow(id)}
                />
              ))}
            </div>
          </section>
        </div>

        <footer className="shrink-0 max-sm:bg-white max-sm:px-3 max-sm:pt-2.5 max-sm:pb-[max(0.375rem,env(safe-area-inset-bottom,0px))] sm:px-6 sm:pt-5 sm:pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => {
              onApply({ price: draftPrice, cuisine: draftCuisine, show: draftShow });
              onClose();
            }}
            className={cn(
              "flex w-full items-center justify-center text-white transition hover:brightness-[1.03] active:scale-[0.99]",
              "max-sm:h-10 max-sm:rounded-2xl max-sm:text-[13px] max-sm:font-medium max-sm:leading-snug max-sm:tracking-[-0.01em] max-sm:shadow-[0_3px_12px_rgba(255,87,34,0.32)] sm:h-12 sm:rounded-2xl sm:text-[15px] sm:font-semibold sm:leading-snug sm:tracking-[-0.01em] sm:shadow-[0_4px_14px_rgba(255,87,34,0.38)]",
            )}
            style={{ backgroundColor: ACCENT }}
          >
            {`Show ${count} ${count === 1 ? "Feed" : "Feeds"}`}
          </button>
        </footer>
      </div>
    </>
  );

  if (typeof document === "undefined") return null;
  return createPortal(ui, document.body);
}
