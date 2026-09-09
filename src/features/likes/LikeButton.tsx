import { useState, type ReactElement } from 'react'
import type { Post } from '../feed/post.schema.ts'
import { getLikeErrorMessage, updatePostLike } from './likes.api.ts'
import { hasStoredLike, storeLike } from './likes.storage.ts'

type LikeButtonProps = {
  post: Post
}

export function LikeButton({ post }: LikeButtonProps): ReactElement {
  const initiallyLiked = post.likedByMe || hasStoredLike(post.id)
  const [isLiked, setIsLiked] = useState<boolean>(initiallyLiked)
  const [likeCount, setLikeCount] = useState<number>(post.likeCount)
  const [isPending, setIsPending] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  async function toggleLike(): Promise<void> {
    if (isPending) {
      return
    }

    const nextIsLiked = !isLiked
    const nextLikeCount = Math.max(0, likeCount + (nextIsLiked ? 1 : -1))

    setIsLiked(nextIsLiked)
    setLikeCount(nextLikeCount)
    setErrorMessage('')
    setIsPending(true)

    try {
      await updatePostLike(post.id, nextIsLiked)
      storeLike(post.id, nextIsLiked)
    } catch (error: unknown) {
      setIsLiked(isLiked)
      setLikeCount(likeCount)
      setErrorMessage(getLikeErrorMessage(error))
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="post-like">
      <button
        type="button"
        className={`post-like-button${isLiked ? ' post-like-button--active' : ''}`}
        aria-label={isLiked ? 'Remove my like' : 'Like this post'}
        aria-pressed={isLiked}
        disabled={isPending}
        onClick={() => void toggleLike()}
      >
        <span className="post-like-icon" aria-hidden="true">
          {isLiked ? '♥' : '♡'}
        </span>
        <span>{likeCount}</span>
      </button>

      {errorMessage && (
        <span className="post-like-error" role="alert">
          {errorMessage}
        </span>
      )}
    </div>
  )
}
