import { useMutation } from "@tanstack/react-query";
import { login } from "../api/auth.api";
import type { LoginInput, Session } from "../api/auth.schemas";
import { useAuth } from "./useAuth";

export function useLogin() {
  const { signIn } = useAuth();

  return useMutation<Session, unknown, LoginInput>({
    mutationFn: (input) => login(input),
    onSuccess: signIn,
  });
}
