import { fetchJson } from "../../../shared/api/http";
import { LikeStateSchema, type LikeState } from "../../posts/api/posts.schemas";

export function likePost(postId: string): Promise<LikeState> {
  return fetchJson(`/posts/${postId}/like`, { method: "POST", schema: LikeStateSchema });
}

export function unlikePost(postId: string): Promise<LikeState> {
  return fetchJson(`/posts/${postId}/like`, { method: "DELETE", schema: LikeStateSchema });
}
