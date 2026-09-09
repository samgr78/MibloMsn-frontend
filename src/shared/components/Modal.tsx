import {
  useId,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
} from 'react'
import './Modal.css'

type ModalProps = ComponentPropsWithoutRef<'div'> & {
    isOpen: boolean
    title: string
    onClose: () => void
    children?: ReactNode
}

function Modal({
  isOpen,
  title,
  onClose,
  children,
  className,
  ...containerProps
}: ModalProps): ReactElement | null {
  const titleId = useId()

  if (!isOpen) {
    return null
  }

  const modalClassName = ['modal-dialog', className].filter(Boolean).join(' ')

  return (
    <div className="modal-backdrop">
      <div
        {...containerProps}
        className={modalClassName}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          className="modal-close-button"
          type="button"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </div>
  )
}

export default Modal
export type { ModalProps }
