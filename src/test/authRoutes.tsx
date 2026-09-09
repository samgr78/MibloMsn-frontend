import { Route, Routes } from "react-router-dom";
import { GuestRoute } from "../app/GuestRoute";
import { ProtectedRoute } from "../app/ProtectedRoute";
import { LoginPage } from "../features/auth/pages/LoginPage";

export const PROTECTED_LABEL = "Page protégée";
export const OTHER_PROTECTED_LABEL = "Autre page protégée";

/**
 * Minimal route tree mirroring the app: public pages behind `GuestRoute`,
 * protected ones behind `ProtectedRoute`.
 *
 * The protected screens are markers, and there are two of them on
 * purpose: with only one, a "back to where I was going" test would pass
 * even if the remembered path were ignored.
 */
export function AuthRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/feed" element={<p>{PROTECTED_LABEL}</p>} />
        <Route path="/parametres" element={<p>{OTHER_PROTECTED_LABEL}</p>} />
      </Route>
    </Routes>
  );
}
