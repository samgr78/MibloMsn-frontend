import { isAxiosError } from 'axios'
import { PostSchema, type Post } from './post.schema.ts'

function isUnknownRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function parseCreatedPost(value: unknown): Post | undefined {
  const result = PostSchema.safeParse(value)
  return result.success ? result.data : undefined
}

export function getCreatePostErrorMessage(error: unknown): string {
  if (!isAxiosError<unknown>(error)) {
    return 'An unexpected error occurred.'
  }

  const responseData: unknown = error.response?.data
  if (!isUnknownRecord(responseData)) {
    return 'Unable to create the post.'
  }

  return typeof responseData.error === 'string'
    ? responseData.error
    : 'Unable to create the post.'
}
