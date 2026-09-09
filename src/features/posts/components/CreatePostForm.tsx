import { useEffect, useRef, useState } from "react";
import { toUserMessage } from "../../../shared/api/ApiError";
import { apiErrorToFieldErrors } from "../../../shared/forms/fieldErrors";
import { useZodForm } from "../../../shared/forms/useZodForm";
import { Button } from "../../../shared/ui/Button/Button";
import { Field } from "../../../shared/ui/Field/Field";
import { ImagePreview } from "../../../shared/ui/ImagePreview/ImagePreview";
import { Window } from "../../../shared/ui/Window/Window";
import { useToast } from "../../../shared/ui/Toast/useToast";
import {
  CreatePostFormSchema,
  POST_CONTENT_MAX,
  POST_IMAGE_ACCEPT,
} from "../api/posts.schemas";
import { useCreatePost } from "../hooks/useCreatePost";
import styles from "./CreatePostForm.module.css";

const INITIAL_VALUES = { content: "", image: null };

export function CreatePostForm() {
  const { showToast } = useToast();
  const createPost = useCreatePost();

  // A file input is uncontrolled: its value ignores `reset()`, and
  // remounting is the only reliable way to clear the displayed name.
  const [fileKey, setFileKey] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Also kept in a ref, so unmount can revoke it without the effect
  // depending on its value.
  const previewUrlRef = useRef<string | null>(null);

  function replacePreview(file: File | null): void {
    if (previewUrlRef.current !== null) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    // Created here, in the handler that receives the file: not during
    // render, and not in an effect that would trigger another one.
    const next = file === null ? null : URL.createObjectURL(file);
    previewUrlRef.current = next;
    setPreviewUrl(next);
  }

  useEffect(
    () => () => {
      if (previewUrlRef.current !== null) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    },
    [],
  );

  const form = useZodForm({
    schema: CreatePostFormSchema,
    initialValues: INITIAL_VALUES,
    onSubmit: async (values) => {
      await createPost.mutateAsync(values);
      form.reset();
      replacePreview(null);
      setFileKey((current) => current + 1);
      showToast({ variant: "success", title: "Post publié" });
    },
    onError: (error) => {
      showToast({
        variant: "error",
        title: "Publication impossible",
        message: toUserMessage(error),
      });
      // The backend puts image refusals in `fieldErrors.image`, so the
      // message lands under the right field.
      return apiErrorToFieldErrors(error);
    },
  });

  function selectImage(file: File | null): void {
    form.setField("image", file);
    replacePreview(file);
    if (file === null) {
      setFileKey((current) => current + 1);
    }
  }

  return (
    <Window variant="panel" title="Quoi de neuf ?" icon="✍️">
      <form className={styles.form} onSubmit={form.handleSubmit} noValidate>
        <Field
          label="Votre message"
          kind="textarea"
          name="content"
          rows={3}
          required
          maxLength={POST_CONTENT_MAX}
          showCount
          placeholder="Partagez quelque chose…"
          value={form.values.content}
          error={form.errors["content"]}
          disabled={form.isSubmitting}
          onValueChange={(value) => form.setField("content", value)}
        />

        <Field
          key={fileKey}
          label="Image (facultatif)"
          kind="file"
          name="image"
          accept={POST_IMAGE_ACCEPT}
          hint="JPEG, PNG ou WebP, 2 Mo maximum"
          error={form.errors["image"]}
          disabled={form.isSubmitting}
          onFileChange={selectImage}
        />

        {form.values.image === null || previewUrl === null ? null : (
          <ImagePreview
            url={previewUrl}
            file={form.values.image}
            action={
              <Button
                variant="ghost"
                size="sm"
                disabled={form.isSubmitting}
                onClick={() => {
                  selectImage(null);
                }}
              >
                Retirer l'image
              </Button>
            }
          />
        )}

        <div className={styles.actions}>
          <Button type="submit" variant="primary" disabled={form.isSubmitting}>
            {form.isSubmitting ? "Publication…" : "Publier"}
          </Button>
        </div>
      </form>
    </Window>
  );
}
