import { Navigate } from 'react-router-dom'

function Home() {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <h1>Bonjour {username}</h1>
}

export default Home
