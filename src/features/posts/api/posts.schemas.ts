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
