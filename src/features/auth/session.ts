export type SessionUser = {
  id: string
  username: string
}

export function saveSession(token: string, user: SessionUser): void {
  localStorage.setItem('token', token)
  localStorage.setItem('userId', user.id)
  localStorage.setItem('username', user.username)
}

export function clearSession(): void {
  localStorage.removeItem('token')
  localStorage.removeItem('userId')
  localStorage.removeItem('username')
}

export function getCurrentUserId(): string | null {
  return localStorage.getItem('userId')
}
