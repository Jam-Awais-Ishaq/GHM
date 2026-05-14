import { siteConfig } from "@/config/site";

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <h1 className="text-2xl font-bold text-neutral-900">Feed</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Finds, tips & brags — wire this to Supabase for {siteConfig.name}.
      </p>
    </div>
  );
}
