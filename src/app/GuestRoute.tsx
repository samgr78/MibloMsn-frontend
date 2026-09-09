import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import { readRedirectTarget } from "../features/auth/redirectTarget";

/**
 * Keeps a signed-in user off /login and /register.
 *
 * This guard alone decides where an authenticated user goes. Letting the
 * form navigate as well raced with it, and the path `ProtectedRoute` had
 * remembered was the one that lost.
 */
export function GuestRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to={readRedirectTarget(location.state)} replace />;
  }

  return <Outlet />;
}
