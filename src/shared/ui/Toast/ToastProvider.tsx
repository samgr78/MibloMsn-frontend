import { useCallback, useMemo, useState, type ReactNode } from "react";
import { cx } from "../../lib/cx";
import { ToastContext } from "./ToastContext";
import styles from "./Toast.module.css";
import type { ShowToastInput, Toast, ToastContextValue } from "./toast.types";

const AUTO_DISMISS_MS = 6000;

/** The MSN pop-up, and the channel for API errors: a failed action tells
 *  the user instead of leaving a blank screen. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ReadonlyArray<Toast>>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ variant = "info", title, message }: ShowToastInput) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, variant, title, message }]);
      window.setTimeout(() => {
        dismissToast(id);
      }, AUTO_DISMISS_MS);
    },
    [dismissToast],
  );

  // Without useMemo the context value changes on every render.
  const value = useMemo<ToastContextValue>(
    () => ({ showToast, dismissToast }),
    [showToast, dismissToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className={styles.stack} aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cx(styles.toast, styles[toast.variant])}
            role={toast.variant === "error" ? "alert" : "status"}
          >
            <div className={styles.content}>
              <span className={styles.title}>{toast.title}</span>
              {toast.message !== undefined ? (
                <span className={styles.message}>{toast.message}</span>
              ) : null}
            </div>
            <button
              type="button"
              className={styles.close}
              aria-label="Fermer la notification"
              onClick={() => {
                dismissToast(toast.id);
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
