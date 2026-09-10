import { isAxiosError } from 'axios'
import { z } from 'zod'
import { api } from '../../api/axios.tsx'
import {
  PostCommentSchema,
  PostDetailSchema,
  type PostComment,
  type PostDetail,
} from '../feed/post.schema.ts'

const ApiErrorSchema = z.object({ error: z.string() })

export type PostDetailApiError = {
  message: string
  status: number | undefined
}

function getAuthorizationHeader(): { Authorization: string } {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('Authentication is required.')
  }
  return { Authorization: `Bearer ${token}` }
}

export async function fetchPostDetail(
  postId: string,
  signal: AbortSignal,
): Promise<PostDetail> {
  const { data }: { data: unknown } = await api.get<unknown>(
    `/posts/${postId}`,
    { headers: getAuthorizationHeader(), signal },
  )
  const result = PostDetailSchema.safeParse(data)
  if (!result.success) {
    throw new Error('The server returned an invalid post.')
  }
  return result.data
}

export async function createPostComment(
  postId: string,
  content: string,
): Promise<PostComment> {
  const { data }: { data: unknown } = await api.post<unknown>(
    `/posts/${postId}/comments`,
    { content },
    { headers: getAuthorizationHeader() },
  )
  const result = PostCommentSchema.safeParse(data)
  if (!result.success) {
    throw new Error('The server returned an invalid comment.')
  }
  return result.data
}

export function getPostDetailApiError(error: unknown): PostDetailApiError {
  if (isAxiosError<unknown>(error)) {
    const result = ApiErrorSchema.safeParse(error.response?.data)
    return {
      message: result.success
        ? result.data.error
        : 'The server could not complete this request.',
      status: error.response?.status,
    }
  }
  return {
    message: error instanceof Error ? error.message : 'An unexpected error occurred.',
    status: undefined,
  }
}
