import axios from 'axios'

const configuredApiUrl: unknown = import.meta.env.VITE_API_URL

export const API_BASE_URL =
  typeof configuredApiUrl === 'string' && configuredApiUrl.length > 0
    ? configuredApiUrl
    : 'http://localhost:3000/'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

export function resolveApiUrl(path: string): string {
  return new URL(path, API_BASE_URL).toString()
}
