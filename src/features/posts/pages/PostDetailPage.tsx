import { Link, useParams } from "react-router-dom";
import { ApiError } from "../../../shared/api/ApiError";
import { toScreenState } from "../../../shared/screen-state/screenState";
import { ScreenStateView } from "../../../shared/screen-state/ScreenStateView";
import { EmptyState } from "../../../shared/ui/Feedback/EmptyState";
import { Window } from "../../../shared/ui/Window/Window";
import { CommentForm } from "../../comments/components/CommentForm";
import { CommentList } from "../../comments/components/CommentList";
import { LikeButton } from "../../likes/components/LikeButton";
import { PostCard } from "../components/PostCard";
import { usePost } from "../hooks/usePost";
import styles from "./PostDetailPage.module.css";

function NotFound() {
  return (
    <EmptyState
      variant="not-found"
      title="Ce post n'existe plus"
      message="Il a peut-être été supprimé par son auteur."
      action={<Link to="/feed">Retourner au fil d'actualité</Link>}
    />
  );
}

export function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const post = usePost(postId ?? "");
  const state = toScreenState(post);

  if (postId === undefined) {
    return <NotFound />;
  }

  // A deleted post is an absence, not a failure: no Retry button.
  if (ApiError.is(post.error) && post.error.status === 404) {
    return <NotFound />;
  }

  return (
    <div className={styles.page}>
      <p className={styles.back}>
        <Link to="/feed">← Retour au fil</Link>
      </p>

      <ScreenStateView state={state}>
        {(detail) => (
          <>
            <PostCard
              post={detail}
              variant="detail"
              actions={<LikeButton post={detail} />}
            />

            <Window
              variant="panel"
              title={
                detail.commentCount === 0
                  ? "Commentaires"
                  : `Commentaires (${detail.commentCount})`
              }
              icon="💬"
            >
              <div className={styles.commentsBlock}>
                <CommentForm postId={detail.id} />
                <CommentList comments={detail.comments} />
              </div>
            </Window>
          </>
        )}
      </ScreenStateView>
    </div>
  );
}
