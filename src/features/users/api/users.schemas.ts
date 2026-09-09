import { z } from "zod";

/**
 * A user's public profile.
 *
 * Deliberately three fields: Zod drops undeclared keys, so even if the
 * API returned the email, or the password hash as it once did, none of it
 * would reach the components.
 */
export const PublicUserSchema = z.object({
  id: z.string().min(1),
  username: z.string().min(1),
  createdAt: z.iso.datetime(),
});

export type PublicUser = z.infer<typeof PublicUserSchema>;
