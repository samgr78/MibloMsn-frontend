import { Button } from "../Button/Button";
import styles from "./Feedback.module.css";
import { cx } from "../../lib/cx";

type ErrorBoxProps = {
  message: string;
  onRetry?: (() => void) | undefined;
};

/** `role="alert"`: announced to screen readers, and findable by role in tests. */
export function ErrorBox({ message, onRetry }: ErrorBoxProps) {
  return (
    <div role="alert" className={styles.block}>
      <span className={cx(styles.icon, styles.iconError)} aria-hidden="true">
        !
      </span>
      <span className={styles.title}>Une erreur est survenue</span>
      <p className={styles.message}>{message}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Réessayer
        </Button>
      ) : null}
    </div>
  );
}
