import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { AuthProvider } from "../features/auth/AuthProvider";
import { clearSession, readToken } from "../features/auth/session.storage";
import { configureHttp } from "../shared/api/http";
import { createQueryClient } from "../shared/api/queryClient";
import { ToastProvider } from "../shared/ui/Toast/ToastProvider";

// Wired at import time, before the first render, so an early request
// already carries the token.
//
// `clearSession` is enough to handle a 401: it emits SESSION_CHANGED_EVENT
// and the route guard redirects. No imperative navigation, so no loop.
configureHttp({
  getToken: readToken,
  onUnauthorized: clearSession,
});

type AppProvidersProps = {
  children: ReactNode;
  /** Injected by tests, which disable retries so failures surface at once. */
  queryClient?: QueryClient;
};

export function AppProviders({ children, queryClient }: AppProvidersProps) {
  // Created once: `useState(fn)`, not `useState(fn())`.
  const [defaultClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient ?? defaultClient}>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
