/** Default radius hint for “near me” copy (km). */
export const NEARBY_RADIUS_KM = 2;

/**
 * Radius around the Brisbane listings hub (or user GPS when in Brisbane).
 * Covers metro including West End (~27.41°S, 153.06°E) from CBD centre.
 */
export const NEARBY_LISTINGS_RADIUS_KM = 80;

/** How long to show the “turn on location” overlay when GPS is unavailable (ms). */
export const LOCATION_PROMPT_AUTO_DISMISS_MS = 4_000;

/** GPS is only used to centre the map if the user is within this range of Brisbane (km). */
export const NEAR_BRISBANE_MAX_KM = 220;

/** When a place geocodes, include pins within this radius (km) in search results (union with text). */
export const SEARCH_LOCATION_RADIUS_KM = 12;

export const TOP_RATED_MIN_NET_SCORE = 50;
