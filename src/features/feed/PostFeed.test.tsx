import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test } from 'vitest'
import {
  emptyFeedHandler,
  errorFeedHandler,
  feedPost,
  invalidFeedHandler,
  loadingFeedHandler,
  successFeedHandler,
} from '../../test/handlers.ts'
import { server } from '../../test/server.ts'
import PostFeed from './PostFeed.tsx'

function renderFeed(): void {
  localStorage.setItem('token', 'test-token')
  localStorage.setItem('userId', 'user-1')
  render(<MemoryRouter><PostFeed /></MemoryRouter>)
}

describe('PostFeed', () => {
  test('affiche l’état de chargement', () => {
    server.use(loadingFeedHandler)
    renderFeed()
    expect(screen.getByText('Chargement du fil...')).toBeInTheDocument()
  })

  test('affiche l’état d’erreur', async () => {
    server.use(errorFeedHandler)
    renderFeed()
    expect(await screen.findByRole('alert')).toHaveTextContent('Impossible de charger le fil.')
  })

  test('affiche l’état vide', async () => {
    server.use(emptyFeedHandler)
    renderFeed()
    expect(await screen.findByText('Aucun post pour le moment.')).toBeInTheDocument()
  })

  test('affiche l’état de succès', async () => {
    server.use(successFeedHandler)
    renderFeed()
    expect(await screen.findByText(feedPost.content)).toBeInTheDocument()
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument()
  })

  test('transforme une réponse API invalide en état d’erreur', async () => {
    server.use(invalidFeedHandler)
    renderFeed()
    expect(await screen.findByRole('alert')).toHaveTextContent('Impossible de charger le fil.')
  })

  test('valide le formulaire comme le ferait un utilisateur', async () => {
    const user = userEvent.setup()
    renderFeed()
    await screen.findByText(feedPost.content)
    await user.click(screen.getByRole('button', { name: 'Create a post' }))
    await user.click(screen.getByRole('button', { name: 'Publish' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Write something before publishing.')
  })
})
