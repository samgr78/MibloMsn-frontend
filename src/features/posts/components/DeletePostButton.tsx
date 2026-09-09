import { ConfirmDeleteButton } from "../../../shared/ui/ConfirmDeleteButton/ConfirmDeleteButton";
import { useAuth } from "../../auth/hooks/useAuth";
import type { Post } from "../api/posts.schemas";
import { useDeletePost } from "../hooks/useDeletePost";

type DeletePostButtonProps = {
  post: Post;
  /** Called once the server has confirmed the deletion. */
  onDeleted?: () => void;
};

/**
 * Deletes your own post.
 *
 * The button is absent on someone else's post, but that is only comfort:
 * the backend is what refuses a forged request, with a 403.
 */
export function DeletePostButton({ post, onDeleted }: DeletePostButtonProps) {
  const { session } = useAuth();
  const remove = useDeletePost(onDeleted);

  return (
    <ConfirmDeleteButton
      canDelete={session !== null && session.user.id === post.author.id}
      label="Supprimer ce post"
      title="Supprimer ce post ?"
      confirmLabel="Supprimer définitivement"
      busy={remove.isPending}
      onConfirm={() => remove.mutateAsync(post)}
    >
      Cette action est définitive : le post et ses commentaires seront perdus.
    </ConfirmDeleteButton>
  );
}
