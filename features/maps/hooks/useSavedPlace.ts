"use client";

import { useCallback, useEffect, useState } from "react";

import {
  isPlaceSaved,
  SAVED_PLACES_CHANGED_EVENT,
  toggleSavedPlace,
  type SavedPlace,
} from "@/lib/saved/savedPlaces";

export function useSavedPlace(entry: SavedPlace | null) {
  const [saved, setSaved] = useState(false);

  const refresh = useCallback(() => {
    if (!entry) {
      setSaved(false);
      return;
    }
    setSaved(isPlaceSaved(entry.id));
  }, [entry]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onChange = () => refresh();
    window.addEventListener(SAVED_PLACES_CHANGED_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(SAVED_PLACES_CHANGED_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [refresh]);

  const toggle = useCallback(() => {
    if (!entry) return;
    const next = toggleSavedPlace(entry);
    setSaved(next);
  }, [entry]);

  return { saved, toggle };
}
