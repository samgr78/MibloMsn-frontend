import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/api/queryKeys";
import type { Comment, PostDetail } from "../../posts/api/posts.schemas";
import { addComment } from "../api/comments.api";

export function useAddComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation<Comment, unknown, string>({
    mutationFn: (content) => addComment(postId, content),

    onSuccess: (comment) => {
      // Written into the cache, so the list updates without a refetch.
      queryClient.setQueryData<PostDetail>(queryKeys.post(postId), (post) =>
        post === undefined
          ? post
          : {
              ...post,
              comments: [...post.comments, comment],
              commentCount: post.commentCount + 1,
            },
      );

      // The counter shown in the feed has to follow.
      void queryClient.invalidateQueries({ queryKey: queryKeys.feed() });
    },
  });
}
