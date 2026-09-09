import { isAxiosError } from 'axios'
import { api } from '../../api/axios.tsx'
import {
  PasswordUpdateResponseSchema,
  ProfileErrorSchema,
  ProfileSchema,
  type Profile,
  type ProfileField,
} from './profile.schema.ts'

export type ProfileApiError = {
  message: string
  field?: ProfileField
}

function getAuthorizationHeader(): { Authorization: string } {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('Authentication is required.')
  }
  return { Authorization: `Bearer ${token}` }
}

export async function fetchProfile(signal: AbortSignal): Promise<Profile> {
  const { data }: { data: unknown } = await api.get<unknown>('/profile', {
    headers: getAuthorizationHeader(),
    signal,
  })
  const result = ProfileSchema.safeParse(data)
  if (!result.success) {
    throw new Error('The server returned an invalid profile.')
  }
  return result.data
}

export async function saveProfile(
  username: string,
  email: string,
): Promise<Profile> {
  const { data }: { data: unknown } = await api.patch<unknown>(
    '/profile',
    { username, email },
    { headers: getAuthorizationHeader() },
  )
  const result = ProfileSchema.safeParse(data)
  if (!result.success) {
    throw new Error('The server returned an invalid profile.')
  }
  return result.data
}

export async function savePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const { data }: { data: unknown } = await api.patch<unknown>(
    '/profile/password',
    { currentPassword, newPassword },
    { headers: getAuthorizationHeader() },
  )
  const result = PasswordUpdateResponseSchema.safeParse(data)
  if (!result.success) {
    throw new Error('The server returned an invalid password response.')
  }
}

export function getProfileApiError(error: unknown): ProfileApiError {
  if (isAxiosError<unknown>(error)) {
    const result = ProfileErrorSchema.safeParse(error.response?.data)
    if (result.success) {
      return { message: result.data.error, field: result.data.field }
    }
  }
  if (error instanceof Error) {
    return { message: error.message }
  }
  return { message: 'An unexpected error occurred.' }
}

