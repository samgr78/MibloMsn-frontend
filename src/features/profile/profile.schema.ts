import { z } from 'zod'
import { PostSchema } from '../feed/post.schema.ts'

export const ProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  createdAt: z.string(),
})

export const ProfilePostsResponseSchema = z.object({
  posts: z.array(PostSchema),
})

export const PasswordUpdateResponseSchema = z.object({
  success: z.literal(true),
})

export const ProfileErrorSchema = z.object({
  error: z.string(),
  field: z
    .enum(['email', 'username', 'currentPassword', 'newPassword'])
    .optional(),
})

export type Profile = z.infer<typeof ProfileSchema>
export type ProfileField = z.infer<typeof ProfileErrorSchema>['field']
