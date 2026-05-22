"use client";

import Link from "next/link";
import { ThumbsUp } from "lucide-react";

import type { RankedRestaurantRow } from "@/api/types/ranking";
import { routes } from "@/config/routes";
import { formatPriceCompact } from "@/lib/utils/formatCurrency";
import { cn } from "@/lib/utils/cn";

const ACCENT = "#FF5722";
const VOTE_YELLOW = "#facc15";

type RankingRestaurantCardProps = {
  row: RankedRestaurantRow;
};

export function RankingRestaurantCard({ row }: RankingRestaurantCardProps) {
  return (
    <Link
      href={`${routes.restaurant(String(row.restaurantId))}?meal=${row.topMealId}`}
      className={cn(
        "group flex items-center gap-3.5 px-0 py-4 transition-colors",
        "hover:bg-neutral-900/[0.02] sm:gap-4 sm:py-[1.125rem]",
      )}
    >
      <div
        className={cn(
          "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-neutral-200/70 bg-white",
          "shadow-[0_1px_3px_rgba(0,0,0,0.07)] sm:h-[4.75rem] sm:w-[4.75rem] sm:rounded-[1.125rem]",
        )}
        aria-hidden
      >
        <span
          className="text-[1.65rem] font-bold leading-none tracking-tight sm:text-[2rem]"
          style={{ color: ACCENT }}
        >
          {row.rank}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
          <span className="text-[15px] font-bold tracking-tight text-neutral-900 sm:text-base">
            {row.restaurantName}
          </span>
          {row.distance ? (
            <span className="text-sm font-medium tabular-nums text-neutral-500">
              · {row.distance}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-[13px] leading-snug text-neutral-500 sm:text-sm">{row.dishName}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="line-clamp-2 min-w-0 text-[13px] font-bold leading-snug text-neutral-900 sm:text-sm">
            {row.suburb}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-2.5 py-1.5 text-xs font-bold shadow-sm">
            <ThumbsUp className="h-3.5 w-3.5 shrink-0" aria-hidden style={{ color: VOTE_YELLOW }} />
            <span className="tabular-nums" style={{ color: VOTE_YELLOW }}>
              {row.votes.displayScore}
            </span>
          </span>
        </div>
      </div>

      <div className="shrink-0 self-center pl-1 text-right">
        <span
          className="text-2xl font-bold leading-none tabular-nums tracking-tight sm:text-[1.75rem]"
          style={{ color: ACCENT }}
        >
          {formatPriceCompact(row.price)}
        </span>
      </div>
    </Link>
  );
}
