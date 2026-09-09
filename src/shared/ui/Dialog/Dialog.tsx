import { useEffect, useRef, type ReactNode } from "react";
import { Button, type ButtonVariant } from "../Button/Button";
import { Window } from "../Window/Window";
import styles from "./Dialog.module.css";

type DialogProps = {
  open: boolean;
  title: string;
  icon?: string;
  confirmLabel?: string;
  /** Confirm button label while the action is running. */
  busyLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ButtonVariant;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children: ReactNode;
};

/** Confirmation box on the native `<dialog>`: focus trap, Escape key and
 *  backdrop come from the browser rather than being reimplemented. */
export function Dialog({
  open,
  title,
  icon = "❓",
  confirmLabel = "Confirmer",
  busyLabel = "Patientez…",
  cancelLabel = "Annuler",
  confirmVariant = "danger",
  busy = false,
  onConfirm,
  onCancel,
  children,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  // Syncing with the DOM is what an effect is for.
  useEffect(() => {
    const element = ref.current;
    if (element === null) return;

    if (open && !element.open) {
      element.showModal();
    } else if (!open && element.open) {
      element.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <Window
        variant="dialog"
        title={title}
        icon={icon}
        footer={
          <>
            <Button variant="secondary" onClick={onCancel} disabled={busy}>
              {cancelLabel}
            </Button>
            <Button variant={confirmVariant} onClick={onConfirm} disabled={busy}>
              {busy ? busyLabel : confirmLabel}
            </Button>
          </>
        }
      >
        <p className={styles.message}>{children}</p>
      </Window>
    </dialog>
  );
}
