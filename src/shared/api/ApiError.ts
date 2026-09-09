/** The only error type components deal with: `fetchJson` never throws anything else. */
export type ApiErrorCode =
  | "network"
  | "invalid_response"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "validation"
  | "server"
  | "unknown";

export type FieldErrors = Readonly<Record<string, string>>;

const USER_MESSAGES: Readonly<Record<ApiErrorCode, string>> = {
  network: "Impossible de joindre le serveur. Vérifiez votre connexion.",
  invalid_response: "Le serveur a renvoyé une réponse inattendue.",
  unauthorized: "Session expirée. Reconnectez-vous.",
  forbidden: "Vous n'avez pas les droits pour cette action.",
  not_found: "Cet élément n'existe pas ou a été supprimé.",
  conflict: "Cette valeur est déjà utilisée.",
  validation: "Certaines informations sont invalides.",
  server: "Le serveur a rencontré un problème. Réessayez dans un instant.",
  unknown: "Une erreur inattendue est survenue.",
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  /** 0 when no HTTP response was received (network down, CORS). */
  readonly status: number;
  readonly fieldErrors: FieldErrors;

  constructor(
    code: ApiErrorCode,
    options: { status?: number; message?: string; fieldErrors?: FieldErrors } = {},
  ) {
    super(options.message ?? USER_MESSAGES[code]);
    this.name = "ApiError";
    this.code = code;
    this.status = options.status ?? 0;
    this.fieldErrors = options.fieldErrors ?? {};
  }

  static is(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }

  static codeFromStatus(status: number): ApiErrorCode {
    switch (status) {
      case 401:
        return "unauthorized";
      case 403:
        return "forbidden";
      case 404:
        return "not_found";
      case 409:
        return "conflict";
      case 400:
      case 422:
        return "validation";
      default:
        return status >= 500 ? "server" : "unknown";
    }
  }
}

/** Displayable message for any caught value — `catch` never guarantees a type. */
export function toUserMessage(error: unknown): string {
  if (ApiError.is(error)) {
    return error.message;
  }
  return USER_MESSAGES.unknown;
}
