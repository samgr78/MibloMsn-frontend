import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import './BlueScreen.css'

function BlueScreen(): ReactElement {
  const navigate = useNavigate()

  function reconnect(): void {
    navigate('/login', { replace: true })
  }

  return (
    <main className="blue-screen">
      <div className="blue-screen-content">
        <p className="blue-screen-title">Windows</p>

        <p>
          A fatal exception 0E has occurred at 0028:C0011E36 in MIBLO.EXE.
          The current application will be terminated.
        </p>

        <ul>
          <li>Your Messenger session has been closed.</li>
          <li>You must sign in again to continue.</li>
        </ul>

        <p>
          Error: 0E : 016F : BFF9B3D4
        </p>

        <button type="button" onClick={reconnect} autoFocus>
          Press Enter to reconnect _
        </button>
      </div>
    </main>
  )
}

export default BlueScreen

