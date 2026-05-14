import Link from "next/link";
import { PenLine, ThumbsUp } from "lucide-react";

import { siteConfig } from "@/config/site";
import { routes } from "@/config/routes";
import { MOCK_RESTAURANTS } from "@/features/restaurants/data/mock-restaurants";
import { formatPriceCompact } from "@/lib/utils/formatCurrency";

export default function HomePage() {
  const ranked = [...MOCK_RESTAURANTS].sort((a, b) => b.netScore - a.netScore);

  return (
    <div className="min-h-[100dvh] bg-[#faf8f5] pb-28">
      <header className="sticky top-0 z-10 border-b border-orange-100/60 bg-[#faf8f5]/95 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur">
        <div className="mx-auto flex max-w-lg items-start justify-between gap-3">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FF5722] text-white">
              <span className="text-lg font-bold">G</span>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-neutral-900">{siteConfig.name}</h1>
              <p className="text-sm text-neutral-500">{siteConfig.tagline}</p>
            </div>
          </div>
          <Link
            href={routes.map}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm"
            aria-label="Drop a find on the map"
          >
            <PenLine className="h-5 w-5 text-neutral-700" />
          </Link>
        </div>
        <div className="mx-auto mt-5 max-w-lg">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Top cheap eats</h2>
          <p className="mt-1 text-sm text-neutral-600">Ranked by the community. No corporate sell-outs.</p>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pt-4">
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {["Near me", "CBD", "West End", "Fortitude Valley", "Price checks"].map((label, i) => (
            <button
              key={label}
              type="button"
              className={
                i === 0
                  ? "shrink-0 rounded-full bg-[#FF5722] px-4 py-2 text-xs font-semibold text-white shadow-sm"
                  : "shrink-0 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-700"
              }
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mb-4 rounded-2xl border border-[#FF5722]/40 bg-orange-50/80 p-4">
          <p className="text-sm font-semibold text-neutral-900">Near you · South Brisbane</p>
          <p className="mt-1 text-xs text-neutral-600">Top picks with demo data — hook up Supabase next.</p>
        </div>

        <ol className="divide-y divide-dotted divide-neutral-200 rounded-2xl border border-neutral-100 bg-white p-2 shadow-sm">
          {ranked.map((r, index) => (
            <li key={r.id}>
              <Link
                href={routes.restaurant(r.id)}
                className="flex gap-3 rounded-xl p-3 transition-colors hover:bg-neutral-50"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-neutral-100 bg-white text-xl font-bold text-neutral-400">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate font-semibold text-neutral-900">{r.name}</p>
                    <span className="shrink-0 text-lg font-bold text-[#FF5722]">
                      {formatPriceCompact(r.price)}
                    </span>
                  </div>
                  <p className="truncate text-sm text-neutral-600">{r.dish}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                    <span>{r.suburb}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-2 py-0.5 text-[11px] font-medium text-white">
                      <ThumbsUp className="h-3 w-3" aria-hidden />+{r.netScore}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ol>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Explore on the{" "}
          <Link href={routes.map} className="font-semibold text-[#FF5722] underline-offset-2 hover:underline">
            map
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
