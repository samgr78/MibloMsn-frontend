import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import styles from "./List.module.css";

export type ListGap = "none" | "sm" | "md";

type ListProps<T> = {
  items: ReadonlyArray<T>;
  /** Domain id, never the index, which breaks rendering on sort or delete. */
  keyOf: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  gap?: ListGap;
  divided?: boolean;
  label?: string;
};

const GAP_CLASSES: Readonly<Record<ListGap, string | undefined>> = {
  none: styles.gapNone,
  sm: styles.gapSm,
  md: styles.gapMd,
};

/** Generic list. Requiring `keyOf` makes `key={index}` impossible. */
export function List<T>({
  items,
  keyOf,
  renderItem,
  gap = "md",
  divided = false,
  label,
}: ListProps<T>) {
  return (
    <ul
      className={cx(styles.list, GAP_CLASSES[gap], divided && styles.divided)}
      {...(label !== undefined ? { "aria-label": label } : {})}
    >
      {items.map((item) => (
        <li key={keyOf(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
