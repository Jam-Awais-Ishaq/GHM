import type { LatLng } from "@/features/restaurants/types/restaurant";
import { haversineKm } from "@/features/restaurants/utils/distance";

/** Min gap (m) before drawing a dotted lead-in to the main route. */
const CONNECTOR_MIN_METERS = 6;

export type RouteConnectors = {
  mainPath: LatLng[];
  originConnector: LatLng[] | null;
  destinationConnector: LatLng[] | null;
};

function projectOnSegment(p: LatLng, a: LatLng, b: LatLng): LatLng {
  const dx = b.lng - a.lng;
  const dy = b.lat - a.lat;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return a;
  let t = ((p.lng - a.lng) * dx + (p.lat - a.lat) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return { lat: a.lat + t * dy, lng: a.lng + t * dx };
}

/** Closest point on the polyline (segment-accurate). */
export function nearestPointOnPolyline(
  path: LatLng[],
  target: LatLng,
): LatLng {
  if (!path.length) return target;
  if (path.length === 1) return path[0];

  let best = path[0];
  let bestDist = haversineKm(best, target);

  for (let i = 0; i < path.length - 1; i++) {
    const proj = projectOnSegment(target, path[i], path[i + 1]);
    const d = haversineKm(proj, target);
    if (d < bestDist) {
      bestDist = d;
      best = proj;
    }
  }

  return best;
}

function leadConnector(point: LatLng, path: LatLng[]): LatLng[] | null {
  const snap = nearestPointOnPolyline(path, point);
  const gapM = haversineKm(point, snap) * 1000;
  if (gapM < CONNECTOR_MIN_METERS) return null;
  return [point, snap];
}

export function buildRouteWithConnectors(
  path: LatLng[],
  origin?: LatLng | null,
  destination?: LatLng | null,
): RouteConnectors {
  if (!path.length) {
    return { mainPath: [], originConnector: null, destinationConnector: null };
  }

  return {
    mainPath: path,
    originConnector: origin ? leadConnector(origin, path) : null,
    destinationConnector: destination ? leadConnector(destination, path) : null,
  };
}
