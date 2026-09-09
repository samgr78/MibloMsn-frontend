import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import styles from "./Window.module.css";

export type WindowVariant = "main" | "dialog" | "panel";

type WindowProps = {
  title: string;
  variant?: WindowVariant;
  /** Decorative glyph shown in the title bar. */
  icon?: string;
  /** Title-bar buttons (close, refresh…). */
  actions?: ReactNode;
  footer?: ReactNode;
  /** Drops the body padding, for lists that handle their own. */
  flush?: boolean;
  children: ReactNode;
};

/** The visual frame of the whole app. Pages, side panels and dialogs are
 *  variants of it, not separate components. */
export function Window({
  title,
  variant = "main",
  icon,
  actions,
  footer,
  flush = false,
  children,
}: WindowProps) {
  return (
    <section
      className={cx(styles.root, styles[variant], flush && styles.flush)}
      aria-label={title}
    >
      <header className={styles.titleBar}>
        {icon !== undefined ? (
          <span className={styles.titleIcon} aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <h2 className={styles.title}>{title}</h2>
        {actions !== undefined ? (
          <div className={styles.titleActions}>{actions}</div>
        ) : null}
      </header>

      <div className={styles.body}>{children}</div>

      {footer !== undefined ? <footer className={styles.footer}>{footer}</footer> : null}
    </section>
  );
}
