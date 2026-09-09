import type { ReactElement } from 'react'

function Home(): ReactElement {
  const username = localStorage.getItem('username') ?? 'utilisateur'

  return <h1>Bonjour {username}</h1>
}

export default Home
