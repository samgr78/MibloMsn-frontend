import type { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './features/auth/Login.tsx'
import Register from './features/auth/Register.tsx'
import PostFeed from './features/feed/PostFeed.tsx'
import Profile from './features/profile/Profile.tsx'
import BlueScreen from './features/system/BlueScreen.tsx'
import AppLayout from './shared/layouts/AppLayout.tsx'

function App(): ReactElement {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/feed" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/blue-screen" element={<BlueScreen />} />
      <Route element={<AppLayout />}>
        <Route path="/feed" element={<PostFeed />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  )
}

export default App
