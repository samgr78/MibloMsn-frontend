import { toUserMessage } from "../../../shared/api/ApiError";
import { useZodForm } from "../../../shared/forms/useZodForm";
import { Button } from "../../../shared/ui/Button/Button";
import { Field } from "../../../shared/ui/Field/Field";
import { useToast } from "../../../shared/ui/Toast/useToast";
import { CreatePostSchema, POST_CONTENT_MAX } from "../../posts/api/posts.schemas";
import { useAddComment } from "../hooks/useAddComment";

/** A comment follows the same content rules as a post. */
const CommentSchema = CreatePostSchema;

export function CommentForm({ postId }: { postId: string }) {
  const { showToast } = useToast();
  const addComment = useAddComment(postId);

  const form = useZodForm({
    schema: CommentSchema,
    initialValues: { content: "" },
    onSubmit: async ({ content }) => {
      await addComment.mutateAsync(content);
      form.reset();
    },
    onError: (error) => {
      showToast({
        variant: "error",
        title: "Commentaire non publié",
        message: toUserMessage(error),
      });
      return {};
    },
  });

  return (
    <form onSubmit={form.handleSubmit} noValidate>
      <Field
        label="Votre commentaire"
        kind="textarea"
        name="content"
        rows={2}
        required
        maxLength={POST_CONTENT_MAX}
        showCount
        placeholder="Écrivez quelque chose…"
        value={form.values.content}
        error={form.errors["content"]}
        disabled={form.isSubmitting}
        onValueChange={(value) => form.setField("content", value)}
      />

      <Button type="submit" variant="primary" disabled={form.isSubmitting}>
        {form.isSubmitting ? "Envoi…" : "Commenter"}
      </Button>
    </form>
  );
}
