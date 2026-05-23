"use client";

import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useMemo, useState } from "react";

import { getPrivacyPolicy } from "@/api/routes/privacyPolicy.api";
import { PublicListPageShell } from "@/components/layout/PublicListPageShell";
import { getDefaultPrivacyPolicyContent } from "@/features/privacy/constants/defaultPrivacyPolicy";
import { PrivacyPolicyEditModal } from "@/features/privacy/components/PrivacyPolicyEditModal";
import { renderPrivacyContent } from "@/features/privacy/lib/renderPrivacyContent";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils/cn";

export function PrivacyPolicyScreen() {
  const { isAdmin } = useAuth();
  const [editOpen, setEditOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["privacy-policy"],
    queryFn: getPrivacyPolicy,
    staleTime: 60_000,
  });

  const content = useMemo(() => {
    const saved = data?.content?.trim();
    if (saved) return saved;
    return getDefaultPrivacyPolicyContent();
  }, [data?.content]);

  const article = useMemo(() => renderPrivacyContent(content), [content]);

  return (
    <>
      <PublicListPageShell
        title="Privacy policy"
        subtitle="How we handle your data"
        showEditButton={false}
        headerAction={
          isAdmin ? (
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-neutral-200/90 bg-white shadow-sm transition hover:bg-neutral-50",
              )}
              aria-label="Edit privacy policy"
            >
              <Pencil className="h-5 w-5 text-neutral-700" />
            </button>
          ) : undefined
        }
      >
        <article className="max-w-none space-y-4 text-sm leading-relaxed text-neutral-700">
          {isLoading ? <p className="text-neutral-500">Loading…</p> : article}
        </article>
      </PublicListPageShell>

      {isAdmin ? (
        <PrivacyPolicyEditModal
          open={editOpen}
          initialContent={content}
          onClose={() => setEditOpen(false)}
        />
      ) : null}
    </>
  );
}
