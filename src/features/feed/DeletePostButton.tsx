import { useState, type ReactElement } from 'react'
import { deletePost, getDeletePostErrorMessage } from './deletePost.api.ts'

type DeletePostButtonProps = {
  postId: string
  onDeleted: () => void
}

export function DeletePostButton({
  postId,
  onDeleted,
}: DeletePostButtonProps): ReactElement {
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  async function handleDelete(): Promise<void> {
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete this post?',
    )
    if (!confirmed) {
      return
    }

    setIsDeleting(true)
    setErrorMessage('')
    try {
      await deletePost(postId)
      onDeleted()
    } catch (error: unknown) {
      setErrorMessage(getDeletePostErrorMessage(error))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="post-delete">
      <button
        type="button"
        className="post-delete-button"
        disabled={isDeleting}
        onClick={() => void handleDelete()}
      >
        <span aria-hidden="true">×</span>
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>
      {errorMessage && (
        <span className="post-delete-error" role="alert">
          {errorMessage}
        </span>
      )}
    </div>
  )
}

