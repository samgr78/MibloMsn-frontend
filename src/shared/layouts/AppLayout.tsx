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
          <span className="app-window-controls" aria-hidden="true">
            <span>_</span><span>□</span><span>×</span>
          </span>
        </header>

        <div className="app-navigation-menu" aria-hidden="true">
          <span>File</span><span>Contacts</span><span>Actions</span>
          <span>Tools</span><span>Help</span>
        </div>

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

        <p className="app-navigation-label">
          <span aria-hidden="true">⌃</span> Online (2)
        </p>

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
          <strong className="app-navigation-footer-title">I want to...</strong>
          <button type="button" onClick={logout}>
            <span className="app-navigation-signout-icon" aria-hidden="true">×</span>
            <span className="app-navigation-link-text">Sign out</span>
          </button>
          <div className="app-navigation-ad" aria-hidden="true">
            <img src="/msn-boneco-vector-logo.png" alt="" />
            <span><strong>MiBLo</strong><small>Stay connected!</small></span>
          </div>
        </footer>
      </nav>

      <section className="app-workspace">
        <header className="app-workspace-titlebar">
          <img src="/msn-boneco-vector-logo.png" alt="" />
          <span>MiBLo - Conversation</span>
          <span className="app-window-controls" aria-hidden="true">
            <span>_</span><span>□</span><span>×</span>
          </span>
        </header>

        <div className="app-workspace-menu" aria-hidden="true">
          <span>File</span><span>Edit</span><span>Actions</span>
          <span>Tools</span><span>Help</span>
        </div>

        <div className="app-workspace-toolbar" aria-hidden="true">
          <span><b>☺</b>Invite</span>
          <span><b>✉</b>Send Files</span>
          <span><b>◉</b>Webcam</span>
          <span><b>♫</b>Audio</span>
          <span><b>★</b>Activities</span>
        </div>

        <section className="app-content">
          <Outlet />
        </section>
      </section>
    </main>
  )
}

export default AppLayout
