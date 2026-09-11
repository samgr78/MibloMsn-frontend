import { HttpResponse, http } from 'msw'
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

  test('envoie une publication avec image au format multipart', async () => {
    server.use(http.post('*/posts', async ({ request }) => {
      expect(request.headers.get('content-type')).toContain('multipart/form-data')
      const requestBody = await request.text()
      expect(requestBody).toContain('name="content"')
      expect(requestBody).toContain('Publication avec image')
      expect(requestBody).toContain('name="image"; filename=')
      expect(requestBody).toContain('Content-Type: image/png')

      return HttpResponse.json({
        ...feedPost,
        id: 'post-with-image',
        content: 'Publication avec image',
        imageUrl: '/uploads/photo.png',
      }, { status: 201 })
    }))
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: () => 'blob:post-preview',
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: () => undefined,
    })
    const user = userEvent.setup()
    renderFeed()
    await screen.findByText(feedPost.content)

    await user.click(screen.getByRole('button', { name: 'Create a post' }))
    await user.type(screen.getByLabelText('Content'), 'Publication avec image')
    await user.upload(
      screen.getByLabelText('Image (optional)'),
      new File(['image contents'], 'photo.png', { type: 'image/png' }),
    )
    await user.click(screen.getByRole('button', { name: 'Publish' }))

    expect(await screen.findByText('Post created successfully.')).toBeInTheDocument()
    expect(screen.getByText('Publication avec image')).toBeInTheDocument()
  })
})
