import type { Session } from "./api/auth.schemas";

export type AuthContextValue = {
  session: Session | null;
  isAuthenticated: boolean;
  signIn: (session: Session) => void;
  signOut: () => void;
};
