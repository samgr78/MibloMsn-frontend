import { fetchJson } from "../../../shared/api/http";
import { PostPageSchema, type PostPage } from "./posts.schemas";

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
