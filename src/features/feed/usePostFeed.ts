import { isCancel } from 'axios'
import { useEffect, useState } from 'react'
import { fetchPostsPage } from './post.api.ts'
import type { Post } from './post.schema.ts'

type FeedState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty' }
  | { status: 'success'; posts: Post[]; totalPages: number }

type StoredFeedState = FeedState & {
  requestPage: number
}

export function usePostFeed(page: number, limit: number): FeedState {
  const [state, setState] = useState<StoredFeedState>({
    status: 'loading',
    requestPage: page,
  })

  useEffect(() => {
    const controller = new AbortController()

    void fetchPostsPage(page, limit, controller.signal)
      .then((response) => {
        setState(
          response.posts.length === 0
            ? { status: 'empty', requestPage: page }
            : {
                status: 'success',
                posts: response.posts,
                totalPages: response.totalPages,
                requestPage: page,
              },
        )
      })
      .catch((error: unknown) => {
        if (!isCancel(error)) {
          setState({
            status: 'error',
            message: 'Impossible de charger le fil',
            requestPage: page,
          })
        }
      })

    return () => controller.abort()
  }, [page, limit])

  return state.requestPage === page ? state : { status: 'loading' }
}
