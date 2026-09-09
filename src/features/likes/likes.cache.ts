import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type {
  LikeState,
  Post,
  PostDetail,
  PostPage,
} from "../posts/api/posts.schemas";

/** The paginated lists: the feed and a profile's posts. */
type PostListData = InfiniteData<PostPage>;

function applyToPost(post: Post, state: LikeState): Post {
  return post.id === state.postId
    ? { ...post, likeCount: state.likeCount, likedByMe: state.likedByMe }
    : post;
}

function applyToList(data: PostListData | undefined, state: LikeState): PostListData | undefined {
  if (data === undefined) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((post) => applyToPost(post, state)),
    })),
  };
}

// Typed on `PostDetail`, not a generic: `applyToPost` returns a `Post`,
// which drops the comments.
function applyToDetail(
  data: PostDetail | undefined,
  state: LikeState,
): PostDetail | undefined {
  if (data === undefined || data.id !== state.postId) {
    return data;
  }

  return { ...data, likeCount: state.likeCount, likedByMe: state.likedByMe };
}

/**
 * Writes the new like state into every view showing this post: the feed,
 * the detail and a profile's posts. This is what makes liking from any
 * screen look the same everywhere, without a refetch.
 */
export function writeLikeState(queryClient: QueryClient, state: LikeState): void {
  queryClient.setQueriesData<PostListData>({ queryKey: ["posts", "feed"] }, (data) =>
    applyToList(data, state),
  );

  queryClient.setQueriesData<PostDetail>({ queryKey: ["posts", "detail"] }, (data) =>
    applyToDetail(data, state),
  );

  queryClient.setQueriesData<PostListData>(
    { queryKey: ["users"], predicate: (query) => query.queryKey[2] === "posts" },
    (data) => applyToList(data, state),
  );
}

/** Snapshot of every affected view, so the change can be rolled back. */
export type LikeSnapshot = Array<[readonly unknown[], unknown]>;

export function snapshotPostQueries(queryClient: QueryClient): LikeSnapshot {
  return [
    ...queryClient.getQueriesData({ queryKey: ["posts"] }),
    ...queryClient.getQueriesData({ queryKey: ["users"] }),
  ];
}

export function restoreSnapshot(queryClient: QueryClient, snapshot: LikeSnapshot): void {
  for (const [key, data] of snapshot) {
    queryClient.setQueryData(key, data);
  }
}
