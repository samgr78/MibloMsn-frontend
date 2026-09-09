import { useCallback, useState, type FormEvent } from "react";
import type { z } from "zod";
import type { FieldErrors } from "../api/ApiError";
import { zodIssuesToFieldErrors } from "./fieldErrors";

type UseZodFormOptions<TSchema extends z.ZodObject> = {
  schema: TSchema;
  initialValues: z.input<TSchema>;
  onSubmit: (values: z.output<TSchema>) => Promise<void> | void;
  /** Turns a submit failure into field errors. What it cannot place is left
   *  to the caller, usually a toast. */
  onError?: (error: unknown) => FieldErrors | undefined;
};

type UseZodFormResult<TSchema extends z.ZodObject> = {
  values: z.input<TSchema>;
  errors: FieldErrors;
  isSubmitting: boolean;
  setField: (name: keyof z.input<TSchema> & string, value: unknown) => void;
  setErrors: (errors: FieldErrors) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  reset: () => void;
};

/**
 * The app's only form engine: controlled fields, Zod validation, and API
 * errors merged in. Values survive a failed submit, so nothing is lost.
 */
export function useZodForm<TSchema extends z.ZodObject>({
  schema,
  initialValues,
  onSubmit,
  onError,
}: UseZodFormOptions<TSchema>): UseZodFormResult<TSchema> {
  const [values, setValues] = useState<z.input<TSchema>>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = useCallback(
    (name: keyof z.input<TSchema> & string, value: unknown) => {
      setValues((current) => ({ ...current, [name]: value }));
      // A field's error clears as soon as the user edits it.
      setErrors((current) => {
        if (current[name] === undefined) return current;
        const { [name]: _removed, ...rest } = current;
        return rest;
      });
    },
    [],
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const parsed = schema.safeParse(values);

      if (!parsed.success) {
        setErrors(zodIssuesToFieldErrors(parsed.error));
        return;
      }

      setErrors({});
      setIsSubmitting(true);

      void (async () => {
        try {
          await onSubmit(parsed.data);
        } catch (error: unknown) {
          setErrors(onError?.(error) ?? {});
        } finally {
          setIsSubmitting(false);
        }
      })();
    },
    [schema, values, onSubmit, onError],
  );

  return { values, errors, isSubmitting, setField, setErrors, handleSubmit, reset };
}
