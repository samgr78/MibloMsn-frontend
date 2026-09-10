import { useState, type ReactElement } from 'react'
import { getCurrentUserId } from '../auth/session.ts'
import { PostCard } from '../../shared/components/PostCard.tsx'
import CreatePost from './CreatePost.tsx'
import { usePostFeed, type FeedState } from './usePostFeed.ts'
import type { Post } from './post.schema.ts'
import './PostFeed.css'

const ITEMS_PER_PAGE = 20

type FeedContentProps = {
  currentPage: number
  state: FeedState
  createdPosts: Post[]
  deletedPostIds: Set<string>
  onDelete: (postId: string) => void
  onPreviousPage: () => void
  onNextPage: () => void
}

function FeedContent({
  currentPage,
  state,
  createdPosts,
  deletedPostIds,
  onDelete,
  onPreviousPage,
  onNextPage,
}: FeedContentProps): ReactElement {
  if (state.status === 'loading') return <p>Chargement du fil...</p>
  if (state.status === 'error') return <p role="alert">{state.message}</p>

  const serverPosts = state.status === 'success' ? state.posts : []
  const posts = (currentPage === 1 ? [...createdPosts, ...serverPosts] : serverPosts)
    .filter((post, index, allPosts) =>
      !deletedPostIds.has(post.id) && allPosts.findIndex((item) => item.id === post.id) === index)
  const totalPages = state.status === 'success' ? state.totalPages : 1
  const isChangingPage = state.status === 'success' && state.isChangingPage

  if (posts.length === 0) return <p>Aucun post pour le moment.</p>

  return (
    <>
      {isChangingPage && <p className="post-feed-refresh" role="status">Chargement de la page...</p>}
      {state.status === 'success' && state.pageError && (
        <p className="post-feed-page-error" role="alert">{state.pageError}</p>
      )}
      <ul className="post-feed-list" aria-busy={isChangingPage}>
        {posts.map((post) => (
          <li key={post.id}>
            <PostCard
              post={post}
              onDelete={post.author.id === getCurrentUserId() ? () => onDelete(post.id) : undefined}
            />
          </li>
        ))}
      </ul>
      <div className="post-feed-pagination">
        <button type="button" disabled={currentPage === 1 || isChangingPage} onClick={onPreviousPage}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button type="button" disabled={currentPage >= totalPages || isChangingPage} onClick={onNextPage}>
          Next
        </button>
      </div>
    </>
  )
}

function PostFeed(): ReactElement {
  const [currentPage, setCurrentPage] = useState(1)
  const [createdPosts, setCreatedPosts] = useState<Post[]>([])
  const [deletedPostIds, setDeletedPostIds] = useState<Set<string>>(new Set())
  const state = usePostFeed(currentPage, ITEMS_PER_PAGE)

  function handlePostCreated(post: Post): void {
    setCurrentPage(1)
    setCreatedPosts((posts) => [post, ...posts])
  }

  function handlePostDeleted(postId: string): void {
    setDeletedPostIds((ids) => new Set(ids).add(postId))
    setCreatedPosts((posts) => posts.filter((post) => post.id !== postId))
  }

  return (
    <div className="post-feed">
      <CreatePost onPostCreated={handlePostCreated} />
      <FeedContent
        currentPage={currentPage}
        state={state}
        createdPosts={createdPosts}
        deletedPostIds={deletedPostIds}
        onDelete={handlePostDeleted}
        onPreviousPage={() => setCurrentPage((page) => Math.max(1, page - 1))}
        onNextPage={() => setCurrentPage((page) => page + 1)}
      />
    </div>
  )
}

export default PostFeed
