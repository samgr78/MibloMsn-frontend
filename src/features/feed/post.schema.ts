import { z } from 'zod'

export const PostSchema = z.object({
  id: z.string(),
  content: z.string(),
  imageUrl: z.string().nullable(),
  createdAt: z.string(),
  author: z.object({
    id: z.string(),
    username: z.string(),
  }),
  likeCount: z.number().int().nonnegative(),
  commentCount: z.number().int().nonnegative(),
  likedByMe: z.boolean(),
})

export const LikeStateSchema = z.object({
  postId: z.string(),
  likeCount: z.number().int().nonnegative(),
  likedByMe: z.boolean(),
})

export const PostPageResponseSchema = z.object({
  posts: z.array(PostSchema),
  totalPages: z.number().int().nonnegative(),
})

export const PostCommentSchema = z.object({
  id: z.string(),
  content: z.string(),
  createdAt: z.string(),
  author: z.object({
    id: z.string(),
    username: z.string(),
  }),
})

export const PostDetailSchema = PostSchema.extend({
  comments: z.array(PostCommentSchema),
})

export type Post = z.infer<typeof PostSchema>
export type PostPageResponse = z.infer<typeof PostPageResponseSchema>
export type LikeState = z.infer<typeof LikeStateSchema>
export type PostComment = z.infer<typeof PostCommentSchema>
export type PostDetail = z.infer<typeof PostDetailSchema>
