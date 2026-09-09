import { SessionSchema, type Session } from "./api/auth.schemas";

const STORAGE_KEY = "miblomsn.session";

/** Emitted on every session change, including from `fetchJson` on a 401. */
export const SESSION_CHANGED_EVENT = "miblomsn:session-changed";

function notifyChange(): void {
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}

/**
 * Storage is a boundary like the network: its content can be hand-edited.
 * An invalid session is wiped rather than propagated.
 */
export function readSession(): Session | null {
  let raw: string | null;

  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Private browsing or storage disabled: carry on without a session.
    return null;
  }

  if (raw === null) {
    return null;
  }

  try {
    const parsed = SessionSchema.safeParse(JSON.parse(raw));

    if (!parsed.success) {
      clearSession();
      return null;
    }

    return parsed.data;
  } catch {
    clearSession();
    return null;
  }
}

export function writeSession(session: Session): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Without storage the session dies on reload, but the tab still works.
  }
  notifyChange();
}

export function clearSession(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear if storage is unavailable.
  }
  notifyChange();
}

export function readToken(): string | null {
  return readSession()?.token ?? null;
}
