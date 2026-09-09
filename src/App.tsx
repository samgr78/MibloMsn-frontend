import { Route, Routes } from 'react-router-dom'
import './App.css'
import Login from "./features/auth/Login.tsx";
import Register from "./features/auth/Register.tsx";
import Home from './features/home/Home.tsx'
import AppLayout from './shared/layouts/AppLayout.tsx'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<AppLayout />}>
        <Route path="/home" element={<Home />} />
      </Route>
    </Routes>
  )
}

export default App
