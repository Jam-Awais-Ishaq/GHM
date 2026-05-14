import { NextRequest, NextResponse } from "next/server";

import { BRISBANE_BOUNDS } from "@/lib/maps/googleMaps";

const NOMINATIM = "https://nominatim.openstreetmap.org/search";

function inBrisbane(lat: number, lng: number): boolean {
  return (
    lat >= BRISBANE_BOUNDS.south &&
    lat <= BRISBANE_BOUNDS.north &&
    lng >= BRISBANE_BOUNDS.west &&
    lng <= BRISBANE_BOUNDS.east
  );
}

/** Proxy geocode so we can send a proper User-Agent (browser fetch cannot). */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json(null);
  }

  const viewbox = `${BRISBANE_BOUNDS.west},${BRISBANE_BOUNDS.south},${BRISBANE_BOUNDS.east},${BRISBANE_BOUNDS.north}`;

  const url = new URL(NOMINATIM);
  url.searchParams.set("format", "json");
  url.searchParams.set("q", `${q}, Queensland, Australia`);
  url.searchParams.set("limit", "6");
  url.searchParams.set("countrycodes", "au");
  url.searchParams.set("viewbox", viewbox);
  url.searchParams.set("bounded", "0");

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "GuessHowMuch/1.0 (local dev; https://example.com/contact)",
      },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(null, { status: 502 });
  }

  if (!res.ok) {
    return NextResponse.json(null, { status: 502 });
  }

  const data = (await res.json()) as { lat: string; lon: string; display_name: string }[];
  if (!Array.isArray(data)) {
    return NextResponse.json(null);
  }

  for (const row of data) {
    const lat = Number.parseFloat(row.lat);
    const lng = Number.parseFloat(row.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    if (inBrisbane(lat, lng)) {
      return NextResponse.json({
        lat,
        lng,
        label: row.display_name,
      });
    }
  }

  return NextResponse.json(null);
}
