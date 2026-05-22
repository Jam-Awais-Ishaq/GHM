"use client";

import { Camera, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";

import { createListing } from "@/api/routes/listings.api";
import { ApiError } from "@/api/inspector";
import type { CuisineFilterId } from "@/features/restaurants/types/restaurant";
import { cuisineFilterToApi } from "@/features/restaurants/utils/listingFilters";
import {
  DROP_FEED_SUBURB_ONLY_ERROR,
  getDropFeedClientCoords,
  isSuburbNameOnlyInput,
} from "@/lib/maps/resolveDropFeedLocation";
import { cn } from "@/lib/utils/cn";

const ACCENT = "#FF5722";

const CUISINE_OPTIONS: { id: Exclude<CuisineFilterId, "all">; label: string }[] = [
  { id: "vietnamese", label: "Vietnamese" },
  { id: "thai", label: "Thai" },
  { id: "korean", label: "Korean" },
  { id: "indian", label: "Indian" },
  { id: "bakery", label: "Bakery" },
  { id: "burgers", label: "Burgers" },
];

const fieldClass =
  "w-full rounded-2xl border-0 bg-orange-100/95 px-4 py-3 text-sm text-neutral-900 outline-none ring-0 transition placeholder:text-neutral-500 focus:bg-orange-100 focus:ring-2 focus:ring-[#FF5722]/25";

const labelClass =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500";

function RequiredMark() {
  return (
    <span className="ml-0.5 font-semibold text-red-600" aria-hidden="true">
      *
    </span>
  );
}

function toDateTimeMs(date: string, time: string) {
  if (!date) return NaN;
  const t = time || "23:59";
  return new Date(`${date}T${t}`).getTime();
}

function parsePrice(value: string): number | null {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function toIsoDateTime(date: string, time: string) {
  return new Date(`${date}T${time || "00:00"}`).toISOString();
}

function formatEndCountdown(msRemaining: number) {
  if (!Number.isFinite(msRemaining) || msRemaining <= 0) return "Ended";
  const totalMinutes = Math.floor(msRemaining / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `Ends in ${hours}h ${minutes}m`;
  const seconds = Math.floor((msRemaining % 60_000) / 1000);
  if (minutes > 0) return `Ends in ${minutes}m ${seconds}s`;
  return `Ends in ${seconds}s`;
}

export type DropFeedModalProps = {
  open: boolean;
  onClose: () => void;
};

export function DropFeedModal({ open, onClose }: DropFeedModalProps) {
  const titleId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restaurantName, setRestaurantName] = useState("");
  const [suburb, setSuburb] = useState("");
  const [price, setPrice] = useState("");
  const [dish, setDish] = useState("");
  const [cuisine, setCuisine] = useState<Exclude<CuisineFilterId, "all">>("vietnamese");
  const [dealTimerEnabled, setDealTimerEnabled] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [dealDescription, setDealDescription] = useState("");
  const [countdownLabel, setCountdownLabel] = useState("");
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setRestaurantName("");
      setSuburb("");
      setPrice("");
      setDish("");
      setCuisine("vietnamese");
      setDealTimerEnabled(false);
      setStartDate("");
      setStartTime("");
      setEndDate("");
      setEndTime("");
      setDealDescription("");
      setCountdownLabel("");
      setPhotoPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setSubmitting(false);
      setError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [photoPreviewUrl]);

  useEffect(() => {
    if (!dealTimerEnabled || !endDate) {
      setCountdownLabel("");
      return;
    }

    const tick = () => {
      const endMs = toDateTimeMs(endDate, endTime);
      setCountdownLabel(formatEndCountdown(endMs - Date.now()));
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [dealTimerEnabled, endDate, endTime]);

  if (!open) return null;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceNum = parsePrice(price);
    if (priceNum == null) {
      setError("Enter a valid price.");
      return;
    }

    const photoFile = fileInputRef.current?.files?.[0];
    if (!photoFile) {
      setError("Add a photo to submit.");
      return;
    }

    if (isSuburbNameOnlyInput(suburb)) {
      setError(DROP_FEED_SUBURB_ONLY_ERROR);
      return;
    }

    void (async () => {
      setSubmitting(true);
      try {
        const coords = await getDropFeedClientCoords();
        const formData = new FormData();
        formData.append("restaurantName", restaurantName.trim());
        formData.append("suburb", suburb.trim());
        formData.append("dishName", dish.trim());
        formData.append("cuisine", cuisineFilterToApi(cuisine) ?? cuisine);
        formData.append("price", String(priceNum));
        formData.append("latitude", String(coords.lat));
        formData.append("longitude", String(coords.lng));
        formData.append("image", photoFile);

        if (dealTimerEnabled) {
          formData.append("isHotDeal", "true");
          formData.append("hotDealStartDateTime", toIsoDateTime(startDate, startTime || "00:00"));
          formData.append("hotDealEndDateTime", toIsoDateTime(endDate, endTime || "23:59"));
          formData.append("hotDealDescription", dealDescription.trim());
        }

        await createListing(formData);
        onClose();
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Could not submit. Try again.",
        );
      } finally {
        setSubmitting(false);
      }
    })();
  };

  const ui = (
    <>
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        className={cn(
          "fixed inset-0 z-[9998] bg-neutral-950/40 transition-opacity motion-reduce:transition-none",
          "max-sm:bg-neutral-950/25 sm:bg-neutral-950/40",
        )}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "fixed z-[9999] flex flex-col overflow-hidden bg-white shadow-xl",
          /* Mobile: full screen so full form + safe areas fit (scroll inside) */
          "max-sm:inset-0 max-sm:h-[100dvh] max-sm:max-h-[100dvh] max-sm:w-full max-sm:rounded-none",
          /* Desktop: centered card, slightly lower than dead-center */
          "sm:left-1/2 sm:top-[calc(50%+0.75rem)] sm:h-auto sm:max-h-[min(92dvh,44rem)] sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:border sm:border-neutral-200/80 sm:shadow-[0_8px_40px_rgba(0,0,0,0.12)]",
        )}
      >
        <header className="shrink-0  px-4 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:pb-5 sm:pt-6">
          <div className="flex flex-col gap-5">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition hover:bg-neutral-200 hover:text-neutral-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
            <div className="min-w-0">
              <h2 id={titleId} className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-[1.65rem]">
                Drop a feed
              </h2>
              <p className="mt-1 text-sm leading-snug text-neutral-500">
                Share a cheap gem. We&apos;ll check it out and get it on the map.
              </p>
            </div>
          </div>
        </header>

        <form
          onSubmit={onSubmit}
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] max-sm:pt-0 sm:px-6 sm:pb-6",
            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          <div className="flex flex-col gap-4 py-4 sm:gap-5 sm:py-5">
            <div>
              <label htmlFor="drop-restaurant" className={labelClass}>
                Restaurant name
                <RequiredMark />
              </label>
              <input
                id="drop-restaurant"
                name="restaurant"
                type="text"
                autoComplete="organization"
                placeholder="e.g. Jack's Kebabs"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className={fieldClass}
                required
              />
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_min(7.25rem,30%)] gap-3 max-[380px]:grid-cols-1">
              <div className="min-w-0">
                <label htmlFor="drop-suburb" className={labelClass}>
                  Suburb or address
                  <RequiredMark />
                </label>
                <input
                  id="drop-suburb"
                  name="suburb"
                  type="text"
                  autoComplete="street-address"
                  placeholder="e.g. 735 Beams Rd, Carseldine QLD 4034"
                  value={suburb}
                  onChange={(e) => setSuburb(e.target.value)}
                  className={fieldClass}
                  required
                />
              </div>
              <div className="min-w-0">
                <label htmlFor="drop-price" className={labelClass}>
                  Price
                  <RequiredMark />
                </label>
                <input
                  id="drop-price"
                  name="price"
                  type="text"
                  inputMode="decimal"
                  placeholder="$8"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={fieldClass}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="drop-dish" className={labelClass}>
                Dish name
                <RequiredMark />
              </label>
              <input
                id="drop-dish"
                name="dish"
                type="text"
                autoComplete="off"
                placeholder="Pork Banh Mi"
                value={dish}
                onChange={(e) => setDish(e.target.value)}
                className={fieldClass}
                required
              />
            </div>

            <div>
              <label htmlFor="drop-cuisine" className={labelClass}>
                Cuisine
                <RequiredMark />
              </label>
              <select
                id="drop-cuisine"
                name="cuisine"
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value as Exclude<CuisineFilterId, "all">)}
                className={cn(fieldClass, "cursor-pointer appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10")}
                required
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23737373' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                }}
              >
                {CUISINE_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-orange-50/70 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-900">Hot Deal</p>
                  <p className="text-xs text-neutral-500">
                    {dealTimerEnabled ? "Set times & description below" : "Disabled"}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={dealTimerEnabled}
                  onClick={() => setDealTimerEnabled((v) => !v)}
                  className={cn(
                    "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                    dealTimerEnabled ? "bg-[#FF5722]" : "bg-neutral-300",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
                      dealTimerEnabled && "translate-x-5",
                    )}
                    aria-hidden
                  />
                  <span className="sr-only">{dealTimerEnabled ? "Disable deal timer" : "Enable deal timer"}</span>
                </button>
              </div>

              {dealTimerEnabled ? (
                <div className="mt-3 space-y-3 rounded-2xl border border-orange-200/60 bg-orange-50/40 p-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="min-w-0">
                      <label htmlFor="drop-start-date" className={labelClass}>
                        Start date
                        <RequiredMark />
                      </label>
                      <input
                        id="drop-start-date"
                        name="startDate"
                        type="date"
                        value={startDate}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={fieldClass}
                        required={dealTimerEnabled}
                      />
                    </div>
                    <div className="min-w-0">
                      <label htmlFor="drop-end-date" className={labelClass}>
                        End date
                        <RequiredMark />
                      </label>
                      <input
                        id="drop-end-date"
                        name="endDate"
                        type="date"
                        value={endDate}
                        min={startDate || new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={fieldClass}
                        required={dealTimerEnabled}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="min-w-0">
                      <label htmlFor="drop-start-time" className={labelClass}>
                        Start time
                        <RequiredMark />
                      </label>
                      <input
                        id="drop-start-time"
                        name="startTime"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className={fieldClass}
                        required={dealTimerEnabled}
                      />
                    </div>
                    <div className="min-w-0">
                      <label htmlFor="drop-end-time" className={labelClass}>
                        End time
                        <RequiredMark />
                      </label>
                      <input
                        id="drop-end-time"
                        name="endTime"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className={fieldClass}
                        required={dealTimerEnabled}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="drop-deal-description" className={labelClass}>
                      Description
                      <RequiredMark />
                    </label>
                    <textarea
                      id="drop-deal-description"
                      name="dealDescription"
                      rows={3}
                      placeholder="e.g. Lunch special before 11:30 — cash only at the counter."
                      value={dealDescription}
                      onChange={(e) => setDealDescription(e.target.value)}
                      className={cn(fieldClass, "resize-none leading-snug")}
                      required={dealTimerEnabled}
                    />
                  </div>
                  {endDate ? (
                    <div className="flex justify-center pt-1">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white">
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: ACCENT }}
                          aria-hidden
                        />
                        {countdownLabel || "Set end date & time"}
                      </span>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div>
              <label htmlFor="drop-photo" className={labelClass}>
                Photo
                <RequiredMark />
              </label>
              <input
                id="drop-photo"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                required
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setPhotoPreviewUrl((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return f ? URL.createObjectURL(f) : null;
                  });
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative flex w-full overflow-hidden rounded-2xl border-2 border-dashed border-neutral-200/90 bg-orange-100/60 text-sm text-neutral-500 transition hover:border-neutral-300 hover:bg-orange-100/90",
                  photoPreviewUrl
                    ? "h-[7.5rem] border-solid p-0"
                    : "h-[7.5rem] flex-col items-center justify-center gap-1.5 px-4 py-3",
                )}
              >
                {photoPreviewUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoPreviewUrl}
                      alt="Selected meal photo preview"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-neutral-900/55 px-3 py-2 text-center text-xs font-medium text-white">
                      Tap to change photo
                    </span>
                  </>
                ) : (
                  <>
                    <Camera className="h-8 w-8 text-neutral-400" strokeWidth={1.5} />
                    <span>Tap to add a photo</span>
                  </>
                )}
              </button>
            </div>

            {error ? (
              <p className="text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
            ) : null}

            <div className="shrink-0 border-t border-neutral-100 pt-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:border-neutral-100/90 sm:pt-5 sm:pb-0">
              <button
                type="submit"
                disabled={submitting}
                className="flex h-12 w-full items-center justify-center rounded-2xl text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(255,87,34,0.35)] transition hover:brightness-105 active:scale-[0.99] disabled:opacity-60 sm:h-11 sm:text-sm"
                style={{ backgroundColor: ACCENT }}
              >
                {submitting ? "Submitting…" : "Drop the feed"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );

  if (typeof document === "undefined") return null;
  return createPortal(ui, document.body);
}