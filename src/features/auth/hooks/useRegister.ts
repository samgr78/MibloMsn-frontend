import { useMutation } from "@tanstack/react-query";
import { register } from "../api/auth.api";
import type { RegisterInput, Session } from "../api/auth.schemas";
import { useAuth } from "./useAuth";

/** Signing up signs the user in: the API already returns a token. */
export function useRegister() {
  const { signIn } = useAuth();

  return useMutation<Session, unknown, RegisterInput>({
    mutationFn: (input) => register(input),
    onSuccess: signIn,
  });
}
