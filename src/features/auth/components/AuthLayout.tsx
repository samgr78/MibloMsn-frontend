import type { ReactNode } from "react";
import { Window } from "../../../shared/ui/Window/Window";
import styles from "./AuthLayout.module.css";

type AuthLayoutProps = {
  title: string;
  tagline: string;
  children: ReactNode;
};

/** Shared frame for the sign-in and sign-up screens. */
export function AuthLayout({ title, tagline, children }: AuthLayoutProps) {
  return (
    <main className={styles.screen}>
      <div className={styles.window}>
        <Window title={title} icon="💬">
          <div className={styles.brand}>
            <span className={styles.logo} aria-hidden="true">
              🦋
            </span>
            <span className={styles.brandName}>MibloMSN</span>
            <span className={styles.tagline}>{tagline}</span>
          </div>
          {children}
        </Window>
      </div>
    </main>
  );
}
