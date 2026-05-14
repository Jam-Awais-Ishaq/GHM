import { siteConfig } from "@/config/site";

export default function SavedPage() {
  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <h1 className="text-2xl font-bold text-neutral-900">Saved feeds</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Local bookmarks (Zustand + persistence) — next step for {siteConfig.name}.
      </p>
    </div>
  );
}
