import { z } from "zod";

/**
 * What the app keeps of a signed-in user.
 *
 * The email is left out on purpose: Zod drops undeclared keys, so even
 * though the API returns more, nothing extra reaches storage.
 */
export const AuthenticatedUserSchema = z.object({
  id: z.string().min(1),
  username: z.string().min(1),
});

export const SessionSchema = z.object({
  token: z.string().min(1),
  user: AuthenticatedUserSchema,
});

/** Shared response of /auth/register and /auth/login. */
export const AuthResponseSchema = SessionSchema;

export type AuthenticatedUser = z.infer<typeof AuthenticatedUserSchema>;
export type Session = z.infer<typeof SessionSchema>;

const PASSWORD_MIN = 8;

export const RegisterSchema = z.object({
  email: z.email({ message: "Adresse email invalide" }),
  username: z
    .string()
    .trim()
    .min(3, { message: "Au moins 3 caractères" })
    .max(30, { message: "30 caractères maximum" }),
  password: z
    .string()
    .min(PASSWORD_MIN, { message: `Au moins ${PASSWORD_MIN} caractères` })
    .max(128, { message: "128 caractères maximum" }),
});

export const LoginSchema = z.object({
  email: z.email({ message: "Adresse email invalide" }),
  password: z.string().min(1, { message: "Mot de passe requis" }),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
