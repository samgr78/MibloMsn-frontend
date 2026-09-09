import { cx } from "../../lib/cx";
import { StatusDot, type PresenceStatus } from "../StatusDot/StatusDot";
import styles from "./Avatar.module.css";

export type AvatarSize = "sm" | "md" | "lg";

type AvatarProps = {
  username: string;
  size?: AvatarSize;
  status?: PresenceStatus;
};

// The API has no avatar: derive a stable one from the username.
const PALETTE = ["#2F6FC4", "#7A4FBF", "#C4571E", "#1E8E6A", "#B23A6B", "#3D7A2E"] as const;

function hueFor(username: string): string {
  let hash = 0;
  for (const char of username) {
    hash = (hash * 31 + (char.codePointAt(0) ?? 0)) % 100_000;
  }
  return PALETTE[hash % PALETTE.length] ?? PALETTE[0];
}

function initialsFor(username: string): string {
  return [...username].slice(0, 2).join("");
}

export function Avatar({ username, size = "md", status }: AvatarProps) {
  return (
    <span className={cx(styles.root, styles[size])}>
      <span
        className={styles.tile}
        style={{ backgroundColor: hueFor(username) }}
        aria-hidden="true"
      >
        {initialsFor(username)}
      </span>
      {status !== undefined ? (
        <span className={styles.status}>
          <StatusDot status={status} />
        </span>
      ) : null}
    </span>
  );
}
