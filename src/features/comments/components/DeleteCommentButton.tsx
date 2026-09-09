import { ConfirmDeleteButton } from "../../../shared/ui/ConfirmDeleteButton/ConfirmDeleteButton";
import { useAuth } from "../../auth/hooks/useAuth";
import type { Comment } from "../../posts/api/posts.schemas";
import { useDeleteComment } from "../hooks/useDeleteComment";

type DeleteCommentButtonProps = {
  postId: string;
  comment: Comment;
};

/** Deletes your own comment. The real refusal comes from the API. */
export function DeleteCommentButton({ postId, comment }: DeleteCommentButtonProps) {
  const { session } = useAuth();
  const remove = useDeleteComment(postId);

  return (
    <ConfirmDeleteButton
      canDelete={session !== null && session.user.id === comment.author.id}
      label="Supprimer ce commentaire"
      title="Supprimer ce commentaire ?"
      confirmLabel="Supprimer définitivement"
      busy={remove.isPending}
      onConfirm={() => remove.mutateAsync(comment.id)}
    >
      Cette action est définitive.
    </ConfirmDeleteButton>
  );
}
