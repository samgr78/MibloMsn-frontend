import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../shared/api/queryKeys";
import type { Post, PostPage } from "./api/posts.schemas";

/** Raw shape of a paginated list in the cache, before flattening. */
type PostListData = InfiniteData<PostPage>;

type PageMapper = (page: PostPage, index: number) => PostPage;

/**
 * Applies a change to every list that can hold this post: the feed and
 * the author's profile. One function so no view gets forgotten, which is
 * how a counter ends up right on one screen and wrong on another.
 */
function updateLists(
  queryClient: QueryClient,
  authorId: string,
  mapPage: PageMapper,
): void {
  const apply = (data: PostListData | undefined): PostListData | undefined =>
    data === undefined ? data : { ...data, pages: data.pages.map(mapPage) };

  queryClient.setQueriesData<PostListData>({ queryKey: queryKeys.feed() }, apply);
  queryClient.setQueriesData<PostListData>(
    { queryKey: queryKeys.userPosts(authorId) },
    apply,
  );
}

/**
 * Inserts a freshly created post at the head.
 *
 * The backend sorts by date descending, so the head is exactly where the
 * server would put it and cursor pagination stays consistent.
 */
export function prependPost(queryClient: QueryClient, post: Post): void {
  // Index rather than a flag: the mapper runs for several lists, and a
  // shared flag would only fill the first one.
  updateLists(queryClient, post.author.id, (page, index) =>
    index === 0 ? { ...page, items: [post, ...page.items] } : page,
  );
}

/**
 * Removes a post from every list showing it.
 *
 * The detail is invalidated rather than dropped, so reopening its URL
 * refetches and gets the 404. Left in cache it would still show for the
 * configured 30 seconds of freshness.
 */
export function removePost(
  queryClient: QueryClient,
  post: Pick<Post, "id"> & { author: Pick<Post["author"], "id"> },
): void {
  updateLists(queryClient, post.author.id, (page) => ({
    ...page,
    items: page.items.filter((item) => item.id !== post.id),
  }));

  void queryClient.invalidateQueries({ queryKey: queryKeys.post(post.id) });
}
