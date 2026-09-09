/** Single source of truth for cache keys: this is what lets one like update
 *  the feed and the post detail without a refetch. */
export const queryKeys = {
  feed: () => ["posts", "feed"] as const,
  post: (postId: string) => ["posts", "detail", postId] as const,
  user: (userId: string) => ["users", userId] as const,
  userPosts: (userId: string) => ["users", userId, "posts"] as const,
} as const;
