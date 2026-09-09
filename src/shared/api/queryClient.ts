import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./ApiError";

/** Retrying only helps a transient server failure: a 404 or a malformed
 *  response fails the same way on the third try. */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (ApiError.is(error)) {
    if (error.code === "invalid_response") return false;
    if (error.status >= 400 && error.status < 500) return false;
  }
  return failureCount < 2;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
      },
      mutations: { retry: false },
    },
  });
}
