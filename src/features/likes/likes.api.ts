import { isAxiosError } from 'axios'
import { z } from 'zod'
import { api } from '../../api/axios.tsx'

const LikeErrorSchema = z.object({
  error: z.string(),
})

export async function updatePostLike(
  postId: string,
  shouldLike: boolean,
): Promise<void> {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('You must be signed in to like a post.')
  }

  await api.request<unknown>({
    method: shouldLike ? 'POST' : 'DELETE',
    url: `/posts/${postId}/like`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export function getLikeErrorMessage(error: unknown): string {
  if (error instanceof Error && !isAxiosError(error)) {
    return error.message
  }

  if (isAxiosError<unknown>(error)) {
    const parsedError = LikeErrorSchema.safeParse(error.response?.data)
    if (parsedError.success) {
      return parsedError.data.error
    }
  }

  return 'Unable to update this like. Please try again.'
}
