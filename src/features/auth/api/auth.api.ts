import { fetchJson } from "../../../shared/api/http";
import {
  AuthResponseSchema,
  type LoginInput,
  type RegisterInput,
  type Session,
} from "./auth.schemas";

/**
 * `logoutOn401: false`: here a 401 means bad credentials, not an expired
 * session. Signing out would loop the redirect on /login.
 */
export function register(input: RegisterInput, signal?: AbortSignal): Promise<Session> {
  return fetchJson("/auth/register", {
    method: "POST",
    body: input,
    schema: AuthResponseSchema,
    auth: false,
    logoutOn401: false,
    signal,
  });
}

export function login(input: LoginInput, signal?: AbortSignal): Promise<Session> {
  return fetchJson("/auth/login", {
    method: "POST",
    body: input,
    schema: AuthResponseSchema,
    auth: false,
    logoutOn401: false,
    signal,
  });
}
