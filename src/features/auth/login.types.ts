export type PresenceStatus = 'online' | 'offline'

export type LoginFormData = {
  email: string
  password: string
  status: PresenceStatus
}

export type LoginErrors = {
  email?: string
  password?: string
  general?: string
}

export type ParsedLoginResponse = {
  token: string
  username: string
}
