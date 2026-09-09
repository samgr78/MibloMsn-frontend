import type { z } from "zod";
import { ApiError, type FieldErrors } from "../api/ApiError";

/** Declarative "this status belongs to this field". The backend sends no
 *  field errors, so they are rebuilt here. */
export type FieldErrorRule = {
  status: number;
  field: string;
  message: string;
};

/** First issue per field; the rest add nothing. */
export function zodIssuesToFieldErrors(error: z.ZodError): FieldErrors {
  const result: Record<string, string> = {};

  for (const issue of error.issues) {
    const [first] = issue.path;
    if (typeof first === "string" && result[first] === undefined) {
      result[first] = issue.message;
    }
  }

  return result;
}

export function apiErrorToFieldErrors(
  error: unknown,
  rules: ReadonlyArray<FieldErrorRule> = [],
): FieldErrors {
  if (!ApiError.is(error)) {
    return {};
  }

  // Field errors from the backend win when there are any.
  if (Object.keys(error.fieldErrors).length > 0) {
    return error.fieldErrors;
  }

  const matched = rules.find((rule) => rule.status === error.status);
  return matched === undefined ? {} : { [matched.field]: matched.message };
}
