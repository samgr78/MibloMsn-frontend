import { useEffect, useState, type ReactElement } from 'react'
import type { Post } from '../feed/post.schema.ts'
import { getLikeErrorMessage, updatePostLike } from './likes.api.ts'

type LikeButtonProps = {
  post: Post
  onLikeChange?: (isLiked: boolean) => void
}

type LikeChangedDetail = {
  postId: string
  likedByMe: boolean
  likeCount: number
}

const LIKE_CHANGED_EVENT = 'miblo:like-changed'

function publishLikeState(detail: LikeChangedDetail): void {
  window.dispatchEvent(new CustomEvent<LikeChangedDetail>(LIKE_CHANGED_EVENT, { detail }))
}

function isLikeChangedDetail(value: unknown): value is LikeChangedDetail {
  return typeof value === 'object' && value !== null &&
    'postId' in value && typeof value.postId === 'string' &&
    'likedByMe' in value && typeof value.likedByMe === 'boolean' &&
    'likeCount' in value && typeof value.likeCount === 'number'
}

export function LikeButton({ post, onLikeChange }: LikeButtonProps): ReactElement {
  const [isLiked, setIsLiked] = useState<boolean>(post.likedByMe)
  const [likeCount, setLikeCount] = useState<number>(post.likeCount)
  const [isPending, setIsPending] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    function synchronize(event: Event): void {
      if (!(event instanceof CustomEvent) || !isLikeChangedDetail(event.detail)) return
      const { detail } = event
      if (detail.postId === post.id) {
        setIsLiked(detail.likedByMe)
        setLikeCount(detail.likeCount)
      }
    }
    window.addEventListener(LIKE_CHANGED_EVENT, synchronize)
    return () => window.removeEventListener(LIKE_CHANGED_EVENT, synchronize)
  }, [post.id])

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
    publishLikeState({ postId: post.id, likedByMe: nextIsLiked, likeCount: nextLikeCount })

    try {
      const likeState = await updatePostLike(post.id, nextIsLiked)
      setIsLiked(likeState.likedByMe)
      setLikeCount(likeState.likeCount)
      publishLikeState(likeState)
      onLikeChange?.(likeState.likedByMe)
    } catch (error: unknown) {
      setIsLiked(isLiked)
      setLikeCount(likeCount)
      publishLikeState({ postId: post.id, likedByMe: isLiked, likeCount })
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
