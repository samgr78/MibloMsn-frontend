import { cx } from "../../lib/cx";
import styles from "./StatusDot.module.css";

export type PresenceStatus = "online" | "away" | "busy" | "offline";

const LABELS: Readonly<Record<PresenceStatus, string>> = {
  online: "En ligne",
  away: "Absent",
  busy: "Occupé",
  offline: "Hors ligne",
};

export function StatusDot({ status }: { status: PresenceStatus }) {
  return (
    <span
      className={cx(styles.dot, styles[status])}
      role="img"
      aria-label={LABELS[status]}
      title={LABELS[status]}
    />
  );
}
