import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/api/queryKeys";
import { fetchUser } from "../api/users.api";

export function useUser(userId: string) {
  return useQuery({
    queryKey: queryKeys.user(userId),
    // `signal` comes from TanStack Query: moving to another profile
    // cancels this request, so it cannot land late.
    queryFn: ({ signal }) => fetchUser(userId, signal),
  });
}
