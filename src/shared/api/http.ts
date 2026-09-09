import { z } from "zod";
import { env } from "../lib/env";
import { ApiError, type FieldErrors } from "./ApiError";

export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

/** `shared/` must not know about `features/`: the app injects these at startup. */
type HttpHandlers = {
  getToken: () => string | null;
  onUnauthorized: () => void;
};

let handlers: HttpHandlers = {
  getToken: () => null,
  onUnauthorized: () => {},
};

export function configureHttp(next: Partial<HttpHandlers>): void {
  handlers = { ...handlers, ...next };
}

export type RequestOptions<TSchema extends z.ZodType> = {
  /** Expected response schema. Required: typing is not validating. */
  schema: TSchema;
  method?: HttpMethod | undefined;
  body?: unknown;
  signal?: AbortSignal | undefined;
  /** Attaches the session token when there is one. */
  auth?: boolean | undefined;
  /** False on /auth/*, where a 401 means bad credentials, not an expired session. */
  logoutOn401?: boolean | undefined;
};

/** The backend reports errors as `{ error: "..." }`. */
const ErrorPayloadSchema = z.object({ error: z.string() }).loose();

/** Per-field errors, when the backend sends them. */
const FieldErrorPayloadSchema = z
  .object({ fieldErrors: z.record(z.string(), z.string()) })
  .loose();

function buildUrl(path: string): string {
  return `${env.VITE_API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function buildHeaders(options: RequestOptions<z.ZodType>): Headers {
  const headers = new Headers();

  // FormData sets its own Content-Type, boundary included.
  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth !== false) {
    const token = handlers.getToken();
    if (token !== null) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  return headers;
}

// `RequestInit.body` takes `null`, not `undefined`, under exactOptionalPropertyTypes.
function buildBody(body: unknown): BodyInit | null {
  if (body === undefined) return null;
  if (body instanceof FormData) return body;
  return JSON.stringify(body);
}

async function readPayload(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;

  const text = await response.text();
  if (text.length === 0) return undefined;

  try {
    // `JSON.parse` returns `any`; the annotation narrows it to `unknown`.
    const payload: unknown = JSON.parse(text);
    return payload;
  } catch {
    // An HTML error page or a misconfigured proxy: not JSON.
    throw new ApiError("invalid_response", { status: response.status });
  }
}

function toApiError(status: number, payload: unknown): ApiError {
  const errorPayload = ErrorPayloadSchema.safeParse(payload);
  const fieldPayload = FieldErrorPayloadSchema.safeParse(payload);

  const fieldErrors: FieldErrors = fieldPayload.success
    ? fieldPayload.data.fieldErrors
    : {};

  return new ApiError(ApiError.codeFromStatus(status), {
    status,
    fieldErrors,
    ...(errorPayload.success ? { message: errorPayload.data.error } : {}),
  });
}

/** The single network exit point: URL, token, body, HTTP status, then Zod schema. */
export async function fetchJson<TSchema extends z.ZodType>(
  path: string,
  options: RequestOptions<TSchema>,
): Promise<z.infer<TSchema>> {
  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      method: options.method ?? "GET",
      headers: buildHeaders(options),
      body: buildBody(options.body),
      ...(options.signal ? { signal: options.signal } : {}),
    });
  } catch (cause) {
    // A deliberate cancellation is not a user-facing error.
    if (cause instanceof DOMException && cause.name === "AbortError") {
      throw cause;
    }
    throw new ApiError("network");
  }

  const payload = await readPayload(response);

  // `fetch` does not reject on 404 or 500.
  if (!response.ok) {
    if (response.status === 401 && options.logoutOn401 !== false) {
      handlers.onUnauthorized();
    }
    throw toApiError(response.status, payload);
  }

  const parsed = options.schema.safeParse(payload);

  if (!parsed.success) {
    // A malformed response becomes a displayed error, never a crash further down.
    throw new ApiError("invalid_response", {
      status: response.status,
      message: `Réponse inattendue du serveur : ${z.prettifyError(parsed.error)}`,
    });
  }

  return parsed.data;
}
