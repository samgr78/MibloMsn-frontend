import { cx } from "../../../shared/lib/cx";
import type { Post } from "../../posts/api/posts.schemas";
import { useToggleLike } from "../hooks/useToggleLike";
import styles from "./LikeButton.module.css";

export function LikeButton({ post }: { post: Post }) {
  const toggle = useToggleLike();

  return (
    <button
      type="button"
      className={cx(styles.button, post.likedByMe && styles.liked)}
      // `aria-pressed` carries the state, so no label or CSS class is needed
      // to find the button or read it.
      aria-pressed={post.likedByMe}
      aria-label={post.likedByMe ? "Retirer mon like" : "Liker ce post"}
      disabled={toggle.isPending}
      onClick={() => {
        toggle.mutate(post);
      }}
    >
      <span className={styles.icon} aria-hidden="true">
        {post.likedByMe ? "♥" : "♡"}
      </span>
      <span className={styles.count}>{post.likeCount}</span>
    </button>
  );
}
