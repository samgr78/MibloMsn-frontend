import { fetchJson } from "../../../shared/api/http";
import { PublicUserSchema, type PublicUser } from "./users.schemas";

export function fetchUser(userId: string, signal?: AbortSignal): Promise<PublicUser> {
  return fetchJson(`/users/${userId}`, { schema: PublicUserSchema, signal });
}
