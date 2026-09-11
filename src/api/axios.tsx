import axios from 'axios'
import { clearSession } from '../features/auth/session.ts'

const configuredApiUrl: unknown = import.meta.env.VITE_API_URL

export const API_BASE_URL =
  typeof configuredApiUrl === 'string' && configuredApiUrl.length > 0
    ? configuredApiUrl
    : 'http://localhost:3000/'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const requestUrl = error.config?.url ?? ''
      const isAuthenticationRequest = requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/register')
      if (!isAuthenticationRequest) {
        clearSession()
        if (window.location.pathname !== '/login') {
          window.location.replace('/login')
        }
      }
    }
    return Promise.reject(error)
  },
)

export function resolveApiUrl(path: string): string {
  return new URL(path, API_BASE_URL).toString()
}
