import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import { Avatar } from "../shared/ui/Avatar/Avatar";
import { Button } from "../shared/ui/Button/Button";
import { Window } from "../shared/ui/Window/Window";
import styles from "./AppLayout.module.css";

/** Shared shell for signed-in screens: one MSN window. */
export function AppLayout() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();

  if (session === null) {
    return null;
  }

  return (
    <div className={styles.screen}>
      <div className={styles.shell}>
        <Window title="MibloMSN" icon="🦋" flush>
          <div className={styles.userStrip}>
            <Avatar username={session.user.username} size="md" status="online" />

            <div className={styles.identity}>
              <Link className={styles.name} to={`/users/${session.user.id}`}>
                {session.user.username}
              </Link>
              <span className={styles.presence}>En ligne</span>
            </div>

            <nav className={styles.nav} aria-label="Navigation principale">
              <Button variant="ghost" size="sm" onClick={() => navigate("/feed")}>
                Fil
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/users/${session.user.id}`)}
              >
                Mon profil
              </Button>
              <Button variant="secondary" size="sm" onClick={signOut}>
                Déconnexion
              </Button>
            </nav>
          </div>

          <div className={styles.content}>
            <Outlet />
          </div>
        </Window>
      </div>
    </div>
  );
}
