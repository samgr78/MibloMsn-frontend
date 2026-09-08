import type { ReactElement } from 'react'
import { Navigate, NavLink, Outlet } from 'react-router-dom'
import './AppLayout.css'

function AppLayout(): ReactElement {
  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return (
    <main className="app-layout">
      <nav className="app-navigation" aria-label="Main navigation">
        <NavLink to="/home">Home</NavLink>
      </nav>

      <section className="app-content">
        <Outlet />
      </section>
    </main>
  )
}

export default AppLayout
