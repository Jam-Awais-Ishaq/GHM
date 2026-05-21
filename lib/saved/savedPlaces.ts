import type { Restaurant } from "@/features/restaurants/types/restaurant";

export const SAVED_PLACES_STORAGE_KEY = "ghm-saved-places";

export type SavedPlace = {
  id: string;
  restaurantId?: string;
  name: string;
  dish: string;
  price: number;
  suburb: string;
  address: string;
  imageUrl?: string | null;
  lat: number;
  lng: number;
  savedAt: string;
};

export const SAVED_PLACES_CHANGED_EVENT = "ghm-saved-places-changed";

function readRaw(): SavedPlace[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_PLACES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is SavedPlace =>
        typeof row === "object" &&
        row !== null &&
        typeof (row as SavedPlace).id === "string" &&
        typeof (row as SavedPlace).name === "string",
    );
  } catch {
    return [];
  }
}

function writeAll(places: SavedPlace[]) {
  localStorage.setItem(SAVED_PLACES_STORAGE_KEY, JSON.stringify(places));
  window.dispatchEvent(new Event(SAVED_PLACES_CHANGED_EVENT));
}

export function getSavedPlaces(): SavedPlace[] {
  return readRaw();
}

export function isPlaceSaved(id: string): boolean {
  return readRaw().some((p) => p.id === id);
}

export function restaurantToSavedPlace(r: Restaurant): SavedPlace {
  return {
    id: r.id,
    restaurantId: r.restaurantId,
    name: r.name,
    dish: r.dish,
    price: r.price,
    suburb: r.suburb,
    address: r.address,
    imageUrl: r.imageUrl,
    lat: r.position.lat,
    lng: r.position.lng,
    savedAt: new Date().toISOString(),
  };
}

/** Toggle save; returns true if now saved. */
export function toggleSavedPlace(entry: SavedPlace): boolean {
  const list = readRaw();
  const idx = list.findIndex((p) => p.id === entry.id);
  if (idx >= 0) {
    list.splice(idx, 1);
    writeAll(list);
    return false;
  }
  writeAll([{ ...entry, savedAt: new Date().toISOString() }, ...list]);
  return true;
}

export function clearAllSavedPlaces() {
  writeAll([]);
}
