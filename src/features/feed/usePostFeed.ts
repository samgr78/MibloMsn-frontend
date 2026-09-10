import { isCancel } from 'axios'
import { useEffect, useState } from 'react'
import { fetchPostsPage } from './post.api.ts'
import type { Post } from './post.schema.ts'

export type FeedState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty' }
  | {
      status: 'success'
      posts: Post[]
      totalPages: number
      isChangingPage: boolean
      pageError?: string
      loadedPage: number
    }

export function usePostFeed(page: number, limit: number): FeedState {
  const [state, setState] = useState<FeedState>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    void fetchPostsPage(page, limit, controller.signal)
      .then((response) => {
        setState(response.posts.length === 0
          ? { status: 'empty' }
          : {
              status: 'success',
              posts: response.posts,
              totalPages: response.totalPages,
              isChangingPage: false,
              loadedPage: page,
            })
      })
      .catch((error: unknown) => {
        if (isCancel(error)) return
        setState((current) => current.status === 'success'
          ? {
              ...current,
              isChangingPage: false,
              pageError: 'Impossible de charger cette page.',
            }
          : { status: 'error', message: 'Impossible de charger le fil.' })
      })

    return () => controller.abort()
  }, [page, limit])

  return state.status === 'success' && state.loadedPage !== page
    ? { ...state, isChangingPage: true, pageError: undefined }
    : state
}
