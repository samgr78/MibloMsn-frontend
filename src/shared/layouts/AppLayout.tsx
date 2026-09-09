import type { ReactElement } from 'react'
import { Navigate, NavLink, Outlet } from 'react-router-dom'
import './AppLayout.css'

function AppLayout(): ReactElement {
  const token = localStorage.getItem('token')
  const username = localStorage.getItem('username') ?? 'User'

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

        <section className="app-navigation-profile" aria-label="Connected user">
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
        </section>

        <p className="app-navigation-label">My activities</p>

        <div className="app-navigation-links">
          <NavLink to="/feed">
            <span className="app-navigation-link-icon" aria-hidden="true">
              M
            </span>
            <span className="app-navigation-link-text">Feed</span>
          </NavLink>
        </div>

        <footer className="app-navigation-footer">
          <span className="app-navigation-footer-dot" aria-hidden="true" />
          <span>Connected</span>
        </footer>
      </nav>

      <section className="app-content">
        <Outlet />
      </section>
    </main>
  )
}

export default AppLayout
