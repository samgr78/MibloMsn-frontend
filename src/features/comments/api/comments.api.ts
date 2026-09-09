import { fetchJson } from "../../../shared/api/http";
import { CommentSchema, type Comment } from "../../posts/api/posts.schemas";

export function addComment(postId: string, content: string): Promise<Comment> {
  return fetchJson(`/posts/${postId}/comments`, {
    method: "POST",
    body: { content },
    schema: CommentSchema,
  });
}
