import { useCallback, type ReactNode } from "react";
import { useIntersection } from "../../../shared/hooks/useIntersection";
import { toScreenState, type QueryLike } from "../../../shared/screen-state/screenState";
import { ScreenStateView } from "../../../shared/screen-state/ScreenStateView";
import { Button } from "../../../shared/ui/Button/Button";
import { Spinner } from "../../../shared/ui/Feedback/Spinner";
import type { Post } from "../api/posts.schemas";
import { PostList } from "./PostList";
import type { PostCardVariant } from "./PostCard";
import styles from "./PostStream.module.css";

/** What a posts `useInfiniteQuery` exposes, described structurally: the
 *  component takes the feed or a profile without knowing either. */
export type PostStreamQuery = QueryLike<Post[]> & {
  fetchNextPage: () => unknown;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
};

type PostStreamProps = {
  query: PostStreamQuery;
  /** Accessible name of the list, and how tests find it. */
  label: string;
  empty: ReactNode;
  variant?: PostCardVariant;
  renderActions?: (post: Post) => ReactNode;
};

/**
 * A paginated post list: the four UI states, infinite scroll and its
 * keyboard fallback, in one place.
 *
 * The feed and a profile show the same thing from two sources, so they
 * share this instead of keeping two copies that would drift apart.
 */
export function PostStream({
  query,
  label,
  empty,
  variant = "feed",
  renderActions,
}: PostStreamProps) {
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const sentinelRef = useIntersection<HTMLDivElement>(loadMore, hasNextPage);

  // `isPending` is only true on the first load, so rendered pages stay
  // mounted when the next one arrives and the list does not flicker.
  const state = toScreenState(query, (posts) => posts.length === 0);

  return (
    <ScreenStateView state={state} empty={empty}>
      {(posts) => (
        <>
          <PostList
            posts={posts}
            label={label}
            variant={variant}
            {...(renderActions === undefined ? {} : { renderActions })}
          />

          <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />

          {isFetchingNextPage ? (
            <div className={styles.more}>
              <Spinner label="Chargement des posts suivants" />
            </div>
          ) : hasNextPage ? (
            <div className={styles.more}>
              <Button variant="secondary" onClick={loadMore}>
                Charger plus de posts
              </Button>
            </div>
          ) : (
            <p className={styles.end}>Vous avez tout vu.</p>
          )}
        </>
      )}
    </ScreenStateView>
  );
}
