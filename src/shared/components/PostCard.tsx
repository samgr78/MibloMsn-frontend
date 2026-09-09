import type { ReactElement } from 'react'
import { resolveApiUrl } from '../../api/axios.tsx'
import type { Post } from '../../features/feed/post.schema.ts'

type PostCardProps = {
  post: Post
}

export function PostCard({ post }: PostCardProps): ReactElement {
  return (
    <article className="post-card">
      <header className="post-card-header">
        <strong>{post.author.username}</strong>
        <time dateTime={post.createdAt}>
          {new Date(post.createdAt).toLocaleDateString()}
        </time>
      </header>

      <p>{post.content}</p>

      {post.imageUrl && (
        <img
          className="post-card-image"
          src={resolveApiUrl(post.imageUrl)}
          alt=""
          loading="lazy"
        />
      )}

      <footer className="post-card-stats">
        <span>{post.likeCount} likes</span>
        <span>{post.commentCount} comments</span>
      </footer>
    </article>
  )
}
