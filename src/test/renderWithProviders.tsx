import { QueryClient } from "@tanstack/react-query";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";
import { AppProviders } from "../app/providers";
import type { Session } from "../features/auth/api/auth.schemas";
import { writeSession } from "../features/auth/session.storage";

type Options = Omit<RenderOptions, "wrapper"> & {
  route?: string;
  /** Session installed before mounting. It goes through real storage and
   *  the same validated read as in production, so a test cannot forge a
   *  session the app would reject. */
  session?: Session;
};

/** Test client: no retries, so an expected error surfaces at once, and
 *  `gcTime: 0` so no test inherits the previous one's cache. */
function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

/** Mounts a component with the app's real provider stack, on a memory router. */
export function renderWithProviders(
  ui: ReactElement,
  { route = "/", session, ...options }: Options = {},
): RenderResult {
  const queryClient = createTestQueryClient();

  // Before render: `AuthProvider` reads storage in its lazy initialiser.
  if (session !== undefined) {
    writeSession(session);
  }

  return render(ui, {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[route]}>
        <AppProviders queryClient={queryClient}>{children}</AppProviders>
      </MemoryRouter>
    ),
    ...options,
  });
}
