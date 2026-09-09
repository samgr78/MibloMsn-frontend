import { z } from "zod";

// Config is a boundary too: validate at startup rather than discover an
// empty URL on the first request.
const EnvSchema = z.object({
  VITE_API_BASE_URL: z.url(),
});

const parsed = EnvSchema.safeParse(import.meta.env);

if (!parsed.success) {
  throw new Error(
    `Configuration invalide (.env.local) : ${z.prettifyError(parsed.error)}`,
  );
}

export const env = parsed.data;
