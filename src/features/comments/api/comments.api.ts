import { z } from "zod";
import { fetchJson } from "../../../shared/api/http";
import { CommentSchema, type Comment } from "../../posts/api/posts.schemas";

export function addComment(postId: string, content: string): Promise<Comment> {
  return fetchJson(`/posts/${postId}/comments`, {
    method: "POST",
    body: { content },
    schema: CommentSchema,
  });
}

/**
 * The backend answers 204 with no body, so the expected schema really is
 * `undefined`: no response enters without validation, no exception.
 * Ownership is checked by the server, which answers 403.
 */
export function deleteComment(commentId: string, signal?: AbortSignal): Promise<undefined> {
  return fetchJson(`/comments/${commentId}`, {
    method: "DELETE",
    schema: z.undefined(),
    signal,
  });
}
