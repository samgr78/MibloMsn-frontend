import { useState, type ChangeEvent, type FormEvent } from 'react'
import Input from '../../shared/components/Input.tsx'
import './auth.css'
import { api } from '../../api/axios.tsx'

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    status: 'online',
  })

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target

    setFormData((previousFormData) => ({
      ...previousFormData,
      [name]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      const response = await api.post('/auth/login', formData)
      console.log(response.data)
    } catch (error) {
      console.error('Failed to login', error)
    }
  }

  return (
    <main>
      <form onSubmit={handleSubmit}>
        <Input
          label="E-mail address:"
          type="email"
          name="email"
          id="email"
          className="input"
          value={formData.email}
          onChange={handleChange}
        />
        <Input
          label="Password:"
          type="password"
          name="password"
          id="password"
          className="input"
          value={formData.password}
          onChange={handleChange}
        />

        <div>
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

        <button type="submit">Login</button>
      </form>
    </main>
  )
}

export default Login
