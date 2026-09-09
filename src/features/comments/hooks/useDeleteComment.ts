import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toUserMessage } from "../../../shared/api/ApiError";
import { queryKeys } from "../../../shared/api/queryKeys";
import { useToast } from "../../../shared/ui/Toast/useToast";
import type { PostDetail } from "../../posts/api/posts.schemas";
import { deleteComment } from "../api/comments.api";

/** As for a post: no optimistic delete. The action is irreversible and the
 *  server can refuse it with a 403. */
export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation<undefined, unknown, string>({
    mutationFn: (commentId) => deleteComment(commentId),

    onSuccess: (_data, commentId) => {
      queryClient.setQueryData<PostDetail>(queryKeys.post(postId), (post) =>
        post === undefined
          ? post
          : {
              ...post,
              comments: post.comments.filter((comment) => comment.id !== commentId),
              // Guarded: a counter already at zero must not go negative.
              commentCount: Math.max(0, post.commentCount - 1),
            },
      );

      // The counter shown in the feed has to follow.
      void queryClient.invalidateQueries({ queryKey: queryKeys.feed() });
    },

    onError: (error) => {
      showToast({
        variant: "error",
        title: "Suppression impossible",
        message: toUserMessage(error),
      });
    },
  });
}
