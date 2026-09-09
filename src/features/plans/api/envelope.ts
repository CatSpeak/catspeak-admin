/**
 * The main product API wraps public (non-admin) responses in an ApiResponse
 * envelope ({ success, statusCode, data, ... }). Admin plan endpoints return
 * plain bodies. These helpers unwrap the envelope when present.
 */

export interface ApiResponseEnvelope<T> {
  data?: T;
  success?: boolean;
  [key: string]: unknown;
}

export function unwrapData<T>(response: unknown, fallback: T): T {
  if (Array.isArray(response)) {
    return response as T;
  }
  if (response && typeof response === "object" && "data" in response) {
    const envelope = response as ApiResponseEnvelope<T>;
    if (envelope.data !== undefined) {
      return envelope.data;
    }
    return fallback;
  }
  return (response as T) ?? fallback;
}