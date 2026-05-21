"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { ApiError } from "@/api/inspector";
import {
  listMealsForFeaturedAdmin,
  toggleFeaturedListing,
} from "@/api/routes/featured.api";
import type { FeaturedListingStatus } from "@/features/submissions/data/mock-featured-listings";
import {
  defaultFeaturedUntilIso,
  mapFeaturedMealToListing,
  type FeaturedListingView,
} from "@/features/submissions/utils/mapFeaturedMeal";
import { cn } from "@/lib/utils/cn";

const SECTION_TITLE_CLASS =
  "text-[11px] font-bold uppercase tracking-wider text-neutral-500";

const STATUS_STYLES: Record<FeaturedListingStatus, string> = {
  active: "bg-emerald-100 text-emerald-800",
  scheduled: "bg-sky-100 text-sky-800",
  inactive: "bg-neutral-100 text-neutral-600",
};

function StatusBadge({ status }: { status: FeaturedListingStatus }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        STATUS_STYLES[status],
      )}
    >
      {label}
    </span>
  );
}

function FeaturedToggle({
  enabled,
  onChange,
  label,
  disabled,
}: {
  enabled: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50",
        enabled ? "bg-[#FF5722]" : "bg-neutral-300",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
          enabled && "translate-x-5",
        )}
      />
    </button>
  );
}

function FeaturedCard({
  item,
  onToggle,
  busy,
}: {
  item: FeaturedListingView;
  onToggle: (mealId: number, enabled: boolean) => void;
  busy?: boolean;
}) {
  return (
    <article className="flex items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white p-3 shadow-sm">
      <div
        className="h-16 w-16 shrink-0 rounded-xl bg-neutral-200/80 bg-cover bg-center"
        style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})` } : undefined}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-neutral-900">{item.name}</p>
        <p className="mt-0.5 text-xs text-neutral-600">{item.dish}</p>
        <p className="mt-1 line-clamp-2 text-xs font-bold leading-snug text-neutral-900">
          {item.location}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <p className="text-xs text-neutral-500">
            Featured until {item.featuredUntil ?? "—"}
          </p>
          <StatusBadge status={item.status} />
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <FeaturedToggle
          enabled={item.enabled}
          disabled={busy}
          onChange={(next) => onToggle(item.mealId, next)}
          label={`${item.enabled ? "Remove" : "Add"} ${item.name} from featured`}
        />
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700"
          aria-label={`More actions for ${item.name}`}
        >
          <MoreHorizontal className="h-4 w-4" strokeWidth={2} aria-hidden />
        </button>
      </div>
    </article>
  );
}

export function FeaturedListingsSection() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [toggleBusyId, setToggleBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(searchQuery.trim()), 300);
    return () => window.clearTimeout(t);
  }, [searchQuery]);

  const mealsQuery = useQuery({
    queryKey: ["admin-meals-feature", debouncedQ],
    queryFn: async () => {
      const res = await listMealsForFeaturedAdmin(debouncedQ, debouncedQ.length >= 2 ? 50 : 100);
      return res.data.map(mapFeaturedMealToListing);
    },
    staleTime: 30_000,
  });

  const listings = mealsQuery.data ?? [];
  const isLoading = mealsQuery.isLoading;
  const isError = mealsQuery.isError;

  const handleToggle = async (mealId: number, enabled: boolean) => {
    setToggleBusyId(mealId);
    setError(null);
    try {
      await toggleFeaturedListing(mealId, {
        isFeatured: enabled,
        featuredUntil: enabled ? defaultFeaturedUntilIso() : null,
      });
      await queryClient.invalidateQueries({ queryKey: ["admin-meals-feature"] });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update featured listing.");
    } finally {
      setToggleBusyId(null);
    }
  };

  return (
    <section>
      <h2 className={SECTION_TITLE_CLASS}>Featured listings</h2>
      <p className="mt-1 text-xs text-neutral-500">
        All approved restaurants — toggle on to feature on the map.
      </p>
      <label htmlFor="featured-listings-search" className="sr-only">
        Search restaurants
      </label>
      <div className="relative mt-3">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          aria-hidden
        />
        <input
          id="featured-listings-search"
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search restaurants…"
          className="h-11 w-full rounded-2xl border border-neutral-200/90 bg-white py-2.5 pr-3.5 pl-10 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-300 focus:ring-0"
        />
      </div>

      {error ? (
        <p className="mt-2 text-center text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-3 space-y-3">
        {isLoading ? (
          <p className="rounded-2xl border border-neutral-200/90 bg-white px-4 py-8 text-center text-sm text-neutral-500">
            Loading restaurants…
          </p>
        ) : null}
        {isError ? (
          <p className="rounded-2xl border border-neutral-200/90 bg-white px-4 py-8 text-center text-sm text-red-600">
            Could not load restaurants. Sign in as admin and try again.
          </p>
        ) : null}
        {!isLoading && !isError && listings.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-neutral-300 bg-white/60 px-4 py-8 text-center text-sm text-neutral-600">
            {debouncedQ.length >= 2
              ? "No restaurants match your search."
              : "No approved restaurants yet."}
          </p>
        ) : null}
        {!isLoading && !isError
          ? listings.map((item) => (
              <FeaturedCard
                key={item.id}
                item={item}
                busy={toggleBusyId === item.mealId}
                onToggle={handleToggle}
              />
            ))
          : null}
      </div>
    </section>
  );
}
