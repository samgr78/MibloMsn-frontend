import type { RegisterErrors, RegisterFormData } from './register.types.ts'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateRegisterForm(formData: RegisterFormData): RegisterErrors {
    const errors: RegisterErrors = {}

    if (!formData.email) {
        errors.email = 'Email is required.'
    } else if (!EMAIL_PATTERN.test(formData.email)) {
        errors.email = 'Invalid email format.'
    }

    if (!formData.username) {
        errors.username = 'Username is required.'
    } else if (formData.username.length < 3) {
        errors.username = 'Username must be at least 3 characters.'
    } else if (formData.username.length > 30) {
        errors.username = 'Username must be at most 30 characters.'
    }

    if (!formData.password) {
        errors.password = 'Password is required.'
    } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters.'
    }

    return errors
}

export function hasRegisterErrors(errors: RegisterErrors): boolean {
    return Object.values(errors).some((message) => message !== undefined)
}