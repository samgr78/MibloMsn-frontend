import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cx } from "../../../shared/lib/cx";
import { formatAbsoluteDate, formatRelativeDate } from "../../../shared/lib/formatDate";
import { toImageUrl } from "../../../shared/lib/imageUrl";
import { Avatar } from "../../../shared/ui/Avatar/Avatar";
import type { Post } from "../api/posts.schemas";
import styles from "./PostCard.module.css";

export type PostCardVariant = "feed" | "detail" | "profile";

type PostCardProps = {
  post: Post;
  variant?: PostCardVariant;
  /** Like, delete… injected by the screen showing the card. */
  actions?: ReactNode;
};

/** One post card for all three contexts. A new context is a new variant,
 *  not a new component. */
export function PostCard({ post, variant = "feed", actions }: PostCardProps) {
  const createdAt = new Date(post.createdAt);
  const imageUrl = toImageUrl(post.imageUrl);

  return (
    <article className={cx(styles.card, styles[variant])}>
      <header className={styles.header}>
        <Avatar username={post.author.username} size={variant === "detail" ? "md" : "sm"} />
        <div className={styles.identity}>
          <Link className={styles.author} to={`/users/${post.author.id}`}>
            {post.author.username}
          </Link>
          <time className={styles.date} dateTime={post.createdAt} title={formatAbsoluteDate(createdAt)}>
            {formatRelativeDate(createdAt)}
          </time>
        </div>
      </header>

      {variant === "feed" ? (
        <Link to={`/posts/${post.id}`} style={{ color: "inherit", textDecoration: "none" }}>
          <p className={styles.content}>{post.content}</p>
        </Link>
      ) : (
        <p className={styles.content}>{post.content}</p>
      )}

      {imageUrl !== null ? (
        <img
          className={styles.image}
          src={imageUrl}
          alt={`Image publiée par ${post.author.username}`}
          loading="lazy"
        />
      ) : null}

      <footer className={styles.footer}>
        {actions}
        <span className={styles.spacer} />
        {variant === "feed" ? (
          <Link to={`/posts/${post.id}`}>
            {post.commentCount === 0
              ? "Commenter"
              : `${post.commentCount} commentaire${post.commentCount > 1 ? "s" : ""}`}
          </Link>
        ) : null}
      </footer>
    </article>
  );
}
