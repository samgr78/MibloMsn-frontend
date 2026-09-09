import { useState, type ReactNode } from "react";
import { Button } from "../Button/Button";
import { Dialog } from "../Dialog/Dialog";

type ConfirmDeleteButtonProps = {
  /** False hides the button. Comfort only: the API is what refuses. */
  canDelete: boolean;
  /** Accessible name of the trigger. */
  label: string;
  title: string;
  confirmLabel: string;
  busyLabel?: string;
  busy: boolean;
  /** The confirmation closes when the returned promise settles, success or
   *  failure; the error itself is reported by the mutation. */
  onConfirm: () => Promise<unknown>;
  children: ReactNode;
};

/**
 * Delete in two steps: a trigger, then a confirmation.
 *
 * One component for posts and comments alike: what differs between them
 * is a label and a mutation, not a behaviour.
 */
export function ConfirmDeleteButton({
  canDelete,
  label,
  title,
  confirmLabel,
  busyLabel = "Suppression…",
  busy,
  onConfirm,
  children,
}: ConfirmDeleteButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  async function confirm(): Promise<void> {
    try {
      await onConfirm();
    } catch {
      // Nothing to do: the mutation has already told the user.
    } finally {
      setIsConfirming(false);
    }
  }

  if (!canDelete) {
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        aria-label={label}
        disabled={busy}
        onClick={() => {
          setIsConfirming(true);
        }}
      >
        🗑
      </Button>

      {/* Monté seulement à l'ouverture : un <dialog> fermé garde ses
          boutons dans le DOM, et « Supprimer » y deviendrait ambigu. */}
      {isConfirming ? (
        <Dialog
          open
          title={title}
          icon="🗑"
          confirmLabel={confirmLabel}
          busyLabel={busyLabel}
          busy={busy}
          onCancel={() => {
            setIsConfirming(false);
          }}
          onConfirm={() => {
            void confirm();
          }}
        >
          {children}
        </Dialog>
      ) : null}
    </>
  );
}

