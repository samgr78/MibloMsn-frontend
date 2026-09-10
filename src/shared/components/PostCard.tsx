import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { resolveApiUrl } from '../../api/axios.tsx'
import type { Post } from '../../features/feed/post.schema.ts'
import { LikeButton } from '../../features/likes/LikeButton.tsx'
import { DeletePostButton } from '../../features/feed/DeletePostButton.tsx'

type PostCardProps = {
  post: Post
  onLikeChange?: (isLiked: boolean) => void
  onDelete?: () => void
  linkToDetail?: boolean
}

function formatPostDate(createdAt: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(createdAt))
}

export function PostCard({
  post,
  onLikeChange,
  onDelete,
  linkToDetail = true,
}: PostCardProps): ReactElement {
  const authorInitial = post.author.username.charAt(0).toUpperCase()

  const postBody = (
    <div className="post-card-body">
      <p className="post-card-content">{post.content}</p>

      {post.imageUrl && (
        <div className="post-card-media">
          <img
            className="post-card-image"
            src={resolveApiUrl(post.imageUrl)}
            alt={`Publication de ${post.author.username}`}
            loading="lazy"
          />
        </div>
      )}
    </div>
  )

  return (
    <article className="post-card">
      <header className="post-card-header">
        <Link className="post-card-author" to={`/profile/${post.author.id}`}>
          <span className="post-card-avatar" aria-hidden="true">
            {authorInitial}
          </span>
          <div className="post-card-identity">
            <strong>{post.author.username}</strong>
            <span className="post-card-status">Online</span>
          </div>
        </Link>

        <time className="post-card-date" dateTime={post.createdAt}>
          {formatPostDate(post.createdAt)}
        </time>
      </header>
      {linkToDetail ? (
        <Link className="post-card-detail-link" to={`/posts/${post.id}`}>{postBody}</Link>
      ) : postBody}

      <footer className="post-card-stats">
        <LikeButton post={post} onLikeChange={onLikeChange} />
        <span>
          <strong>Comments:</strong> {post.commentCount}
        </span>
        {onDelete && <DeletePostButton postId={post.id} onDeleted={onDelete} />}
      </footer>
    </article>
  )
}
