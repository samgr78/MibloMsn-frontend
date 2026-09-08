import { Route, Routes } from 'react-router-dom'
import './App.css'
import Login from "./features/auth/Login.tsx";
import Register from "./features/auth/Register.tsx";
import Home from './features/home/Home.tsx'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  )
}

export default App
