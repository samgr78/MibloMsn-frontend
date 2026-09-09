import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";

/**
 * No token, no access.
 *
 * The requested path is kept in `state.from` to return to after signing
 * in. `replace` keeps the protected page out of history, which the Back
 * button would otherwise loop on.
 */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
