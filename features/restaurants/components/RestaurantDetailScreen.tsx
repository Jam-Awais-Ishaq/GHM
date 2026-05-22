"use client";

import { ArrowLeft, Flame, MapPin, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { routes } from "@/config/routes";
import { FlagOutdatedReport } from "@/features/restaurants/components/FlagOutdatedReport";
import { MealVoteCards } from "@/features/restaurants/components/MealVoteCards";
import { useMealVoteTotals } from "@/features/restaurants/hooks/useMealVoteTotals";
import type { RestaurantDetailView } from "@/features/restaurants/types/restaurantDetail";
import {
  formatDealRemaining,
  getSoonestActiveDeal,
  mealHasActiveHotDeal,
} from "@/features/restaurants/utils/hotDeal";
import { formatPriceCompact } from "@/lib/utils/formatCurrency";
import { formatPriceVerifiedLabel } from "@/lib/utils/formatDate";
import { cn } from "@/lib/utils/cn";

type RestaurantDetailScreenProps = {
  detail: RestaurantDetailView;
  initialMealId?: number;
};

export function RestaurantDetailScreen({
  detail,
  initialMealId,
}: RestaurantDetailScreenProps) {
  const defaultMeal = detail.meals[0]!;
  const soonestDeal = useMemo(() => getSoonestActiveDeal(detail.meals), [detail.meals]);

  const [selectedMealId, setSelectedMealId] = useState(
    initialMealId ?? soonestDeal?.mealId ?? defaultMeal.mealId,
  );
  const [countdownLabel, setCountdownLabel] = useState("");

  const selectedMeal =
    detail.meals.find((m) => m.mealId === selectedMealId) ?? defaultMeal;

  const { netScoreLabel, isLoading: votesLoading } = useMealVoteTotals(selectedMeal.mealId);

  const popupDeal = soonestDeal;
  const showHotBadge = mealHasActiveHotDeal(selectedMeal);

  useEffect(() => {
    if (!popupDeal) {
      setCountdownLabel("");
      return;
    }

    const tick = () => {
      const ms = Math.max(0, new Date(popupDeal.deal.endDateTime).getTime() - Date.now());
      setCountdownLabel(formatDealRemaining(ms));
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [popupDeal]);

  return (
    <div className="min-h-[100dvh] w-full min-w-0 overflow-x-hidden bg-[#faf8f5] pb-28">
      <div className="relative h-52 w-full bg-gradient-to-br from-neutral-200 to-neutral-300 sm:h-56">
        {selectedMeal.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={selectedMeal.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : null}

        <Link
          href={routes.map}
          className="absolute left-4 top-[max(1rem,env(safe-area-inset-top))] z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-md"
          aria-label="Back to map"
        >
          <ArrowLeft className="h-5 w-5 text-neutral-800" />
        </Link>

        {popupDeal ? (
          <button
            type="button"
            onClick={() => setSelectedMealId(popupDeal.mealId)}
            className={cn(
              "ghm-hotdeal-badge-pulse absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-10 max-w-[min(11rem,42vw)] rounded-2xl border border-rose-200/90 bg-white/95 px-3 py-2.5 text-left shadow-lg backdrop-blur-sm",
              selectedMealId === popupDeal.mealId && "ring-2 ring-[#FF5722]/60",
            )}
            aria-label={`View hot deal: ${popupDeal.dishName}, ${countdownLabel}`}
          >
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-rose-600">
              <Flame className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Ending soon
            </span>
            <span className="mt-1 block truncate text-sm font-bold text-neutral-900">
              {popupDeal.dishName}
            </span>
            <span className="mt-0.5 block text-xs font-semibold tabular-nums text-[#FF5722]">
              {countdownLabel || "…"}
            </span>
          </button>
        ) : null}
      </div>

      <main className="relative -mt-8 mx-0 w-full min-w-0 max-w-none rounded-t-3xl bg-[#faf8f5] px-4 pb-8 pt-6 sm:mx-auto sm:max-w-lg sm:px-5">
        <div className="flex flex-col gap-3 min-[400px]:flex-row min-[400px]:items-start min-[400px]:justify-between min-[400px]:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="break-words text-2xl font-bold text-neutral-900">{detail.name}</h1>
            <p className="mt-1 text-sm font-medium text-neutral-800">{selectedMeal.dishName}</p>
            {selectedMeal.cuisine ? (
              <p className="mt-0.5 text-sm text-neutral-500">{selectedMeal.cuisine}</p>
            ) : null}
          </div>
          <p className="shrink-0 text-3xl font-bold leading-none text-[#FF5722] min-[400px]:text-right">
            {formatPriceCompact(selectedMeal.price)}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-4 w-4 text-[#FF5722]" aria-hidden />
            {detail.suburb}
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-semibold tabular-nums text-white"
            title="Community vote score"
          >
            <ThumbsUp className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {votesLoading ? "…" : netScoreLabel}
          </span>
          {showHotBadge ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
              <Flame className="h-3.5 w-3.5" aria-hidden />
              Hot deal
            </span>
          ) : null}
        </div>

        <p className="mt-4 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 shadow-sm">
          ✓ {formatPriceVerifiedLabel(selectedMeal.createdAt ?? new Date().toISOString())}
        </p>

        <MealVoteCards
          mealId={selectedMeal.mealId}
          restaurantId={detail.restaurantId}
          variant="detail"
          className="mt-4"
        />

        <div className="mt-6 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Address</p>
          <p className="mt-2 text-sm text-neutral-800">{detail.address}</p>
        </div>

        <Link
          href={routes.map}
          className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-[#FF5722] text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#e64a19] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40"
        >
          View on map
        </Link>

        <FlagOutdatedReport mealId={selectedMeal.mealId} className="mt-6" />
      </main>
    </div>
  );
}
