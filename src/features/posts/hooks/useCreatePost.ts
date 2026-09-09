import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "../api/posts.api";
import type { CreatePostFormInput, Post } from "../api/posts.schemas";
import { prependPost } from "../posts.cache";

/**
 * No optimistic update here, unlike the like: until the server answers the
 * post has no id and no date, and a failure would leave a ghost card in
 * the feed.
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation<Post, unknown, CreatePostFormInput>({
    mutationFn: (input) => createPost(input),
    onSuccess: (post) => {
      prependPost(queryClient, post);
    },
  });
}
