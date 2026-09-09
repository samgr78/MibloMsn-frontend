export const DEFAULT_TARGET = "/feed";

/**
 * Where to send a user who has just authenticated.
 *
 * `ProtectedRoute` stores the refused path in `state.from`. Only an
 * internal path is accepted: a forged `from` must not turn signing in
 * into an open redirect.
 */
export function readRedirectTarget(state: unknown): string {
  // `in` is enough to surface the property for TypeScript.
  if (typeof state === "object" && state !== null && "from" in state) {
    const { from } = state;

    if (typeof from === "string" && from.startsWith("/") && !from.startsWith("//")) {
      return from;
    }
  }

  return DEFAULT_TARGET;
}
