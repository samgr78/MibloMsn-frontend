import { useContext } from "react";
import { AuthContext } from "../AuthContext";
import type { AuthContextValue } from "../auth.types";

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuth doit être utilisé à l'intérieur de <AuthProvider>");
  }

  return context;
}
