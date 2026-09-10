import { HttpResponse, http } from 'msw'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, test } from 'vitest'
import { feedPost } from '../../test/handlers.ts'
import { server } from '../../test/server.ts'
import PostDetail from './PostDetail.tsx'

function renderDetail(postId = 'post-1'): void {
  localStorage.setItem('token', 'test-token')
  localStorage.setItem('userId', 'user-1')
  render(
    <MemoryRouter initialEntries={[`/posts/${postId}`]}>
      <Routes><Route path="/posts/:postId" element={<PostDetail />} /></Routes>
    </MemoryRouter>,
  )
}

describe('PostDetail', () => {
  test('ajoute un commentaire dynamiquement', async () => {
    server.use(
      http.get('*/posts/post-1', () => HttpResponse.json({
        ...feedPost,
        commentCount: 0,
        comments: [],
      })),
      http.post('*/posts/post-1/comments', () => HttpResponse.json({
        id: 'comment-1',
        content: 'Nouveau commentaire',
        createdAt: '2026-09-10T09:00:00.000Z',
        author: { id: 'user-1', username: 'alice' },
      }, { status: 201 })),
    )
    const user = userEvent.setup()
    renderDetail()

    await screen.findByText(feedPost.content)
    await user.type(screen.getByLabelText('Write a comment'), 'Nouveau commentaire')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(await screen.findByText('Nouveau commentaire')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Comments (1)' })).toBeInTheDocument()
  })

  test('affiche un écran dédié pour un post inexistant', async () => {
    server.use(http.get('*/posts/missing', () =>
      HttpResponse.json({ error: 'Post not found' }, { status: 404 })))
    renderDetail('missing')

    expect(await screen.findByRole('heading', { name: 'Post not found' })).toBeInTheDocument()
  })
})
