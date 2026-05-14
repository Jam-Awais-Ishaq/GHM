import { siteConfig } from "@/config/site";

export default function HotDealsPage() {
  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <h1 className="text-2xl font-bold text-neutral-900">Hot Deals</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Time-limited specials — coming next on {siteConfig.name}.
      </p>
    </div>
  );
}
