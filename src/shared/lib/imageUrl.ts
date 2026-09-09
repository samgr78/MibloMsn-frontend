import { env } from "./env";

/**
 * Turns an API image path into an absolute URL.
 *
 * Only relative paths are accepted: an absolute value coming from the
 * database (`http://…`, `javascript:…`) has no business in a `src`.
 */
export function toImageUrl(imageUrl: string | null): string | null {
  if (imageUrl === null) return null;
  if (!imageUrl.startsWith("/") || imageUrl.startsWith("//")) return null;
  return `${env.VITE_API_BASE_URL}${imageUrl}`;
}
