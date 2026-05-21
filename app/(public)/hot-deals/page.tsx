"use client";

import Link from "next/link";
import { Flame } from "lucide-react";

import {
  PUBLIC_PAGE_ACCENT,
  PublicListPageShell,
} from "@/components/layout/PublicListPageShell";
import { routes } from "@/config/routes";
import { useHotDeals } from "@/features/restaurants/hooks/useHotDeals";
import { formatPriceCompact } from "@/lib/utils/formatCurrency";
import { cn } from "@/lib/utils/cn";

export default function HotDealsPage() {
  const { data: deals = [], isLoading } = useHotDeals();

  return (
    <PublicListPageShell
      title="Hot Deals"
      subtitle="Time-limited specials. A little gift from your local."
      showEditButton={false}
      titleAddon={
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-rose-700">
          <Flame className="h-3 w-3 shrink-0" aria-hidden />
          {isLoading ? "…" : `${deals.length} live now`}
        </span>
      }
    >
      <ul className="flex flex-col gap-4">
        {isLoading ? (
          <li className="py-8 text-center text-sm text-neutral-500">Loading hot deals…</li>
        ) : null}
        {!isLoading && deals.length === 0 ? (
          <li className="py-8 text-center text-sm text-neutral-500">No active hot deals right now.</li>
        ) : null}
        {deals.map((deal) => (
          <li key={deal.id}>
            <article className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm">
              <div
                className="flex items-start justify-between gap-3 px-4 py-4 sm:px-5 sm:py-5"
                style={{ backgroundColor: PUBLIC_PAGE_ACCENT }}
              >
                <div className="min-w-0">
                  <p className="text-3xl font-bold leading-none tracking-tight text-white sm:text-[2rem]">
                    {formatPriceCompact(deal.meal.price)}
                  </p>
                  <p className="mt-1.5 text-xs font-bold tracking-[0.12em] text-white/95">
                    {deal.meal.dishName.toUpperCase()}
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-neutral-900 px-3 py-1.5 text-[11px] font-semibold text-white sm:text-xs">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: PUBLIC_PAGE_ACCENT }}
                    aria-hidden
                  />
                  Ends in {deal.countdown.replace(/\s*left$/i, "")}
                </span>
              </div>
              <div className="flex items-start justify-between gap-3 px-4 py-4 sm:px-5">
                <div className="min-w-0">
                  <p className="text-[15px] font-bold leading-snug text-neutral-900">
                    {deal.meal.restaurant.name} · {deal.meal.restaurant.suburb}
                  </p>
                  {deal.description ? (
                    <p className="mt-1 text-sm leading-snug text-neutral-500">{deal.description}</p>
                  ) : null}
                </div>
                <Link
                  href={`${routes.restaurant(String(deal.meal.restaurant.id))}?meal=${deal.meal.id}`}
                  className={cn(
                    "shrink-0 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800",
                    "shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.98]",
                  )}
                >
                  View
                </Link>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </PublicListPageShell>
  );
}
