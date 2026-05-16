import Link from "next/link";
import { ThumbsUp } from "lucide-react";

import { RestaurantImage } from "@/features/restaurants/components/RestaurantImage";
import { formatDistanceKm } from "@/features/restaurants/utils/distance";
import type { RestaurantWithDistance } from "@/features/restaurants/types/restaurant";
import { formatPriceCompact } from "@/lib/utils/formatCurrency";
import { cn } from "@/lib/utils/cn";

type RestaurantPreviewCardProps = {
  restaurant: RestaurantWithDistance;
  href: string;
  /** When set, the card opens details in-app (e.g. map side panel) instead of navigating. */
  onOpen?: () => void;
  /** Map peek: narrow card, reference layout (thumb + text + price). */
  compact?: boolean;
  className?: string;
};

/** Map peek thumbnail — slightly tighter on very narrow viewports. */
const THUMB_MAP_COMPACT = cn(
  "size-[5rem] shrink-0 rounded-lg bg-neutral-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] sm:size-[5.5rem]",
);

/** Hide distance only when clearly bogus (half-earth+ still shown). */
const MAX_DISPLAY_DISTANCE_KM = 20_000;

const cardShellClass =
  "flex w-full gap-3 rounded-2xl border border-neutral-100/90 bg-white p-3.5 text-left shadow-[0_12px_40px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.04] transition hover:bg-neutral-50/95 active:scale-[0.99]";

/** Map peek: aligns with bottom nav (`max-w-md` / 28rem) but slightly narrower for hierarchy. */
const cardShellCompactClass = cn(
  "group flex w-full min-w-0 max-w-full items-start gap-2.5 rounded-2xl border border-neutral-200/70 bg-white px-3 py-2.5 text-left sm:items-center sm:gap-3 sm:px-3.5 sm:py-3",
  "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.07)] backdrop-blur-sm",
  "transition-[transform,box-shadow,border-color] duration-200 ease-out",
  "hover:border-neutral-300/80 hover:shadow-[0_2px_6px_rgba(0,0,0,0.05),0_10px_28px_rgba(0,0,0,0.09)]",
  "active:scale-[0.987] motion-reduce:transition-none motion-reduce:active:scale-100",
  "touch-manipulation select-none",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
);

export function RestaurantPreviewCard({
  restaurant,
  href,
  onOpen,
  compact,
  className,
}: RestaurantPreviewCardProps) {
  const distRaw = restaurant.distanceKm;
  const dist =
    distRaw != null &&
    Number.isFinite(distRaw) &&
    distRaw >= 0 &&
    distRaw <= MAX_DISPLAY_DISTANCE_KM
      ? formatDistanceKm(distRaw)
      : null;

  const shell = compact ? cardShellCompactClass : cardShellClass;

  const inner = compact ? (
    <>
      <div
        className={cn(
          THUMB_MAP_COMPACT,
          "relative self-start overflow-hidden bg-gradient-to-br from-neutral-200 to-neutral-300 sm:self-center",
        )}
      >
        <RestaurantImage
          src={restaurant.imageUrl}
          alt={restaurant.name}
          sizes="(max-width: 640px) 80px, 88px"
        />
      </div>
      <div className="flex min-h-[5rem] min-w-0 flex-1 flex-col justify-center gap-1.5 sm:min-h-[5.5rem] sm:gap-0.5">
        <div className="flex flex-row items-start justify-between gap-x-2.5">
          <h2 className="line-clamp-2 min-w-0 flex-1 text-left text-[15px] font-semibold leading-snug tracking-[-0.01em] text-neutral-900">
            {restaurant.name}
          </h2>
          <span className="shrink-0 self-start pt-0.5 text-xl font-bold tabular-nums tracking-tight text-[#FF5722]">
            {formatPriceCompact(restaurant.price)}
          </span>
        </div>
        <p className="line-clamp-2 text-[13px] leading-snug text-neutral-600">{restaurant.dish}</p>
        <p className="line-clamp-2 min-w-0 break-words text-[12px] leading-snug text-neutral-500">
          {restaurant.suburb}
          {dist ? ` · ${dist}` : ""}
          <span className="whitespace-nowrap">
            {" "}
            · <span className="text-amber-500">👍</span> +{restaurant.netScore}
          </span>
        </p>
      </div>
    </>
  ) : (
    <>
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-300">
        <RestaurantImage src={restaurant.imageUrl} alt={restaurant.name} sizes="64px" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h2 className="truncate font-semibold text-neutral-900">{restaurant.name}</h2>
          <span className="shrink-0 text-lg font-bold text-[#FF5722]">
            {formatPriceCompact(restaurant.price)}
          </span>
        </div>
        <p className="truncate text-sm text-neutral-600">{restaurant.dish}</p>
        <p className="mt-1 truncate text-xs text-neutral-500">
          {restaurant.suburb}
          {dist ? ` • ${dist}` : ""}
        </p>
        <p className="mt-0.5 flex items-center gap-1 truncate text-xs font-semibold text-[#FF5722]">
          <ThumbsUp className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
          +{restaurant.netScore}
        </p>
      </div>
    </>
  );

  if (onOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open details for ${restaurant.name}`}
        className={cn(shell, className)}
      >
        {inner}
      </button>
    );
  }

  return (
    <Link href={href} className={cn(shell, className)}>
      {inner}
    </Link>
  );
}
