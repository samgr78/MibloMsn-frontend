import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toUserMessage } from "../../../shared/api/ApiError";
import { useToast } from "../../../shared/ui/Toast/useToast";
import type { LikeState, Post } from "../../posts/api/posts.schemas";
import { likePost, unlikePost } from "../api/likes.api";
import {
  restoreSnapshot,
  snapshotPostQueries,
  writeLikeState,
  type LikeSnapshot,
} from "../likes.cache";

type ToggleInput = Pick<Post, "id" | "likeCount" | "likedByMe">;

export function useToggleLike() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation<LikeState, unknown, ToggleInput, LikeSnapshot>({
    mutationFn: ({ id, likedByMe }) => (likedByMe ? unlikePost(id) : likePost(id)),

    // Immediate on screen, before the server answers.
    onMutate: async (post) => {
      // Without this, an in-flight request could land after the optimistic
      // update and overwrite it.
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["users"] });

      const snapshot = snapshotPostQueries(queryClient);

      writeLikeState(queryClient, {
        postId: post.id,
        likedByMe: !post.likedByMe,
        likeCount: post.likeCount + (post.likedByMe ? -1 : 1),
      });

      return snapshot;
    },

    // Roll back and tell the user if the API fails.
    onError: (error, _post, snapshot) => {
      if (snapshot !== undefined) {
        restoreSnapshot(queryClient, snapshot);
      }
      showToast({
        variant: "error",
        title: "Action impossible",
        message: toUserMessage(error),
      });
    },

    // The server is authoritative: its counter replaces our estimate.
    onSuccess: (state) => {
      writeLikeState(queryClient, state);
    },
  });
}
