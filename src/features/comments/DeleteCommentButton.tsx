import { useState, type ReactElement } from 'react'
import {
  deleteComment,
  getDeleteCommentErrorMessage,
} from './deleteComment.api.ts'

type DeleteCommentButtonProps = {
  commentId: string
  onDeleted: () => void
}

export function DeleteCommentButton({
  commentId,
  onDeleted,
}: DeleteCommentButtonProps): ReactElement {
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  async function handleDelete(): Promise<void> {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return
    }

    setIsDeleting(true)
    setErrorMessage('')
    try {
      await deleteComment(commentId)
      onDeleted()
    } catch (error: unknown) {
      setErrorMessage(getDeleteCommentErrorMessage(error))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="profile-comment-delete">
      <button
        type="button"
        disabled={isDeleting}
        onClick={() => void handleDelete()}
      >
        <span aria-hidden="true">×</span>
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>
      {errorMessage && <p role="alert">{errorMessage}</p>}
    </div>
  )
}

