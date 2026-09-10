import { isAxiosError } from 'axios'
import type { LoginErrors, ParsedLoginResponse } from './login.types.ts'

function isUnknownRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function readMessage(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value
  }

  if (!Array.isArray(value)) {
    return undefined
  }

  const messages = value.filter(
    (message): message is string => typeof message === 'string',
  )

  return messages.length > 0 ? messages.join(' ') : undefined
}

function readFieldErrors(value: unknown): LoginErrors | undefined {
  if (!isUnknownRecord(value)) {
    return undefined
  }

  const email = readString(value.email)
  const password = readString(value.password)

  return email || password ? { email, password } : undefined
}

export function parseLoginResponse(
  value: unknown,
  fallbackEmail: string,
): ParsedLoginResponse | undefined {
  if (!isUnknownRecord(value)) {
    return undefined
  }

  const token = readString(value.token)
  const user = isUnknownRecord(value.user) ? value.user : undefined
  const userId = user ? readString(user.id) : undefined
  if (!token || !userId) {
    return undefined
  }

  const username =
    (user ? readString(user.username) : undefined) ??
    (user ? readString(user.name) : undefined) ??
    readString(value.username) ??
    readString(value.name) ??
    fallbackEmail.split('@')[0]

  return { token, userId, username }
}

export function getLoginErrors(error: unknown): LoginErrors {
  if (!isAxiosError<unknown>(error)) {
    return { general: 'An unexpected error occurred.' }
  }

  const responseData: unknown = error.response?.data
  if (!isUnknownRecord(responseData)) {
    return { general: 'Unable to log in.' }
  }

  const responseMessage = readMessage(responseData.message) ?? readMessage(responseData.error)
  const fieldErrors = readFieldErrors(responseData.errors)
  const field = responseData.field

  if (fieldErrors) {
    return fieldErrors
  }

  if (field === 'email') {
    return { email: responseMessage ?? 'Invalid email.' }
  }

  if (field === 'password') {
    return { password: responseMessage ?? 'Invalid password.' }
  }

  if (responseMessage?.toLowerCase().includes('email')) {
    return { email: responseMessage }
  }

  if (responseMessage?.toLowerCase().includes('password')) {
    return { password: responseMessage }
  }

  if (error.response?.status === 401) {
    return { general: 'Invalid email or password.' }
  }

  return { general: responseMessage ?? 'Unable to log in.' }
}
