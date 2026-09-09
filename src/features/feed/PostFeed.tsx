import { useState, type ReactElement } from 'react'
import { PostCard } from '../../shared/components/PostCard.tsx'
import CreatePost from './CreatePost.tsx'
import { usePostFeed, type FeedState } from './usePostFeed.ts'
import './PostFeed.css'

const ITEMS_PER_PAGE = 20

type FeedContentProps = {
  currentPage: number
  state: FeedState
  onPreviousPage: () => void
  onNextPage: () => void
}

function FeedContent({
  currentPage,
  state,
  onPreviousPage,
  onNextPage,
}: FeedContentProps): ReactElement {
  switch (state.status) {
    case 'loading':
      return <p>Chargement du fil...</p>

    case 'error':
      return <p role="alert">{state.message}</p>

    case 'empty':
      return <p>Aucun post pour le moment.</p>

    case 'success':
      return (
        <>
          <ul className="post-feed-list">
            {state.posts.map((post) => (
              <li key={post.id}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>

          <div className="post-feed-pagination">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={onPreviousPage}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {state.totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= state.totalPages}
              onClick={onNextPage}
            >
              Next
            </button>
          </div>
        </>
      )

    default: {
      const exhaustiveState: never = state
      return exhaustiveState
    }
  }
}

function PostFeed(): ReactElement {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [refreshVersion, setRefreshVersion] = useState<number>(0)
  const state = usePostFeed(currentPage, ITEMS_PER_PAGE, refreshVersion)

  function showPreviousPage(): void {
    setCurrentPage((previousPage) => previousPage - 1)
  }

  function showNextPage(): void {
    setCurrentPage((previousPage) => previousPage + 1)
  }

  function refreshFeedAfterCreation(): void {
    setCurrentPage(1)
    setRefreshVersion((previousVersion) => previousVersion + 1)
  }

  return (
    <div className="post-feed">
      <CreatePost onPostCreated={refreshFeedAfterCreation} />
      <FeedContent
        currentPage={currentPage}
        state={state}
        onPreviousPage={showPreviousPage}
        onNextPage={showNextPage}
      />
    </div>
  )
}

export default PostFeed
