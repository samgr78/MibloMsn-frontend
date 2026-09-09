import { isAxiosError } from 'axios'
import { z } from 'zod'
import { api } from '../../api/axios.tsx'

const DeletePostResponseSchema = z.object({
  success: z.literal(true),
})

const DeletePostErrorSchema = z.object({
  error: z.string(),
})

export async function deletePost(postId: string): Promise<void> {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('Authentication is required.')
  }

  const { data }: { data: unknown } = await api.delete<unknown>(
    `/posts/${postId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  const result = DeletePostResponseSchema.safeParse(data)
  if (!result.success) {
    throw new Error('The server returned an invalid deletion response.')
  }
}

export function getDeletePostErrorMessage(error: unknown): string {
  if (isAxiosError<unknown>(error)) {
    const result = DeletePostErrorSchema.safeParse(error.response?.data)
    if (result.success) {
      return result.data.error
    }
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Unable to delete this post.'
}

