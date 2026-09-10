import { useEffect, useState, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import './BlueScreen.css'

const PROGRESS_STEP = 20
const PROGRESS_INTERVAL_MS = 900
const RESTART_DELAY_MS = 5000

function BlueScreen(): ReactElement {
  const navigate = useNavigate()
  const [progress, setProgress] = useState<number>(PROGRESS_STEP)

  useEffect(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')

    const progressInterval = window.setInterval(() => {
      setProgress((currentProgress) =>
        Math.min(100, currentProgress + PROGRESS_STEP),
      )
    }, PROGRESS_INTERVAL_MS)

    const restartTimeout = window.setTimeout(() => {
      navigate('/login', { replace: true })
    }, RESTART_DELAY_MS)

    return () => {
      window.clearInterval(progressInterval)
      window.clearTimeout(restartTimeout)
    }
  }, [navigate])

  return (
    <main className="blue-screen">
      <div className="blue-screen-content">
        <div className="blue-screen-sad-face" aria-hidden="true">:(</div>

        <h1>
          Your PC ran into a problem and needs to restart. We&apos;re just
          collecting some error info, and then we&apos;ll restart for you.
        </h1>

        <p
          className="blue-screen-progress"
          role="progressbar"
          aria-label="Collecting error information"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          {progress}% complete
        </p>

        <div className="blue-screen-details">
          <div className="blue-screen-qr" aria-hidden="true">
            <span className="blue-screen-qr-corner blue-screen-qr-corner--top-left" />
            <span className="blue-screen-qr-corner blue-screen-qr-corner--top-right" />
            <span className="blue-screen-qr-corner blue-screen-qr-corner--bottom-left" />
          </div>

          <div className="blue-screen-help">
            <p>
              For more information about this issue and possible fixes, visit
              https://www.windows.com/stopcode
            </p>
            <p>
              If you call a support person, give them this info:<br />
              Stop code: MIBLO_SESSION_CRASHED
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default BlueScreen
