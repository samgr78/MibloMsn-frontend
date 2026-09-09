import type { Session } from "../features/auth/api/auth.schemas";
import type { Post } from "../features/posts/api/posts.schemas";

let sequence = 0;

/** Post valide au regard de PostSchema, personnalisable champ par champ. */
export function makePost(overrides: Partial<Post> = {}): Post {
  sequence += 1;

  return {
    id: `post-${sequence}`,
    content: `Contenu du post ${sequence}`,
    imageUrl: null,
    createdAt: new Date(Date.now() - sequence * 60_000).toISOString(),
    author: { id: `user-${sequence}`, username: `auteur${sequence}` },
    likeCount: 0,
    commentCount: 0,
    likedByMe: false,
    ...overrides,
  };
}

export function makePosts(count: number, overrides: Partial<Post> = {}): Post[] {
  return Array.from({ length: count }, () => makePost(overrides));
}

/** First item, narrowed explicitly: `items[0]` is `T | undefined` here and
 *  the project bans `!`, tests included. */
export function firstOf<T>(items: ReadonlyArray<T>): T {
  const [first] = items;

  if (first === undefined) {
    throw new Error("La liste attendue est vide");
  }

  return first;
}

/** A session valid against SessionSchema, for signed-in screens. */
export function makeSession(
  user: { id: string; username: string } = { id: "user-connecte", username: "moi" },
): Session {
  return { token: "jeton-de-test", user };
}
