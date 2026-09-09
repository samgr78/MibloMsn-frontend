import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { formatAbsoluteDate, formatRelativeDate } from "../../../shared/lib/formatDate";
import { Avatar } from "../../../shared/ui/Avatar/Avatar";
import { EmptyState } from "../../../shared/ui/Feedback/EmptyState";
import { List } from "../../../shared/ui/List/List";
import type { Comment } from "../../posts/api/posts.schemas";
import styles from "./CommentList.module.css";

type CommentListProps = {
  comments: ReadonlyArray<Comment>;
  renderActions?: (comment: Comment) => ReactNode;
};

export function CommentList({ comments, renderActions }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <EmptyState
        title="Aucun commentaire"
        message="Soyez le premier à réagir à ce post."
      />
    );
  }

  return (
    <List
      items={comments}
      keyOf={(comment) => comment.id}
      gap="none"
      divided
      label="Commentaires"
      renderItem={(comment) => {
        const createdAt = new Date(comment.createdAt);

        return (
          <article className={styles.comment}>
            <Avatar username={comment.author.username} size="sm" />

            <div className={styles.body}>
              <div className={styles.head}>
                <Link className={styles.author} to={`/users/${comment.author.id}`}>
                  {comment.author.username}
                </Link>
                <time
                  className={styles.date}
                  dateTime={comment.createdAt}
                  title={formatAbsoluteDate(createdAt)}
                >
                  {formatRelativeDate(createdAt)}
                </time>
              </div>
              <p className={styles.text}>{comment.content}</p>
            </div>

            <div className={styles.actions}>{renderActions?.(comment)}</div>
          </article>
        );
      }}
    />
  );
}
