import { z } from "zod";
import { fetchJson } from "../../../shared/api/http";
import {
  PostDetailSchema,
  PostPageSchema,
  PostSchema,
  type CreatePostFormInput,
  type Post,
  type PostDetail,
  type PostPage,
} from "./posts.schemas";

export const PAGE_SIZE = 20;

type PageParams = {
  cursor?: string | undefined;
  signal?: AbortSignal | undefined;
};

function pageQuery(cursor: string | undefined): string {
  const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
  if (cursor !== undefined) {
    params.set("cursor", cursor);
  }
  return params.toString();
}

export function fetchFeed({ cursor, signal }: PageParams): Promise<PostPage> {
  return fetchJson(`/posts?${pageQuery(cursor)}`, { schema: PostPageSchema, signal });
}

export function fetchUserPosts(
  userId: string,
  { cursor, signal }: PageParams,
): Promise<PostPage> {
  return fetchJson(`/users/${userId}/posts?${pageQuery(cursor)}`, {
    schema: PostPageSchema,
    signal,
  });
}

export function fetchPost(postId: string, signal?: AbortSignal): Promise<PostDetail> {
  return fetchJson(`/posts/${postId}`, { schema: PostDetailSchema, signal });
}

/**
 * Publishes a post.
 *
 * The backend requires `multipart/form-data` as soon as an image can come
 * along. The response has the same shape as a feed post, so it can be
 * inserted there directly.
 */
export function createPost(
  { content, image }: CreatePostFormInput,
  signal?: AbortSignal,
): Promise<Post> {
  const body = new FormData();
  body.set("content", content);

  if (image !== null) {
    body.set("image", image);
  }

  return fetchJson("/posts", { method: "POST", body, schema: PostSchema, signal });
}

/**
 * Deletes a post.
 *
 * The backend answers 204 with no body, so the expected schema really is
 * `undefined`: no response enters without validation, no exception.
 *
 * Ownership is checked by the server, which answers 403. Hiding the
 * button is interface comfort, never protection.
 */
export function deletePost(postId: string, signal?: AbortSignal): Promise<undefined> {
  return fetchJson(`/posts/${postId}`, {
    method: "DELETE",
    schema: z.undefined(),
    signal,
  });
}
