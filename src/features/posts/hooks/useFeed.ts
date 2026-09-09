import { useInfiniteQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/api/queryKeys";
import { fetchFeed, fetchUserPosts } from "../api/posts.api";
import type { Post, PostPage } from "../api/posts.schemas";

/**
 * `select` flattens the pages, so components handle `Post[]` rather than
 * the pagination structure. `signal` comes from TanStack Query: a stale
 * request is cancelled and can no longer overwrite newer state.
 */
const flattenPages = (data: { pages: PostPage[] }): Post[] =>
  data.pages.flatMap((page) => page.items);

// Annotated, not asserted: `initialPageParam` takes a cursor or null.
const FIRST_PAGE: string | null = null;

export function useFeed() {
  return useInfiniteQuery({
    queryKey: queryKeys.feed(),
    queryFn: ({ pageParam, signal }) =>
      fetchFeed({ cursor: pageParam ?? undefined, signal }),
    initialPageParam: FIRST_PAGE,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: flattenPages,
  });
}

export function useUserPosts(userId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.userPosts(userId),
    queryFn: ({ pageParam, signal }) =>
      fetchUserPosts(userId, { cursor: pageParam ?? undefined, signal }),
    initialPageParam: FIRST_PAGE,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: flattenPages,
  });
}
