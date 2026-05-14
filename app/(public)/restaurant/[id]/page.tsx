import { ArrowLeft, Crown, MapPin, ThumbsDown, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { getRestaurantById } from "@/features/restaurants/data/mock-restaurants";
import { formatPriceCompact } from "@/lib/utils/formatCurrency";
import { formatRelativeDay } from "@/lib/utils/formatDate";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const r = getRestaurantById(id);
  if (!r) return { title: `Not found · ${siteConfig.name}` };
  return {
    title: `${r.name} · ${formatPriceCompact(r.price)} · ${siteConfig.name}`,
    description: r.dish,
  };
}

export default async function RestaurantPage({ params }: PageProps) {
  const { id } = await params;
  const r = getRestaurantById(id);
  if (!r) notFound();

  const verified = r.priceVerifiedAt
    ? `Price verified ${formatRelativeDay(new Date(r.priceVerifiedAt))}`
    : "Price not yet verified";

  return (
    <div className="min-h-[100dvh] bg-[#faf8f5] pb-28">
      <div className="relative h-48 w-full bg-gradient-to-br from-neutral-200 to-neutral-300">
        <Link
          href={routes.map}
          className="absolute left-4 top-[max(1rem,env(safe-area-inset-top))] inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-md"
          aria-label="Back to map"
        >
          <ArrowLeft className="h-5 w-5 text-neutral-800" />
        </Link>
      </div>

      <main className="relative -mt-8 mx-0 w-full max-w-none rounded-t-3xl bg-[#faf8f5] px-4 pb-8 pt-6 sm:mx-auto sm:max-w-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{r.name}</h1>
            <p className="mt-1 text-sm text-neutral-600">{r.dish}</p>
          </div>
          <p className="text-3xl font-bold text-[#FF5722]">{formatPriceCompact(r.price)}</p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-4 w-4 text-[#FF5722]" aria-hidden />
            {r.suburb}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-semibold text-white">
            <ThumbsUp className="h-3.5 w-3.5" aria-hidden />+{r.netScore}
          </span>
          {r.isTopRated && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">
              <Crown className="h-3.5 w-3.5" aria-hidden />
              Featured
            </span>
          )}
        </div>

        <p className="mt-4 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 shadow-sm">
          ✓ {verified}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-neutral-100 bg-white p-4 text-center shadow-sm">
          <div>
            <p className="text-xs font-medium text-neutral-500">Worth it</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-lg font-bold text-neutral-900">
              <ThumbsUp className="h-4 w-4 text-emerald-600" aria-hidden />
              {r.worthIt}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">Net score</p>
            <p className="mt-1 text-lg font-bold text-[#FF5722]">+{r.netScore}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">Overrated</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-lg font-bold text-neutral-900">
              <ThumbsDown className="h-4 w-4 text-rose-500" aria-hidden />
              {r.overrated}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Address</p>
          <p className="mt-2 text-sm text-neutral-800">{r.address}</p>
        </div>

        <Link
          href={routes.map}
          className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-[#FF5722] text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#e64a19] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40"
        >
          View on map
        </Link>
      </main>
    </div>
  );
}
