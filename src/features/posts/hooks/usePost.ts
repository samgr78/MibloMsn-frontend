import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/api/queryKeys";
import { fetchPost } from "../api/posts.api";

export function usePost(postId: string) {
  return useQuery({
    queryKey: queryKeys.post(postId),
    // `signal` comes from TanStack Query: navigating to another post
    // cancels this one, so stale data cannot land on the screen.
    queryFn: ({ signal }) => fetchPost(postId, signal),
  });
}
