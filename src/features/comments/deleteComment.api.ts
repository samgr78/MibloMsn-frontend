import { isAxiosError } from 'axios'
import { z } from 'zod'
import { api } from '../../api/axios.tsx'

const DeleteCommentResponseSchema = z.object({ success: z.literal(true) })
const DeleteCommentErrorSchema = z.object({ error: z.string() })

export async function deleteComment(commentId: string): Promise<void> {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('Authentication is required.')
  }

  const { data }: { data: unknown } = await api.delete<unknown>(
    `/comments/${commentId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  const result = DeleteCommentResponseSchema.safeParse(data)
  if (!result.success) {
    throw new Error('The server returned an invalid deletion response.')
  }
}

export function getDeleteCommentErrorMessage(error: unknown): string {
  if (isAxiosError<unknown>(error)) {
    const result = DeleteCommentErrorSchema.safeParse(error.response?.data)
    if (result.success) {
      return result.data.error
    }
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Unable to delete this comment.'
}

