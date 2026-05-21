"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { verifyMagicLink } from "@/api/routes/auth.api";
import { routes } from "@/config/routes";
import { establishSessionAfterVerify } from "@/features/auth/actions/auth";
import { setBackendAccessToken } from "@/lib/auth/backendAccessToken";

/**
 * Completes magic-link login and sends the user straight to the map.
 * Shown only briefly while the token is verified.
 */
export function AuthVerifyClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  useEffect(() => {
    if (!token) {
      router.replace(`${routes.login}?error=verify-failed`);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const data = await verifyMagicLink(token);
        if (cancelled) return;

        if (!data.success || !data.role) {
          router.replace(`${routes.login}?error=verify-failed`);
          return;
        }

        if (data.accessToken) {
          setBackendAccessToken(data.accessToken);
        }

        const result = await establishSessionAfterVerify(data.role);
        if (cancelled) return;

        if (!result.ok) {
          router.replace(`${routes.login}?error=missing-email`);
          return;
        }

        router.replace(routes.map);
        router.refresh();
      } catch {
        if (!cancelled) {
          router.replace(`${routes.login}?error=verify-failed`);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, router]);

  return (
    <div className="min-h-[100dvh] bg-[#fff9f2]" aria-busy="true" aria-label="Signing you in" />
  );
}
