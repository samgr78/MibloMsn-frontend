import { HttpResponse, http } from 'msw'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, test } from 'vitest'
import { feedPost } from '../../test/handlers.ts'
import { server } from '../../test/server.ts'
import Profile from './Profile.tsx'

describe('Profile', () => {
  test('affiche un profil tiers sans actions réservées au propriétaire', async () => {
    server.use(
      http.get('*/users/user-2', () => HttpResponse.json({
        id: 'user-2',
        username: 'bob',
        createdAt: '2026-09-01T08:00:00.000Z',
      })),
      http.get('*/users/user-2/posts', () => HttpResponse.json({
        posts: [{ ...feedPost, author: { id: 'user-2', username: 'bob' } }],
      })),
    )
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('userId', 'user-1')
    render(
      <MemoryRouter initialEntries={['/profile/user-2']}>
        <Routes><Route path="/profile/:userId" element={<Profile />} /></Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'bob' })).toBeInTheDocument()
    expect(screen.getByText(feedPost.content)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Account information' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })
})
