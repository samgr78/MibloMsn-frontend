import { useCallback } from "react";
import { toScreenState } from "../../../shared/screen-state/screenState";
import { ScreenStateView } from "../../../shared/screen-state/ScreenStateView";
import { useIntersection } from "../../../shared/hooks/useIntersection";
import { Button } from "../../../shared/ui/Button/Button";
import { EmptyState } from "../../../shared/ui/Feedback/EmptyState";
import { Spinner } from "../../../shared/ui/Feedback/Spinner";
import { LikeButton } from "../../likes/components/LikeButton";
import { CreatePostForm } from "../components/CreatePostForm";
import { PostList } from "../components/PostList";
import { useFeed } from "../hooks/useFeed";
import styles from "./FeedPage.module.css";

export function FeedPage() {
  const feed = useFeed();
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = feed;

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const sentinelRef = useIntersection<HTMLDivElement>(loadMore, hasNextPage);

  // `isPending` is only true on the first load, so rendered pages stay
  // mounted when the next one arrives and the list does not flicker.
  const state = toScreenState(feed, (posts) => posts.length === 0);

  return (
    <div className={styles.page}>
      <h1>Fil d'actualité</h1>

      <CreatePostForm />

      <ScreenStateView
        state={state}
        empty={
          <EmptyState
            title="Aucun post pour le moment"
            message="Soyez le premier à publier quelque chose."
          />
        }
      >
        {(posts) => (
          <>
            <PostList
              posts={posts}
              label="Fil d'actualité"
              renderActions={(post) => <LikeButton post={post} />}
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
    </div>
  );
}
