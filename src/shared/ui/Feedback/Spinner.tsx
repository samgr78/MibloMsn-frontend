import { cx } from "../../lib/cx";
import styles from "./Feedback.module.css";

export type SpinnerSize = "inline" | "block";

type SpinnerProps = {
  size?: SpinnerSize;
  label?: string;
};

export function Spinner({ size = "block", label = "Chargement en cours" }: SpinnerProps) {
  if (size === "inline") {
    return (
      <span
        role="status"
        aria-label={label}
        className={cx(styles.spinner, styles.spinnerInline)}
      />
    );
  }

  return (
    <div role="status" className={styles.block}>
      <span className={styles.spinner} />
      <span>{label}…</span>
    </div>
  );
}
