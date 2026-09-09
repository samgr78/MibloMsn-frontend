import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "./api/auth.schemas";
import type { AuthContextValue } from "./auth.types";
import { AuthContext } from "./AuthContext";
import {
  SESSION_CHANGED_EVENT,
  clearSession,
  readSession,
  writeSession,
} from "./session.storage";

export function AuthProvider({ children }: { children: ReactNode }) {
  // Lazy initialiser: reading in an effect instead would flash a signed-out
  // screen on reload and bounce the user to /login.
  const [session, setSession] = useState<Session | null>(() => readSession());

  // Storage is the source of truth and this state only mirrors it: resync
  // when it changes elsewhere, such as a 401 or another tab signing out.
  useEffect(() => {
    const sync = () => {
      setSession(readSession());
    };

    window.addEventListener(SESSION_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(SESSION_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const signIn = useCallback((next: Session) => {
    writeSession(next);
    setSession(next);
  }, []);

  const signOut = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ session, isAuthenticated: session !== null, signIn, signOut }),
    [session, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
