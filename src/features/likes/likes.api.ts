import { isAxiosError } from 'axios'
import { z } from 'zod'
import { api } from '../../api/axios.tsx'
import {
  LikeStateSchema,
  type LikeState,
} from '../feed/post.schema.ts'

const LikeErrorSchema = z.object({
  error: z.string(),
})

export async function updatePostLike(
  postId: string,
  shouldLike: boolean,
): Promise<LikeState> {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('You must be signed in to like a post.')
  }

  const { data }: { data: unknown } = await api.request<unknown>({
    method: shouldLike ? 'POST' : 'DELETE',
    url: `/posts/${postId}/like`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const parsedResponse = LikeStateSchema.safeParse(data)
  if (!parsedResponse.success) {
    throw new Error('The server returned an invalid like response.')
  }

  return parsedResponse.data
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
