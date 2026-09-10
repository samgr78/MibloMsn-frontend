import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from 'react'
import { Link, useParams } from 'react-router-dom'
import Form from '../../shared/components/Form.tsx'
import { PostCard } from '../../shared/components/PostCard.tsx'
import type { PostDetail as PostDetailData } from '../feed/post.schema.ts'
import {
  createPostComment,
  fetchPostDetail,
  getPostDetailApiError,
} from './postDetail.api.ts'
import '../feed/PostFeed.css'
import './PostDetail.css'
import { getCurrentUserId } from '../auth/session.ts'
import { DeleteCommentButton } from '../comments/DeleteCommentButton.tsx'

type DetailState =
  | { status: 'loading' }
  | { status: 'not-found' }
  | { status: 'error'; message: string }
  | { status: 'success'; post: PostDetailData }

function formatCommentDate(createdAt: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(createdAt))
}

function PostDetail(): ReactElement {
  const { postId } = useParams<{ postId: string }>()
  const [state, setState] = useState<DetailState>({ status: 'loading' })
  const [commentContent, setCommentContent] = useState<string>('')
  const [commentError, setCommentError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  useEffect(() => {
    if (!postId) {
      return
    }

    const controller = new AbortController()
    void fetchPostDetail(postId, controller.signal)
      .then((post) => setState({ status: 'success', post }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return
        }
        const apiError = getPostDetailApiError(error)
        setState(
          apiError.status === 404
            ? { status: 'not-found' }
            : { status: 'error', message: apiError.message },
        )
      })
    return () => controller.abort()
  }, [postId])

  function updateComment(event: ChangeEvent<HTMLTextAreaElement>): void {
    setCommentContent(event.currentTarget.value)
    setCommentError('')
  }

  async function submitComment(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    const content = commentContent.trim()
    if (!postId || content.length === 0) {
      setCommentError('Write a comment before sending it.')
      return
    }

    setIsSubmitting(true)
    setCommentError('')
    try {
      const newComment = await createPostComment(postId, content)
      setState((currentState) =>
        currentState.status === 'success'
          ? {
              status: 'success',
              post: {
                ...currentState.post,
                comments: [...currentState.post.comments, newComment],
                commentCount: currentState.post.commentCount + 1,
              },
            }
          : currentState,
      )
      setCommentContent('')
    } catch (error: unknown) {
      setCommentError(getPostDetailApiError(error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!postId) {
    return (
      <section className="post-detail-message" role="alert">
        <h1>Post not found</h1>
        <p>The post URL is invalid.</p>
        <Link to="/feed">Return to feed</Link>
      </section>
    )
  }

  if (state.status === 'loading') {
    return <p className="post-detail-message">Loading post...</p>
  }

  if (state.status === 'not-found') {
    return (
      <section className="post-detail-message" role="alert">
        <h1>Post not found</h1>
        <p>This post does not exist or has been deleted.</p>
        <Link to="/feed">Return to feed</Link>
      </section>
    )
  }

  if (state.status === 'error') {
    return (
      <section className="post-detail-message" role="alert">
        <h1>Unable to open this post</h1>
        <p>{state.message}</p>
        <Link to="/feed">Return to feed</Link>
      </section>
    )
  }

  return (
    <div className="post-detail-page">
      <Link className="post-detail-back" to="/feed">‹ Back to feed</Link>
      <div className="post-detail-columns">
        <section className="post-detail-post" aria-label="Post">
          <PostCard post={state.post} linkToDetail={false} />
        </section>

        <aside className="post-detail-comments" aria-label="Comments">
          <header className="post-detail-comments-title">
            <span aria-hidden="true">💬</span>
            <h1>Comments ({state.post.commentCount})</h1>
          </header>

          <div className="post-detail-comment-list">
            {state.post.comments.length === 0 ? (
              <p className="post-detail-empty">No comments yet. Start the conversation!</p>
            ) : (
              <ul>
                {state.post.comments.map((comment) => (
                  <li key={comment.id}>
                    <header>
                      <span className="post-detail-comment-avatar" aria-hidden="true">
                        {comment.author.username.charAt(0).toUpperCase()}
                      </span>
                      <strong>{comment.author.username}</strong>
                      <time dateTime={comment.createdAt}>
                        {formatCommentDate(comment.createdAt)}
                      </time>
                    </header>
                    <p>{comment.content}</p>
                    {comment.author.id === getCurrentUserId() && (
                      <DeleteCommentButton
                        commentId={comment.id}
                        onDeleted={() => setState((current) => current.status === 'success'
                          ? {
                              status: 'success',
                              post: {
                                ...current.post,
                                comments: current.post.comments.filter((item) => item.id !== comment.id),
                                commentCount: Math.max(0, current.post.commentCount - 1),
                              },
                            }
                          : current)}
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Form className="post-detail-comment-form" onSubmit={submitComment}>
            <label htmlFor="post-comment">Write a comment</label>
            <textarea
              id="post-comment"
              name="content"
              value={commentContent}
              onChange={updateComment}
              maxLength={500}
              rows={4}
              placeholder="Type your message here..."
              required
            />
            <div className="post-detail-comment-actions">
              <span>{commentContent.length}/500</span>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send'}
              </button>
            </div>
            {commentError && <p role="alert">{commentError}</p>}
          </Form>
        </aside>
      </div>
    </div>
  )
}

export default PostDetail
