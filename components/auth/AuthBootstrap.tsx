"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { probeBackendSession } from "@/api/routes/auth.api";
import {
  needsBackendSessionSync,
  syncSessionFromBackend,
} from "@/features/auth/actions/auth";

/**
 * After the user opens the magic link on the API host, `ghm_token` lives on the backend origin.
 * This probe syncs `ghm_session` on the frontend when a pending email cookie is present.
 */
export function AuthBootstrap() {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    void (async () => {
      try {
        const shouldProbe = await needsBackendSessionSync();
        if (!shouldProbe) return;

        const backend = await probeBackendSession();
        if (!backend) return;

        const synced = await syncSessionFromBackend(backend.role);
        if (synced) {
          router.refresh();
        }
      } catch {
        // Server action or sync failed — ignore on public pages.
      }
    })();
  }, [router]);

  return null;
}
