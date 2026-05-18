import { env } from "@/config/env";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiRequestOptions = {
  method?: string;
  body?: BodyInit | null;
  headers?: HeadersInit;
  credentials?: RequestCredentials;
};

/** Shared fetch wrapper for the Express backend. */
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const url = `${env.apiBaseUrl}${path}`;
  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers: options.headers,
    body: options.body,
    // Nearby/listings are public; use credentials: "include" only for auth routes.
    credentials: options.credentials ?? "omit",
  });

  const data: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data);
  }

  return data as T;
}