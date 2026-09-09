import { z } from "zod";

/** Every endpoint returns the same post shape, so this is the only
 *  definition: the TypeScript type is inferred, never hand-written. */
export const PostSchema = z.object({
  id: z.string().min(1),
  content: z.string(),
  imageUrl: z.string().nullable(),
  createdAt: z.iso.datetime(),
  author: z.object({
    id: z.string().min(1),
    username: z.string().min(1),
  }),
  likeCount: z.number().int().nonnegative(),
  commentCount: z.number().int().nonnegative(),
  likedByMe: z.boolean(),
});

export type Post = z.infer<typeof PostSchema>;

/** Page returned by the paginated endpoints. */
export const PostPageSchema = z.object({
  items: z.array(PostSchema),
  nextCursor: z.string().nullable(),
});

export type PostPage = z.infer<typeof PostPageSchema>;

export const CommentSchema = z.object({
  id: z.string().min(1),
  content: z.string(),
  createdAt: z.iso.datetime(),
  author: z.object({
    id: z.string().min(1),
    username: z.string().min(1),
  }),
});

export type Comment = z.infer<typeof CommentSchema>;

/** A post detail is the post plus its comments. */
export const PostDetailSchema = PostSchema.extend({
  comments: z.array(CommentSchema),
});

export type PostDetail = z.infer<typeof PostDetailSchema>;

/** Like route response: enough to reconcile what is displayed. */
export const LikeStateSchema = z.object({
  postId: z.string().min(1),
  likeCount: z.number().int().nonnegative(),
  likedByMe: z.boolean(),
});

export type LikeState = z.infer<typeof LikeStateSchema>;

export const POST_CONTENT_MAX = 500;

export const CreatePostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, { message: "Le message ne peut pas être vide" })
    .max(POST_CONTENT_MAX, { message: `${POST_CONTENT_MAX} caractères maximum` }),
});

export type CreatePostInput = z.infer<typeof CreatePostSchema>;

/**
 * Contraintes d'image reprises telles quelles du backend (multer).
 * Re-checking here is not redundant: it avoids uploading 5 MB only to be
 * refused, and puts the error on the right field. The server stays the
 * only authority.
 */
export const POST_IMAGE_MAX_BYTES = 2 * 1024 * 1024;

export const POST_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const POST_IMAGE_ACCEPT = POST_IMAGE_TYPES.join(",");

const PostImageSchema = z
  .instanceof(File)
  .refine((file) => POST_IMAGE_TYPES.some((type) => type === file.type), {
    message: "Format non supporté (JPEG, PNG ou WebP)",
  })
  .refine((file) => file.size <= POST_IMAGE_MAX_BYTES, {
    message: "Image trop volumineuse (2 Mo maximum)",
  })
  .nullable();

/** What the publish form handles: the text plus the image. */
export const CreatePostFormSchema = CreatePostSchema.extend({
  image: PostImageSchema,
});

export type CreatePostFormInput = z.infer<typeof CreatePostFormSchema>;
