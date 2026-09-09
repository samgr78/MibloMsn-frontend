import { useEffect, useState, type ReactElement } from 'react'
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import './AppLayout.css'

function AppLayout(): ReactElement {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const [username, setUsername] = useState<string>(
    localStorage.getItem('username') ?? 'User',
  )

  useEffect(() => {
    function refreshUsername(): void {
      setUsername(localStorage.getItem('username') ?? 'User')
    }
    window.addEventListener('profile-updated', refreshUsername)
    return () => window.removeEventListener('profile-updated', refreshUsername)
  }, [])

  function logout(): void {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/login', { replace: true })
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return (
    <main className="app-layout">
      <nav className="app-navigation" aria-label="Main navigation">
        <header className="app-navigation-titlebar">
          <img
            className="app-navigation-logo"
            src="/msn-boneco-vector-logo.png"
            alt=""
          />
          <span>MiBLo Messenger</span>
        </header>

        <NavLink
          to="/profile"
          className="app-navigation-profile"
          aria-label="Open my profile"
        >
          <div className="app-navigation-avatar" aria-hidden="true">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="app-navigation-identity">
            <strong>{username}</strong>
            <span className="app-navigation-status">
              <span className="app-navigation-status-dot" aria-hidden="true" />
              Online
            </span>
          </div>
        </NavLink>

        <p className="app-navigation-label">My activities</p>

        <div className="app-navigation-links">
          <NavLink to="/feed">
            <span className="app-navigation-link-icon" aria-hidden="true">
              M
            </span>
            <span className="app-navigation-link-text">Feed</span>
          </NavLink>
          <NavLink to="/profile">
            <span className="app-navigation-link-icon" aria-hidden="true">
              P
            </span>
            <span className="app-navigation-link-text">Profile</span>
          </NavLink>
        </div>

        <footer className="app-navigation-footer">
          <button type="button" onClick={logout}>
            <span aria-hidden="true">×</span>
            <span className="app-navigation-link-text">Sign out</span>
          </button>
        </footer>
      </nav>

      <section className="app-content">
        <Outlet />
      </section>
    </main>
  )
}

export default AppLayout
