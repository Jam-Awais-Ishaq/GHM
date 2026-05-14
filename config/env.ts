export const env = {
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  /** Required for Advanced Markers (vector map). Create in Google Cloud Console → Map Management. */
  googleMapId: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID ?? "",
} as const;
