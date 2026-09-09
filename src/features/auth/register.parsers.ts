import { isAxiosError } from 'axios'
import type { ParsedRegisterResponse, RegisterErrors } from './register.types.ts'

function isUnknownRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readString(value: unknown): string | undefined {
    return typeof value === 'string' && value.length > 0 ? value : undefined
}

function fieldFromMessage(message: string): keyof RegisterErrors {
    const lower = message.toLowerCase()
    if (lower.includes('email')) return 'email'
    if (lower.includes('username')) return 'username'
    if (lower.includes('password')) return 'password'
    return 'general'
}

export function parseRegisterResponse(
    value: unknown,
    fallbackUsername: string,
): ParsedRegisterResponse | undefined {
    if (!isUnknownRecord(value)) {
        return undefined
    }
    const token = readString(value.token)
    if (!token) {
        return undefined
    }
    const user = isUnknownRecord(value.user) ? value.user : undefined
    const username =
        (user ? readString(user.username) : undefined) ??
        readString(value.username) ??
        fallbackUsername
    return { token, username }
}

export function getRegisterErrorsFromData(value: unknown): RegisterErrors | undefined {
    if (!isUnknownRecord(value)) {
        return undefined
    }
    const message = readString(value.error)
    if (!message) {
        return undefined
    }
    return { [fieldFromMessage(message)]: message }
}

export function getRegisterErrors(error: unknown): RegisterErrors {
    if (!isAxiosError<unknown>(error)) {
        return { general: 'An unexpected error occurred.' }
    }
    const responseData: unknown = error.response?.data
    return getRegisterErrorsFromData(responseData) ?? { general: 'Unable to register.' }
}