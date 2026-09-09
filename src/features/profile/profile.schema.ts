import { z } from 'zod'

export const ProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  createdAt: z.string(),
  postCount: z.number().int().nonnegative(),
  commentCount: z.number().int().nonnegative(),
  likeCount: z.number().int().nonnegative(),
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

