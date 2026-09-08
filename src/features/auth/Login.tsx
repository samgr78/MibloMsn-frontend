import { isAxiosError } from 'axios'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../api/axios.tsx'
import Input from '../../shared/components/Input.tsx'
import './auth.css'

type LoginFormData = {
  email: string
  password: string
  status: string
}

type LoginErrors = {
  email?: string
  password?: string
  general?: string
}

type LoginResponse = {
  token?: string
  name?: string
  username?: string
  user?: {
    name?: string
    username?: string
  }
}

type LoginErrorResponse = {
  message?: string | string[]
  field?: 'email' | 'password'
  errors?: {
    email?: string
    password?: string
  }
}

const initialFormData: LoginFormData = {
  email: '',
  password: '',
  status: 'online',
}

function getUsername(response: LoginResponse, email: string) {
  return (
    response.user?.username ??
    response.user?.name ??
    response.username ??
    response.name ??
    email.split('@')[0]
  )
}

function getLoginErrors(error: unknown): LoginErrors {
  if (!isAxiosError<LoginErrorResponse>(error)) {
    return { general: 'An unexpected error occurred.' }
  }

  const responseData = error.response?.data
  const responseMessage = Array.isArray(responseData?.message)
    ? responseData.message.join(' ')
    : responseData?.message

  if (responseData?.errors) {
    return responseData.errors
  }

  if (responseData?.field) {
    return { [responseData.field]: responseMessage ?? 'Invalid value.' }
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

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<LoginFormData>(initialFormData)
  const [errors, setErrors] = useState<LoginErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target

    setFormData((previousFormData) => ({
      ...previousFormData,
      [name]: value,
    }))

    if (name === 'email' || name === 'password') {
      setErrors((previousErrors) => ({
        ...previousErrors,
        [name]: undefined,
        general: undefined,
      }))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrors({})
    setIsLoading(true)

    try {
      const { data } = await api.post<LoginResponse>('/auth/login', formData)

      if (!data.token) {
        setErrors({ general: 'No authentication token was received.' })
        return
      }

      const username = getUsername(data, formData.email)

      localStorage.setItem('token', data.token)
      localStorage.setItem('username', username)
      navigate('/home')
    } catch (error) {
      setErrors(getLoginErrors(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="header">
          <div className="cadre">
            <img src="/msn-boneco-vector-logo.png" alt="Logo MSN" />
          </div>
        </div>

        <div className="forminput">
          <Input
            label="E-mail address:"
            type="email"
            name="email"
            id="email"
            className="input"
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
            label="Password:"
            type="password"
            name="password"
            id="password"
            className="input"
            value={formData.password}
            onChange={handleChange}
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
              onChange={handleChange}
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <div className="checkdiv">
            <div className="check">
              <input type="checkbox" name="rememberMe" />
              <span>Remember me</span>
            </div>
            <div className="check">
              <input type="checkbox" name="rememberPassword" />
              <span>Remember my password</span>
            </div>
            <div className="check">
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

        <div className="footer">
          <div className="left">
            <Link to="/forgot-passord">Forgot a password?</Link>
            <Link to="/status">Services status</Link>
          </div>

          <div className="right">
            <Link to="/register">Get a new account</Link>
          </div>
        </div>
      </form>
    </main>
  )
}

export default Login
