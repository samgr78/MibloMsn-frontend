import { useId } from "react";
import { cx } from "../../lib/cx";
import styles from "./Field.module.css";

export type FieldKind = "text" | "email" | "password" | "textarea" | "file";

type FieldProps = {
  label: string;
  kind?: FieldKind;
  name: string;
  value?: string;
  error?: string | undefined;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
  showCount?: boolean;
  rows?: number;
  /** Accepted MIME types, `file` variant only. */
  accept?: string;
  onValueChange?: (value: string) => void;
  onFileChange?: (file: File | null) => void;
};

/**
 * The app's only form field.
 *
 * It carries accessibility once for all: a `<label for>` bound to the
 * control, `aria-invalid`, and `aria-describedby` pointing at the error
 * message, which is itself a `role="alert"`.
 */
export function Field({
  label,
  kind = "text",
  name,
  value,
  error,
  hint,
  required = false,
  disabled = false,
  placeholder,
  autoComplete,
  maxLength,
  showCount = false,
  rows = 3,
  accept,
  onValueChange,
  onFileChange,
}: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const hasError = error !== undefined && error.length > 0;

  const describedBy =
    cx(hasError && errorId, hint !== undefined && hintId) || undefined;

  const shared = {
    id,
    name,
    disabled,
    required,
    "aria-invalid": hasError,
    ...(describedBy !== undefined ? { "aria-describedby": describedBy } : {}),
  } as const;

  const length = value?.length ?? 0;

  return (
    <div className={styles.root}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {required ? (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      {kind === "textarea" ? (
        <textarea
          {...shared}
          className={cx(styles.control, styles.textarea, hasError && styles.invalid)}
          value={value ?? ""}
          rows={rows}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={(event) => onValueChange?.(event.target.value)}
        />
      ) : kind === "file" ? (
        <input
          {...shared}
          type="file"
          className={cx(styles.control, styles.file, hasError && styles.invalid)}
          accept={accept}
          onChange={(event) => onFileChange?.(event.target.files?.[0] ?? null)}
        />
      ) : (
        <input
          {...shared}
          type={kind}
          className={cx(styles.control, hasError && styles.invalid)}
          value={value ?? ""}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={maxLength}
          onChange={(event) => onValueChange?.(event.target.value)}
        />
      )}

      <div className={styles.footerRow}>
        {hasError ? (
          <span id={errorId} role="alert" className={styles.error}>
            {error}
          </span>
        ) : hint !== undefined ? (
          <span id={hintId} className={styles.hint}>
            {hint}
          </span>
        ) : null}

        {showCount && maxLength !== undefined ? (
          <span className={cx(styles.count, length > maxLength && styles.countOver)}>
            {length} / {maxLength}
          </span>
        ) : null}
      </div>
    </div>
  );
}
