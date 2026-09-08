import Input from '../../shared/components/Input'

function Login() {
  return (
    <main>
      <h1>Login</h1>
      <Input
        name="email"
        type="email"
        placeholder="exemple@email.com"
        autoComplete="email"
      />
    </main>
  )
}

export default Login
