import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toUserMessage } from "../../../shared/api/ApiError";
import { useToast } from "../../../shared/ui/Toast/useToast";
import { deletePost } from "../api/posts.api";
import type { Post } from "../api/posts.schemas";
import { removePost } from "../posts.cache";

type DeletablePost = Pick<Post, "id"> & { author: Pick<Post["author"], "id"> };

/**
 * No optimistic delete, unlike the like: the action is irreversible and
 * the server can refuse it. Removing the card first would show a success
 * that never happened, then bring it back.
 */
export function useDeletePost(onDeleted?: () => void) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation<undefined, unknown, DeletablePost>({
    mutationFn: (post) => deletePost(post.id),

    onSuccess: (_data, post) => {
      // Tell the screen before touching the cache: the detail page must
      // leave the post's URL before it vanishes from it.
      onDeleted?.();
      removePost(queryClient, post);
      showToast({ variant: "success", title: "Post supprimé" });
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
