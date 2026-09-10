import { useState, type ChangeEvent, type FormEvent, type ReactElement } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../api/axios.tsx'
import Form from '../../shared/components/Form.tsx'
import Input from '../../shared/components/Input.tsx'
import {
    getRegisterErrors,
    getRegisterErrorsFromData,
    parseRegisterResponse,
} from './register.parsers.ts'
import type { RegisterErrors, RegisterFormData } from './register.types.ts'
import './auth.css'
import { validateRegisterForm, hasRegisterErrors } from './register.validator.ts'
import { saveSession } from './session.ts'

const initialFormData: RegisterFormData = {
    email: '',
    username: '',
    password: '',
}

function isRegisterField(value: string): value is keyof RegisterFormData {
    return value === 'email' || value === 'username' || value === 'password'
}

function Register(): ReactElement {
    const navigate = useNavigate()
    const [formData, setFormData] = useState<RegisterFormData>(initialFormData)
    const [errors, setErrors] = useState<RegisterErrors>({})
    const [isLoading, setIsLoading] = useState<boolean>(false)

    function clearFieldError(field: keyof RegisterFormData): void {
        setErrors((previousErrors) => ({
            ...previousErrors,
            [field]: undefined,
            general: undefined,
        }))
    }

    function handleChange(event: ChangeEvent<HTMLInputElement>): void {
        const { name, value } = event.currentTarget
        if (!isRegisterField(name)) {
            return
        }

        setFormData((previousFormData) => ({
            ...previousFormData,
            [name]: value,
        }))
        clearFieldError(name)
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault()

        const validationErrors = validateRegisterForm(formData)
        if (hasRegisterErrors(validationErrors)) {
            setErrors(validationErrors)
            return
        }

        setErrors({})
        setIsLoading(true)

        try {
            const { data }: { data: unknown } = await api.post<unknown>(
                '/auth/register',
                formData,
            )

            const registerResponse = parseRegisterResponse(data, formData.username)
            if (registerResponse) {
                saveSession(registerResponse.token, {
                    id: registerResponse.userId,
                    username: registerResponse.username,
                })
                navigate('/feed', { replace: true })
                return
            }

            setErrors(
                getRegisterErrorsFromData(data) ?? {
                    general: 'The server returned an invalid response.',
                },
            )
        } catch (error: unknown) {
            setErrors(getRegisterErrors(error))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="auth-page">
            <Form className="auth-form" onSubmit={handleSubmit} noValidate>
                <div className="auth-titlebar">
                    <img src="/msn-boneco-vector-logo.png" alt="" />
                    <span>MiBLo Messenger</span>
                    <span className="auth-titlebar-controls" aria-hidden="true">
                        _ □ ×
                    </span>
                </div>

                <div className="auth-header">
                    <div className="logo-frame">
                        <img src="/msn-boneco-vector-logo.png" alt="Logo MSN" />
                    </div>
                    <h1>Create an account</h1>
                    <p>Join MiBLo Messenger and start sharing.</p>
                </div>

                <div className="auth-fields">
                    <Input
                        label="E-mail address:"
                        type="email"
                        name="email"
                        id="email"
                        className="auth-input"
                        value={formData.email}
                        onChange={handleChange}
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        autoComplete="email"
                        required
                    />
                    {errors.email && (
                        <span className="error-message" id="email-error">
              {errors.email}
            </span>
                    )}

                    <Input
                        label="Username:"
                        type="text"
                        name="username"
                        id="username"
                        className="auth-input"
                        value={formData.username}
                        onChange={handleChange}
                        aria-invalid={Boolean(errors.username)}
                        aria-describedby={errors.username ? 'username-error' : undefined}
                        autoComplete="username"
                        required
                    />
                    {errors.username && (
                        <span className="error-message" id="username-error">
              {errors.username}
            </span>
                    )}

                    <Input
                        label="Password:"
                        type="password"
                        name="password"
                        id="password"
                        className="auth-input"
                        value={formData.password}
                        onChange={handleChange}
                        aria-invalid={Boolean(errors.password)}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                        autoComplete="new-password"
                        required
                    />
                    {errors.password && (
                        <span className="error-message" id="password-error">
              {errors.password}
            </span>
                    )}

                    {errors.general && (
                        <span className="error-message" role="alert">
              {errors.general}
            </span>
                    )}

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Creating account...' : 'Create my account'}
                    </button>
                </div>

                <div className="auth-footer auth-footer--centered">
                    <p>
                        Already have an account? <Link to="/login">Sign in</Link>
                    </p>
                </div>
            </Form>
        </main>
    )
}

export default Register
