import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import styles from "./Feedback.module.css";

export type EmptyStateVariant = "empty" | "not-found";

type EmptyStateProps = {
  variant?: EmptyStateVariant;
  title: string;
  message?: string;
  action?: ReactNode;
};

const ICONS: Readonly<Record<EmptyStateVariant, string>> = {
  empty: "☺",
  "not-found": "?",
};

const ICON_CLASSES: Readonly<Record<EmptyStateVariant, string | undefined>> = {
  empty: styles.iconEmpty,
  "not-found": styles.iconNotFound,
};

export function EmptyState({
  variant = "empty",
  title,
  message,
  action,
}: EmptyStateProps) {
  return (
    <div className={styles.block}>
      <span className={cx(styles.icon, ICON_CLASSES[variant])} aria-hidden="true">
        {ICONS[variant]}
      </span>
      <span className={styles.title}>{title}</span>
      {message !== undefined ? <p className={styles.message}>{message}</p> : null}
      {action}
    </div>
  );
}
