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

export const POST_CONTENT_MAX = 500;

export const CreatePostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, { message: "Le message ne peut pas être vide" })
    .max(POST_CONTENT_MAX, { message: `${POST_CONTENT_MAX} caractères maximum` }),
});

export type CreatePostInput = z.infer<typeof CreatePostSchema>;
