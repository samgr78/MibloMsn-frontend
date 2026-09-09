import { toUserMessage } from "../api/ApiError";

/** The four UI states as a discriminated union: loading *and* error at the
 *  same time is not representable. */
export type ScreenState<T> =
  | { status: "loading" }
  | { status: "error"; message: string; retry?: (() => void) | undefined }
  | { status: "empty" }
  | { status: "success"; data: T };

/** Minimal shape shared by `useQuery` and `useInfiniteQuery`. */
export type QueryLike<T> = {
  isPending: boolean;
  isError: boolean;
  error: unknown;
  data: T | undefined;
  refetch: () => unknown;
};

/** Adapter: TanStack Query owns the cache, this hands the render a union. */
export function toScreenState<T>(
  query: QueryLike<T>,
  isEmpty?: (data: T) => boolean,
): ScreenState<T> {
  if (query.isPending) {
    return { status: "loading" };
  }

  if (query.isError) {
    return {
      status: "error",
      message: toUserMessage(query.error),
      retry: () => {
        void query.refetch();
      },
    };
  }

  if (query.data === undefined) {
    return { status: "loading" };
  }

  if (isEmpty?.(query.data) === true) {
    return { status: "empty" };
  }

  return { status: "success", data: query.data };
}
