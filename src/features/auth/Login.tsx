import { useState, type ChangeEvent, type FormEvent, type ReactElement } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../api/axios.tsx'
import Form from '../../shared/components/Form.tsx'
import Input from '../../shared/components/Input.tsx'
import { getLoginErrors, parseLoginResponse } from './login.parsers.ts'
import type {
  LoginErrors,
  LoginFormData,
  PresenceStatus,
} from './login.types.ts'
import './auth.css'

const initialFormData: LoginFormData = {
  email: '',
  password: '',
  status: 'online',
}

function isCredentialField(value: string): value is 'email' | 'password' {
  return value === 'email' || value === 'password'
}

function isPresenceStatus(value: string): value is PresenceStatus {
  return value === 'online' || value === 'offline'
}

function Login(): ReactElement {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<LoginFormData>(initialFormData)
  const [errors, setErrors] = useState<LoginErrors>({})
  const [isLoading, setIsLoading] = useState<boolean>(false)

  function clearCredentialError(field: 'email' | 'password'): void {
    setErrors((previousErrors) => ({
      ...previousErrors,
      [field]: undefined,
      general: undefined,
    }))
  }

  function handleCredentialChange(event: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.currentTarget
    if (!isCredentialField(name)) {
      return
    }

    setFormData((previousFormData) => ({
      ...previousFormData,
      [name]: value,
    }))
    clearCredentialError(name)
  }

  function handleStatusChange(event: ChangeEvent<HTMLSelectElement>): void {
    const { value } = event.currentTarget
    if (!isPresenceStatus(value)) {
      return
    }

    setFormData((previousFormData) => ({
      ...previousFormData,
      status: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setErrors({})
    setIsLoading(true)

    try {
      const { data }: { data: unknown } = await api.post<unknown>(
        '/auth/login',
        formData,
      )
      const loginResponse = parseLoginResponse(data, formData.email)

      if (!loginResponse) {
        setErrors({ general: 'The server returned an invalid login response.' })
        return
      }

      localStorage.setItem('token', loginResponse.token)
      localStorage.setItem('username', loginResponse.username)
      navigate('/feed')
    } catch (error: unknown) {
      setErrors(getLoginErrors(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="login-page">
      <Form className="login-form" onSubmit={handleSubmit}>
        <div className="login-header">
          <div className="logo-frame">
            <img src="/msn-boneco-vector-logo.png" alt="Logo MSN" />
          </div>
        </div>

        <div className="login-fields">
          <Input
            label="E-mail address:"
            type="email"
            name="email"
            id="email"
            className="login-input"
            value={formData.email}
            onChange={handleCredentialChange}
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
            label="Password:"
            type="password"
            name="password"
            id="password"
            className="login-input"
            value={formData.password}
            onChange={handleCredentialChange}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            autoComplete="current-password"
            required
          />
          {errors.password && (
            <span className="error-message" id="password-error">
              {errors.password}
            </span>
          )}

          <div className="status-field">
            <span>Status</span>
            <select
              name="status"
              value={formData.status}
              onChange={handleStatusChange}
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <div className="login-options">
            <div className="login-option">
              <input type="checkbox" name="rememberMe" />
              <span>Remember me</span>
            </div>
            <div className="login-option">
              <input type="checkbox" name="rememberPassword" />
              <span>Remember my password</span>
            </div>
            <div className="login-option">
              <input type="checkbox" name="autoLogin" />
              <span>Sign me in automatically</span>
            </div>
          </div>

          {errors.general && (
            <span className="error-message" role="alert">
              {errors.general}
            </span>
          )}

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>

        <div className="login-footer">
          <div className="login-footer-links">
            <Link to="/forgot-passord">Forgot a password?</Link>
            <Link to="/status">Services status</Link>
          </div>

          <div className="login-footer-account">
            <Link to="/register">Get a new account</Link>
          </div>
        </div>
      </Form>
    </main>
  )
}

export default Login
