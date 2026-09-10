import { delay, http, HttpResponse } from 'msw'
import type { Post } from '../features/feed/post.schema.ts'

export const feedPost: Post = {
  id: 'post-1',
  content: 'Publication de test',
  imageUrl: null,
  createdAt: '2026-09-10T08:00:00.000Z',
  author: { id: 'user-1', username: 'alice' },
  likeCount: 2,
  commentCount: 1,
  likedByMe: false,
}

export const loadingFeedHandler = http.get('*/posts', async () => {
  await delay(10_000)
  return HttpResponse.json({ posts: [feedPost], totalPages: 1 })
})

export const errorFeedHandler = http.get('*/posts', () =>
  HttpResponse.json({ error: 'Database unavailable' }, { status: 500 }))

export const emptyFeedHandler = http.get('*/posts', () =>
  HttpResponse.json({ posts: [], totalPages: 0 }))

export const successFeedHandler = http.get('*/posts', () =>
  HttpResponse.json({ posts: [feedPost], totalPages: 1 }))

export const invalidFeedHandler = http.get('*/posts', () =>
  HttpResponse.json({ posts: [{ unexpected: true }], totalPages: 1 }))

export const handlers = [successFeedHandler]
