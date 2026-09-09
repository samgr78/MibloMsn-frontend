import { QueryClient } from "@tanstack/react-query";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";
import { AppProviders } from "../app/providers";

type Options = Omit<RenderOptions, "wrapper"> & {
  route?: string;
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
  { route = "/", ...options }: Options = {},
): RenderResult {
  const queryClient = createTestQueryClient();

  return render(ui, {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[route]}>
        <AppProviders queryClient={queryClient}>{children}</AppProviders>
      </MemoryRouter>
    ),
    ...options,
  });
}
