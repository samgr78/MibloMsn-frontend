export type RegisterFormData = {
    email: string
    username: string
    password: string
}

export type RegisterErrors = {
    email?: string
    username?: string
    password?: string
    general?: string
}

export type ParsedRegisterResponse = {
    token: string
    username: string
}