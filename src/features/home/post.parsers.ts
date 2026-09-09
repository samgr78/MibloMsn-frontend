import { isAxiosError } from 'axios'

function isUnknownRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function parseImageUrl(value: unknown): string | undefined {
  if (!isUnknownRecord(value)) {
    return undefined
  }

  return typeof value.imageUrl === 'string' ? value.imageUrl : undefined
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
