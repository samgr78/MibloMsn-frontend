import type { ReactNode } from "react";
import { EmptyState } from "../ui/Feedback/EmptyState";
import { ErrorBox } from "../ui/Feedback/ErrorBox";
import { Spinner } from "../ui/Feedback/Spinner";
import type { ScreenState } from "./screenState";

type ScreenStateViewProps<T> = {
  state: ScreenState<T>;
  /** Renders the success case, with data guaranteed to be non-empty. */
  children: (data: T) => ReactNode;
  loading?: ReactNode;
  empty?: ReactNode;
};

/**
 * The four UI states, rendered in one place for the whole app.
 *
 * The `default` branch is a compile-time guard: add a status to
 * `ScreenState` without handling it here and the build fails.
 */
export function ScreenStateView<T>({
  state,
  children,
  loading,
  empty,
}: ScreenStateViewProps<T>) {
  switch (state.status) {
    case "loading":
      return <>{loading ?? <Spinner />}</>;

    case "error":
      return <ErrorBox message={state.message} onRetry={state.retry} />;

    case "empty":
      return <>{empty ?? <EmptyState title="Rien à afficher pour le moment" />}</>;

    case "success":
      return <>{children(state.data)}</>;

    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}
