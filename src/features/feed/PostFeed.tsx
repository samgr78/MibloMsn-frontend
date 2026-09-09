import { useState, type ReactElement } from 'react'
import { PostCard } from '../../shared/components/PostCard.tsx'
import { usePostFeed } from './usePostFeed.ts'
import './PostFeed.css'

const ITEMS_PER_PAGE = 20

function PostFeed(): ReactElement {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const state = usePostFeed(currentPage, ITEMS_PER_PAGE)

  switch (state.status) {
    case 'loading':
      return <p>Chargement du fil...</p>

    case 'error':
      return <p role="alert">{state.message}</p>

    case 'empty':
      return <p>Aucun post pour le moment.</p>

    case 'success':
      return (
        <div className="post-feed">
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
              onClick={() => setCurrentPage((previousPage) => previousPage - 1)}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {state.totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= state.totalPages}
              onClick={() => setCurrentPage((previousPage) => previousPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )

    default: {
      const exhaustiveState: never = state
      return exhaustiveState
    }
  }
}

export default PostFeed
